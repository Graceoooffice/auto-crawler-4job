import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Deleting file:', filename);
    await del(filename);
    console.log('File deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in blob delete API:', error);
    return NextResponse.json(
      { error: 'Error deleting file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
