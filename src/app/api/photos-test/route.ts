import { getPhotosWithMetadata } from '@/lib/nextcloud';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const photos = await getPhotosWithMetadata();
    return NextResponse.json({
      success: true,
      photos,
      count: photos.length
    });
  } catch (error) {
    console.error('Error in photos-test API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
