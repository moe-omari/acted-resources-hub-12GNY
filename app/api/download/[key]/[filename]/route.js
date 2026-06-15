import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

const TEMP_DIR = path.join(process.cwd(), 'temp_downloads');

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { key, filename } = resolvedParams;
    
    if (!key) {
      return NextResponse.json({ error: 'Invalid download key' }, { status: 400 });
    }
    
    const tempFilePath = path.join(TEMP_DIR, `${key}.json`);
    
    // Read the temp file
    let fileContent;
    try {
      fileContent = await fs.readFile(tempFilePath, 'utf8');
    } catch (e) {
      return NextResponse.json({ error: 'Download file not found or expired' }, { status: 404 });
    }
    
    const { format, type, data } = JSON.parse(fileContent);
    
    // Clean up temp file
    fs.unlink(tempFilePath).catch((err) => {
      console.warn('Failed to delete temp file:', err);
    });
    
    if (format === 'json') {
      let finalData = data;
      
      // If exporting sites JSON, try to enrich it with the actual polygon geometry contents
      if (type === 'sites' && Array.isArray(data)) {
        const enrichedSites = [];
        for (const site of data) {
          const enriched = { ...site };
          if (site.Boundary_File_Path) {
            try {
              // Remove leading slash to prevent path.join from treating it as an absolute path root
              const relativePath = site.Boundary_File_Path.startsWith('/') 
                ? site.Boundary_File_Path.slice(1) 
                : site.Boundary_File_Path;
              const boundaryFullPath = path.join(process.cwd(), 'public', relativePath);
              const boundaryContent = await fs.readFile(boundaryFullPath, 'utf8');
              enriched.Polygon = JSON.parse(boundaryContent);
            } catch (err) {
              console.warn(`Could not read dynamic boundary polygon for site: ${site.Site_Code}`, err.message);
              enriched.Polygon = null;
            }
          } else {
            enriched.Polygon = null;
          }
          enrichedSites.push(enriched);
        }
        finalData = enrichedSites;
      }

      const jsonStr = JSON.stringify(finalData, null, 2);
      return new NextResponse(jsonStr, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type === 'coordinates' ? 'Services' : 'Sites');
      
      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
    
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Download delivery error:', error);
    return NextResponse.json({ error: 'Failed to deliver download' }, { status: 500 });
  }
}
