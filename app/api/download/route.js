import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const format = formData.get('format');
    const type = formData.get('type');
    const filename = formData.get('filename');
    const dataStr = formData.get('data');
    
    if (!format || !type || !filename || !dataStr) {
      return new NextResponse(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const data = JSON.parse(dataStr);
    
    if (format === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
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
      
      // Generate buffer on the server
      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
    
    return new NextResponse(JSON.stringify({ error: 'Invalid format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate download file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
