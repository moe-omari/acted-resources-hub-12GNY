import { NextResponse } from 'next/server';
import { deleteBackup } from '../../../../lib/backup-util';

export async function POST(request) {
  try {
    const { backupId } = await request.json();
    if (!backupId) {
      return NextResponse.json({ error: 'backupId is required' }, { status: 400 });
    }
    
    await deleteBackup(backupId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete backup ${backupId}:`, error);
    return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
  }
}
