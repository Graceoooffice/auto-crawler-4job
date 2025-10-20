import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
 
  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required' },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { error: 'File content is required' },
      { status: 400 }
    );
  }
 
  try {
    console.log('Starting file upload:', filename);
    const blob = await put(filename, request.body as ReadableStream, {
      access: 'public',
      addRandomSuffix: false, // 保持文件名不变
    });
 
    console.log('File uploaded successfully:', blob);
    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error in blob upload API:', error);
    return NextResponse.json(
      { error: 'Error uploading file', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
