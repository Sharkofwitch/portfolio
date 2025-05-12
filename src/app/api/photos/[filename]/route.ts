import { NextRequest, NextResponse } from 'next/server';
import { downloadPhoto } from '@/lib/nextcloud';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Use the standard Next.js API route parameters interface
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Extract the filename first to ensure it's properly awaited
    const filename = params.filename;
    
    // Build the src path
    const src = `/photos/${filename}`;
    
    console.log(`[API] Attempting to load photo: ${src} (Filename: ${filename})`);
    
    // First attempt to directly download the image from Nextcloud
    // This is useful for images like "profile.jpg" that might not be in the database
    console.log(`[API] Attempting to directly download from Nextcloud first: ${src}`);
    let buffer = await downloadPhoto(src);
    
    if (buffer) {
      console.log(`[API] Successfully retrieved photo directly from Nextcloud: ${src}`);
      
      // Determine the appropriate content type based on file extension
      let contentType = 'image/jpeg'; // Default
      
      if (filename.toLowerCase().endsWith('.png')) {
        contentType = 'image/png';
      } else if (filename.toLowerCase().endsWith('.svg')) {
        contentType = 'image/svg+xml';
      } else if (filename.toLowerCase().endsWith('.webp')) {
        contentType = 'image/webp';
      } else if (filename.toLowerCase().endsWith('.gif')) {
        contentType = 'image/gif';
      }
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    
    // If direct download failed, check the database
    console.log(`[API] Direct download failed, checking database for: ${src}`);
    const photos = await prisma.photo.findMany({
      where: {
        src
      },
      take: 1
    });

    console.log(`[API] Database query result: ${photos.length > 0 ? 'Found' : 'Not found'} in database`);

    if (photos.length === 0) {
      console.log(`[API] Error: Photo not found in database: ${src}`);
      
      // Redirect to the placeholder image in the public directory
      console.log(`[API] Redirecting to placeholder image`);
      return NextResponse.redirect(new URL('/placeholder-image.svg', request.url));
    }

    // Get photo from storage using the database record
    console.log(`[API] Attempting to download photo from Nextcloud: ${src}`);
    buffer = await downloadPhoto(src);
    
    if (!buffer) {
      console.log(`[API] Error: Photo not found in Nextcloud storage: ${src}`);
      return new NextResponse('Photo not found in storage', { status: 404 });
    }
    
    console.log(`[API] Successfully retrieved photo: ${src}, size: ${buffer.length} bytes`);

    // Determine the appropriate content type based on file extension
    let contentType = 'image/jpeg'; // Default
    
    if (filename.toLowerCase().endsWith('.png')) {
      contentType = 'image/png';
    } else if (filename.toLowerCase().endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else if (filename.toLowerCase().endsWith('.webp')) {
      contentType = 'image/webp';
    } else if (filename.toLowerCase().endsWith('.gif')) {
      contentType = 'image/gif';
    }
    
    // Return photo with appropriate content type
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving photo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
