import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const type = formData.get('type') || 'iec';
    const uploadSubFolder = type === 'boundary' ? 'boundaries' : 'iec';

    // Save folder inside the Next.js public directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadSubFolder);
    
    // Ensure the directories exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Clean up file name: spaces to underscores, remove special characters
    const originalName = file.name || 'unnamed_file';
    const extension = path.extname(originalName);
    
    const customName = formData.get('customName');
    let baseName;
    if (customName) {
      baseName = customName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-\u0600-\u06FF]/g, '');
    } else {
      baseName = path.basename(originalName, extension)
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-\u0600-\u06FF]/g, ''); // keep alphanumeric, dashes, and Arabic chars
    }

    const cleanedFilename = `${baseName}${extension}`;
    const filePath = path.join(uploadDir, cleanedFilename);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${uploadSubFolder}/${cleanedFilename}`;
    return NextResponse.json({ success: true, fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
