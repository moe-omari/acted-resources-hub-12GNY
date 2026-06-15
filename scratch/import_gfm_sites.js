const fs = require('fs');
const path = require('path');

const kmlPath = path.join(__dirname, '..', 'public', 'maps', 'GFM_Sites.kml');
const transPath = path.join(__dirname, '..', 'public', 'maps', 'site_translations.json');
const boundariesDir = path.join(__dirname, '..', 'public', 'uploads', 'boundaries');

// Explicit name mapping to align KML names with service-mapping/page.js and human-friendly translations
const explicitMappings = {
  "Al-Joura Camp": { en: "Al_joura", ar: "الجورة" },
  "Al-Najjar community 1": { en: "Al_Najjar community", ar: "تجمع النجار" },
  "Al Amal camp MA": { en: "Al Amal camp MA", ar: "مخيم الأمل MA" },
  "Al Ihsan camp": { en: "Al-Ihsan Site", ar: "موقع الإحسان" },
  "Pioneers camp": { en: "Pioneer Site", ar: "موقع بيونير" },
  "Wajed camp": { en: "Wajed Site", ar: "موقع واجد" },
  "Aiash camp": { en: "Ayash site", ar: "موقع عياش" },
  "Ajyal Al-Karama": { en: "Ajyal Al-Karama site", ar: "أجيال الكرامة" },
  "Ghawar": { en: "Ghawar Site", ar: "موقع غوار" },
  "Kareem": { en: "Al-Kareem", ar: "الكريم" },
  "Al-Akli Camp": { en: "Al-Akli Site", ar: "موقع العكلي" },
  "Ard Al-Jawafa": { en: "Ard -Aljawafa Site", ar: "موقع أرض الجوافة" },
  "Al-Hurya": { en: "Al-Hurya Site", ar: "موقع الحرية" },
  "Al-Wehda": { en: "Al-wehda", ar: "الوحدة" },
  "Al-Amal and Al-Haya": { en: "Al-Amal and haya", ar: "الأمل والحياة" },
  "Al-Karama site": { en: "AL Karama Site", ar: "موقع الكرامة" },
  "Al-tahrir": { en: "AL Tahrir Site", ar: "موقع التحرير" },
  "Al- Wafaa": { en: "Al-Wafa", ar: "الوفاء" },
  "Al-Awda": { en: "AL Awda", ar: "العودة" },
  "Ahali Al-Junaina": { en: "Ahali AL Junaina", ar: "أهالي الجنينة" },
  "Al-Nour": { en: "Al Nour Site", ar: "موقع النور" },
  "Al-Rayyan": { en: "AL Rayyan", ar: "الريان" },
  "Al-Zaytoon": { en: "AL Zaytoon Site", ar: "موقع الزيتون" },
  "Al-Nahda": { en: "Alnahda site", ar: "موقع النهضة" },
  "Al-Zahraa Site‏": { en: "Al-Zahraa", ar: "الزهراء" },
  "Al-Zahraa Site": { en: "Al-Zahraa", ar: "الزهراء" },
  "Arada Site‏": { en: "Arada", ar: "عرادة" },
  "Arada Site": { en: "Arada", ar: "عرادة" },
  "Al-Amoodi": { en: "Al-Amoody", ar: "العمودي" },
  "Misk & Layan": { en: "Misk and Laian", ar: "مسك وليان" }
};

function normalizeName(str) {
  return str.replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
}

function getBounds(coords) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  coords.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  return { minX, maxX, minY, maxY };
}

async function run() {
  try {
    console.log('Starting GFM Sites Import...');
    
    // Create boundaries dir if not exists
    await fs.promises.mkdir(boundariesDir, { recursive: true });

    // Read existing site translations
    let siteTranslations = {};
    if (fs.existsSync(transPath)) {
      try {
        siteTranslations = JSON.parse(await fs.promises.readFile(transPath, 'utf8'));
        console.log(`Loaded ${Object.keys(siteTranslations).length} existing site translations.`);
      } catch (e) {
        console.warn('Failed to parse existing site_translations.json, starting fresh.', e);
      }
    }

    const kmlContent = await fs.promises.readFile(kmlPath, 'utf8');

    // Parse Placemarks
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let match;
    let processedCount = 0;

    const placemarks = [];

    while ((match = placemarkRegex.exec(kmlContent)) !== null) {
      const content = match[1];
      
      // Extract name
      const nameMatch = content.match(/<name>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/name>/);
      const rawName = nameMatch ? nameMatch[1] : 'Unnamed';
      const name = normalizeName(rawName);
      
      // Extract description
      const descMatch = content.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
      const description = descMatch ? descMatch[1].trim() : '';
      
      // Extract coordinates
      const coordMatch = content.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
      const coordsStr = coordMatch ? coordMatch[1].trim() : '';
      
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

      if (coordinates.length === 0) {
        console.warn(`Placemark "${name}" has no valid coordinates. Skipping.`);
        continue;
      }

      // Check for closed polygon
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coordinates.push([first[0], first[1]]);
      }

      // Find Site Code
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

      // Fallbacks for specific sites
      if (!siteCode) {
        if (name.includes('Al-Zahraa')) siteCode = 'Al-Zahraa';
        else if (name.includes('Arada')) siteCode = 'Arada';
        else if (name.includes('Al-Amoodi')) siteCode = 'Al-Amoody';
        else siteCode = name.replace(/\s+/g, '_');
      }

      // Map translations
      let enName = name;
      let arName = name;
      
      const mapped = explicitMappings[name] || explicitMappings[rawName];
      if (mapped) {
        enName = mapped.en;
        arName = mapped.ar;
      }

      placemarks.push({
        name,
        siteCode,
        enName,
        arName,
        coordinates,
        description
      });
    }

    // Process placemarks. For duplicate siteCodes, we keep the one with more coordinates (e.g. Al Ihsan camp has a degenerate 4-coord version and a real 17-coord version).
    const uniquePlacemarks = {};
    for (const p of placemarks) {
      const existing = uniquePlacemarks[p.siteCode];
      if (!existing || p.coordinates.length > existing.coordinates.length) {
        uniquePlacemarks[p.siteCode] = p;
      }
    }

    for (const siteCode of Object.keys(uniquePlacemarks)) {
      const p = uniquePlacemarks[siteCode];
      const safeSiteCode = p.siteCode.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-\u0600-\u06FF]/g, '');
      const filename = `${safeSiteCode}.geojson`;
      const filePath = path.join(boundariesDir, filename);

      // Create single feature GeoJSON collection
      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [p.coordinates]
            },
            properties: {
              site_code: p.siteCode,
              name: p.siteCode, // Use siteCode for name to align with site_translations key
              description: p.description
            }
          }
        ]
      };

      // Calculate centroid coordinates
      const { minX, maxX, minY, maxY } = getBounds(p.coordinates);
      const centroidLng = parseFloat(((minX + maxX) / 2).toFixed(6));
      const centroidLat = parseFloat(((minY + maxY) / 2).toFixed(6));

      // Write GeoJSON file
      await fs.promises.writeFile(filePath, JSON.stringify(geojson, null, 2), 'utf8');

      // Add/update to translations dictionary
      siteTranslations[p.siteCode] = {
        en: p.enName,
        ar: p.arName,
        boundaryFile: `/uploads/boundaries/${filename}`,
        projectCode: 'GFM',
        location: 'South',
        latitude: centroidLat,
        longitude: centroidLng
      };

      processedCount++;
      console.log(`Processed site: "${p.enName}" (Code: ${p.siteCode}) -> ${filename} Centroid: [${centroidLat}, ${centroidLng}]`);
    }

    // Write updated site translations database
    await fs.promises.writeFile(transPath, JSON.stringify(siteTranslations, null, 2), 'utf8');

    console.log(`Successfully completed import! Processed ${processedCount} unique GFM sites.`);
  } catch (error) {
    console.error('Error importing GFM sites:', error);
  }
}

run();
