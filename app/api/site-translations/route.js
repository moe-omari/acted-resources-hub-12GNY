import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'public', 'maps', 'site_translations.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // If the file doesn't exist yet, return an empty object
    if (error.code === 'ENOENT') {
      return NextResponse.json({});
    }
    console.error('Error reading site translations:', error);
    return NextResponse.json({ error: 'Failed to read site translations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid data format. Expected an object.' }, { status: 400 });
    }
    
    // Ensure parent dir exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing site translations:', error);
    return NextResponse.json({ error: 'Failed to save site translations' }, { status: 500 });
  }
}
