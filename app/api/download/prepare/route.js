import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), 'temp_downloads');

export async function POST(request) {
  try {
    const { format, type, data, filename } = await request.json();
    
    if (!format || !type || !filename || !data) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    
    // Ensure temporary directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true });
    
    // Generate a unique key
    const key = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const filePath = path.join(TEMP_DIR, `${key}.json`);
    
    // Write data to temp file
    await fs.writeFile(filePath, JSON.stringify({ format, type, data, filename }), 'utf8');
    
    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('Failed to prepare download:', error);
    return NextResponse.json({ error: 'Failed to prepare download' }, { status: 500 });
  }
}
