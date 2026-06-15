import { promises as fs } from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function getBackupsList() {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    const backups = [];
    
    for (const f of files) {
      if (f.startsWith('backup_')) {
        const fullPath = path.join(BACKUP_DIR, f);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          // Parse timestamp from format backup_YYYY-MM-DD_HH-mm-ss or backup_YYYY-MM-DD_HH-mm-ss_customName
          const parts = f.replace('backup_', '').split('_');
          const dateStr = parts[0]; // YYYY-MM-DD
          const timeStr = parts[1] ? parts[1].replace(/-/g, ':') : ''; // HH:mm:ss
          
          // Capture the rest of the string as the custom name
          const customNameRaw = parts.slice(2).join('_');
          const customName = customNameRaw ? customNameRaw.replace(/_/g, ' ') : null;
          
          let displayName = `${dateStr} ${timeStr}`;
          if (customName) {
            displayName = `${customName} (${dateStr} ${timeStr})`;
          }
          
          backups.push({
            id: f,
            name: displayName,
            timestamp: stat.birthtime || stat.mtime,
            folder: f,
            customName: customName
          });
        }
      }
    }
    
    // Sort descending by timestamp (latest first)
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error('Failed to read backups directory:', err);
    return [];
  }
}

export async function createBackup(customName = '') {
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/\..+/, '')
    .replace(/:/g, '-'); // e.g. 2026-06-09_13-10-30
    
  // Clean customName to be filesystem safe: allow Arabic, English, spaces, dashes, digits
  const cleanCustomName = customName
    ? customName.trim().replace(/[^\w\s\u0600-\u06FF-]/g, '').replace(/\s+/g, '_')
    : '';

  const folderName = cleanCustomName ? `backup_${timestamp}_${cleanCustomName}` : `backup_${timestamp}`;
  const backupFolder = path.join(BACKUP_DIR, folderName);
  await fs.mkdir(backupFolder, { recursive: true });
  
  const coordSrc = path.join(process.cwd(), 'public', 'maps', 'coordinates.json');
  const transSrc = path.join(process.cwd(), 'public', 'maps', 'site_translations.json');
  const matSrc = path.join(process.cwd(), 'public', 'iec', 'materials.json');
  const uploadsSrc = path.join(process.cwd(), 'public', 'uploads');

  // Load JSON data
  let coordsData = [];
  let transData = {};
  let matData = [];
  try { coordsData = JSON.parse(await fs.readFile(coordSrc, 'utf8')); } catch(e) {}
  try { transData = JSON.parse(await fs.readFile(transSrc, 'utf8')); } catch(e) {}
  try { matData = JSON.parse(await fs.readFile(matSrc, 'utf8')); } catch(e) {}

  // Save clear backup files
  try {
    await fs.writeFile(path.join(backupFolder, 'services.json'), JSON.stringify(coordsData, null, 2));
    await fs.writeFile(path.join(backupFolder, 'sites.json'), JSON.stringify(transData, null, 2));
    await fs.writeFile(path.join(backupFolder, 'iec_materials.json'), JSON.stringify(matData, null, 2));

    // Create combined file for easy reading
    const combined = Object.keys(transData).map(siteKey => {
      const site = transData[siteKey];
      const siteServices = coordsData.filter(c => (c['site name'] || c.siteName) === siteKey);
      return {
        siteCode: siteKey,
        ...site,
        servicesCount: siteServices.length,
        services: siteServices
      };
    });
    await fs.writeFile(path.join(backupFolder, 'sites_and_services_combined.json'), JSON.stringify(combined, null, 2));
  } catch (e) {
    console.warn('Failed to write JSON backup files:', e);
  }

  // Copy uploads recursively
  try {
    const stat = await fs.stat(uploadsSrc);
    if (stat.isDirectory()) {
      await fs.mkdir(path.join(backupFolder, 'uploads'), { recursive: true });
      await fs.cp(uploadsSrc, path.join(backupFolder, 'uploads'), { recursive: true });
    }
  } catch (e) {
    console.warn('uploads backup skipped (empty uploads dir):', e);
  }
  
  return { success: true, id: folderName };
}

export async function restoreBackup(backupId) {
  const backupFolder = path.join(BACKUP_DIR, backupId);
  
  const coordDest = path.join(process.cwd(), 'public', 'maps', 'coordinates.json');
  const transDest = path.join(process.cwd(), 'public', 'maps', 'site_translations.json');
  const matDest = path.join(process.cwd(), 'public', 'iec', 'materials.json');

  // Restore coordinates.json (try new name first, then fallback to old name)
  try {
    await fs.copyFile(path.join(backupFolder, 'services.json'), coordDest);
  } catch (e) {
    try {
      await fs.copyFile(path.join(backupFolder, 'coordinates.json'), coordDest);
    } catch(err) {
      console.warn('Failed to restore coordinates.json:', err);
    }
  }

  // Restore site_translations.json
  try {
    await fs.copyFile(path.join(backupFolder, 'sites.json'), transDest);
  } catch (e) {
    try {
      await fs.copyFile(path.join(backupFolder, 'site_translations.json'), transDest);
    } catch(err) {
      console.warn('Failed to restore site_translations.json:', err);
    }
  }

  // Restore materials.json
  try {
    await fs.copyFile(path.join(backupFolder, 'iec_materials.json'), matDest);
  } catch (e) {
    try {
      await fs.copyFile(path.join(backupFolder, 'materials.json'), matDest);
    } catch(err) {
      console.warn('Failed to restore materials.json:', err);
    }
  }

  // Restore uploads (clear existing and copy back, handle old vs new backups)
  try {
    const uploadsSrc = path.join(backupFolder, 'uploads');
    const stat = await fs.stat(uploadsSrc);
    if (stat.isDirectory()) {
      // Check if it's a new backup (contains 'iec' subfolder) or old backup (contains raw files)
      const hasIecSubfolder = await fs.stat(path.join(uploadsSrc, 'iec')).then(() => true).catch(() => false);
      
      let finalUploadsDest = path.join(process.cwd(), 'public', 'uploads');
      if (!hasIecSubfolder) {
        // It's an old backup, where 'uploads' folder actually meant 'uploads/iec'
        finalUploadsDest = path.join(process.cwd(), 'public', 'uploads', 'iec');
      }

      await fs.rm(finalUploadsDest, { recursive: true, force: true }).catch(() => {});
      await fs.mkdir(finalUploadsDest, { recursive: true });
      await fs.cp(uploadsSrc, finalUploadsDest, { recursive: true });
    }
  } catch (e) {
    console.warn('No uploads to restore or restore failed:', e);
  }
  
  return { success: true };
}

export async function deleteBackup(backupId) {
  const backupFolder = path.join(BACKUP_DIR, backupId);
  try {
    await fs.rm(backupFolder, { recursive: true, force: true });
    return { success: true };
  } catch (err) {
    console.error(`Failed to delete backup folder: ${backupId}`, err);
    throw err;
  }
}
