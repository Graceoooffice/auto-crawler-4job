import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching blobs...');
    const { blobs } = await list();
    console.log('Blobs fetched:', blobs);
    return NextResponse.json(blobs);
  } catch (error) {
    console.error('Error in blob list API:', error);
    return NextResponse.json(
      { error: 'Error fetching files', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
