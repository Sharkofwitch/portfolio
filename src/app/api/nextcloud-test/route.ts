import { NextResponse } from 'next/server';
import { testConnection, getPhotosWithMetadata } from '@/lib/nextcloud';

export async function GET() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Failed to connect to Nextcloud' }, { status: 500 });
    }

    // Try to list photos
    const photos = await getPhotosWithMetadata();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Nextcloud',
      photosCount: photos.length,
      photos: photos.slice(0, 3) // Return first 3 photos as sample
    });
  } catch (error) {
    console.error('Nextcloud test failed:', error);
    return NextResponse.json({ 
      error: 'Failed to test Nextcloud connection',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
