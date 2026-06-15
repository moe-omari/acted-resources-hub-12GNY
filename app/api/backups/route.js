import { NextResponse } from 'next/server';
import { getBackupsList, createBackup } from '../../../lib/backup-util';

export async function GET() {
  try {
    let list = await getBackupsList();
    
    // Check if auto-backup is needed (if no backups exist, or if the latest is > 24 hours old)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    let autoBackupTriggered = false;
    if (list.length === 0) {
      autoBackupTriggered = true;
    } else {
      const latestBackup = list[0];
      const ageMs = now - new Date(latestBackup.timestamp);
      if (ageMs > ONE_DAY_MS) {
        autoBackupTriggered = true;
      }
    }
    
    if (autoBackupTriggered) {
      console.log('Automated daily backup triggered...');
      await createBackup();
      list = await getBackupsList(); // Refresh list
    }
    
    return NextResponse.json({ backups: list, autoBackupTriggered });
  } catch (error) {
    console.error('API backups read error:', error);
    return NextResponse.json({ error: 'Failed to read backups directory' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let customName = '';
    try {
      const body = await request.json();
      customName = body.customName || '';
    } catch (e) {
      // Fallback if no body is passed
    }
    const result = await createBackup(customName);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API backups write error:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}
