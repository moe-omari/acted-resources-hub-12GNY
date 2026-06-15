const fs = require('fs');
const path = require('path');

const kmlPath = path.join(__dirname, '..', 'public', 'maps', 'GFM_Sites.kml');
const kmlContent = fs.readFileSync(kmlPath, 'utf8');

// Load old backup sites.json for lookup
const backupSitesPath = path.join(__dirname, '..', 'backups', 'backup_2026-06-10_08-57-42', 'sites.json');
let oldSites = {};
if (fs.existsSync(backupSitesPath)) {
  oldSites = JSON.parse(fs.readFileSync(backupSitesPath, 'utf8'));
}

// Simple regex parser for KML Placemarks
const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
let match;
const placemarks = [];

// Clean up name for comparison
function cleanName(str) {
  return str.toLowerCase()
    .replace(/camp/gi, '')
    .replace(/site/gi, '')
    .replace(/community/gi, '')
    .replace(/and/gi, '')
    .replace(/&/gi, '')
    .replace(/[^a-z0-9]/g, '');
}

while ((match = placemarkRegex.exec(kmlContent)) !== null) {
  const content = match[1];
  
  // Extract name
  const nameMatch = content.match(/<name>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/name>/);
  const name = nameMatch ? nameMatch[1].trim() : 'Unnamed';
  
  // Extract description
  const descMatch = content.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
  const description = descMatch ? descMatch[1].trim() : '';
  
  // Extract coordinates
  const coordMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
  const coordsStr = coordMatch ? coordMatch[1].trim() : '';
  
  // Parse coordinates
  const coordinates = coordsStr.split(/\s+/).map(line => {
    const parts = line.split(',');
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        return [lng, lat];
      }
    }
    return null;
  }).filter(Boolean);
  
  let siteCode = '';
  const kysMatch = description.match(/KYS\d+/i) || name.match(/KYS\d+/i);
  if (kysMatch) {
    siteCode = kysMatch[0].toUpperCase();
  } else {
    const siteCodeLabelMatch = description.match(/Site\s+Code\s+([A-Za-z0-9_-]+)/i);
    if (siteCodeLabelMatch) {
      siteCode = siteCodeLabelMatch[1].trim();
    }
  }

  // Fallback site codes
  if (!siteCode) {
    if (name.includes('Al-Zahraa')) {
      siteCode = 'Al-Zahraa';
    } else if (name.includes('Arada')) {
      siteCode = 'Arada';
    } else if (name.includes('Al-Amoodi')) {
      siteCode = 'Al-Amoody';
    } else {
      siteCode = name.replace(/\s+/g, '_');
    }
  }

  // Find English and Arabic names in oldSites
  let enName = name;
  let arName = name;
  let matched = false;
  
  // 1. Direct siteCode match
  if (oldSites[siteCode]) {
    enName = oldSites[siteCode].en;
    arName = oldSites[siteCode].ar;
    matched = true;
  } else {
    // 2. Exact clean name match
    const cName = cleanName(name);
    for (const [key, val] of Object.entries(oldSites)) {
      if (cleanName(key) === cName || cleanName(val.en) === cName) {
        enName = val.en;
        arName = val.ar;
        matched = true;
        break;
      }
    }
  }

  // 3. Substring matching for any missed ones
  if (!matched) {
    const cName = cleanName(name);
    for (const [key, val] of Object.entries(oldSites)) {
      const cKey = cleanName(key);
      const cEn = cleanName(val.en);
      if (cKey.includes(cName) || cName.includes(cKey) || cEn.includes(cName) || cName.includes(cEn)) {
        enName = val.en;
        arName = val.ar;
        matched = true;
        break;
      }
    }
  }

  placemarks.push({
    name,
    siteCode,
    enName,
    arName,
    matched,
    coordsCount: coordinates.length,
    coordinates
  });
}

console.log(`Fuzzy matched ${placemarks.filter(p => p.matched).length} of ${placemarks.length} sites:`);
placemarks.forEach((p, idx) => {
  console.log(`${idx + 1}. KML Name: "${p.name}" -> Code: "${p.siteCode}", English: "${p.enName}", Arabic: "${p.arName}" (Matched: ${p.matched})`);
});
