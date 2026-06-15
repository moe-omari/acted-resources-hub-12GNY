import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function getBounds(coords) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  function walk(arr) {
    if (Array.isArray(arr) && typeof arr[0] === 'number') {
      const [x, y] = arr;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else if (Array.isArray(arr)) {
      arr.forEach(walk);
    }
  }
  walk(coords);
  return { minX, maxX, minY, maxY };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    let geojson;
    try {
      geojson = JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    if (geojson.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
      return NextResponse.json({ error: 'File must be a GeoJSON FeatureCollection' }, { status: 400 });
    }

    const boundariesDir = path.join(process.cwd(), 'public', 'uploads', 'boundaries');
    await fs.mkdir(boundariesDir, { recursive: true });

    const translationsPath = path.join(process.cwd(), 'public', 'maps', 'site_translations.json');
    let siteTranslations = {};
    try {
      siteTranslations = JSON.parse(await fs.readFile(translationsPath, 'utf8'));
    } catch (e) {
      // Ignored if not found
    }

    let processedCount = 0;
    const missingCodes = [];

    for (const feature of geojson.features) {
      const siteCode = feature.properties?.site_code;
      if (!siteCode) {
        continue;
      }

      const safeSiteCode = siteCode.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-\u0600-\u06FF]/g, '');
      const filename = `${safeSiteCode}.geojson`;
      const filePath = path.join(boundariesDir, filename);

      const singleFeatureCollection = {
        type: 'FeatureCollection',
        features: [feature]
      };

      await fs.writeFile(filePath, JSON.stringify(singleFeatureCollection, null, 2));

      // Calculate Centroid
      let centroidLat = null, centroidLng = null;
      if (feature.geometry && feature.geometry.coordinates) {
        const { minX, maxX, minY, maxY } = getBounds(feature.geometry.coordinates);
        if (minX !== Infinity) {
          centroidLng = ((minX + maxX) / 2).toFixed(6);
          centroidLat = ((minY + maxY) / 2).toFixed(6);
        }
      }

      // Update or create site translation
      if (siteTranslations[siteCode]) {
        siteTranslations[siteCode].boundaryFile = `/uploads/boundaries/${filename}`;
        if (centroidLat && centroidLng) {
          siteTranslations[siteCode].latitude = centroidLat;
          siteTranslations[siteCode].longitude = centroidLng;
        }
      } else {
        missingCodes.push(siteCode);
        // Create it automatically
        siteTranslations[siteCode] = {
          en: siteCode,
          ar: siteCode,
          boundaryFile: `/uploads/boundaries/${filename}`,
          projectCode: "",
          location: "North",
          latitude: centroidLat || "",
          longitude: centroidLng || ""
        };
      }
      processedCount++;
    }

    await fs.writeFile(translationsPath, JSON.stringify(siteTranslations, null, 2));

    return NextResponse.json({ 
      success: true, 
      processedCount,
      missingCodesCreated: missingCodes.length
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Failed to process bulk upload' }, { status: 500 });
  }
}
