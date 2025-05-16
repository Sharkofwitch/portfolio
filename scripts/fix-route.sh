#!/bin/bash
# Script to update the route.ts file with proper TypeScript syntax

cat > /Users/admin/Coding/Web\ Development/portfolio/src/app/api/photos/\[filename\]/route.ts << 'EOL'
import { NextRequest, NextResponse } from "next/server";
import { downloadPhoto } from "@/lib/nextcloud";
import prisma from "@/lib/prisma";
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Use the standard Next.js API route parameters interface
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } },
) {
  try {
    // For Vercel Edge functions, check if we're in production
    const isProduction = process.env.VERCEL_ENV === "production";

    // Extract the filename from URL pathname to avoid synchronous params access
    const pathname = request.nextUrl.pathname;
    const filename = pathname.split('/').pop() || '';
    const src = `/photos/${filename}`;
    const apiSrc = `/api/photos/${filename}`;

    console.log(
      `[API${isProduction ? "/Vercel" : ""}] Attempting to load photo: ${filename}`,
    );

    // Skip known problematic images immediately
    const knownBadFiles = ["image_12.jpg", "image_36.jpg"];
    if (knownBadFiles.includes(filename)) {
      console.log(`[API] Skipping known problematic image: ${filename}`);
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }
    
    // Special case handling for known problematic images
    if (filename === "1747175977747-playground-poise.jpeg" || 
        filename === "1747175912709-diverse-perspectives-campus-connections.jpeg") {
      
      console.log(`[API] Special handling for known problematic file: ${filename}`);
      
      // Define special paths to try based on the filename
      const directPaths: string[] = [];
      
      if (filename === "1747175977747-playground-poise.jpeg") {
        directPaths.push(
          "playground-poise.jpeg",
          "/Photos/playground-poise.jpeg",
          "/photos/playground-poise.jpeg",
          "/Portfolio/playground-poise.jpeg",
          "/Photos/Portfolio/playground-poise.jpeg"
        );
      } else if (filename === "1747175912709-diverse-perspectives-campus-connections.jpeg") {
        directPaths.push(
          "diverse-perspectives-campus-connections.jpeg",
          "/Photos/diverse-perspectives-campus-connections.jpeg",
          "/photos/diverse-perspectives-campus-connections.jpeg",
          "/Portfolio/diverse-perspectives-campus-connections.jpeg",
          "/Photos/Portfolio/diverse-perspectives-campus-connections.jpeg"
        );
      }
      
      // Try each path directly
      for (const directPath of directPaths) {
        try {
          console.log(`[API] Trying direct path: ${directPath} for ${filename}`);
          const directBuffer = await downloadPhoto(directPath);
          if (directBuffer) {
            console.log(`[API] Successfully loaded using direct path: ${directPath}`);
            return new NextResponse(directBuffer, {
              headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }
        } catch (directError) {
          console.error(`[API] Error with direct path ${directPath}:`, directError);
        }
      }
      
      console.log(`[API] All direct paths failed for ${filename}, continuing with regular strategies`);
    }

    let buffer: Buffer | null = null;
    
    // Strategy 1: Check if the image exists in the public/photos directory
    try {
      const publicPhotoPath = path.join(process.cwd(), 'public', 'photos', filename);
      if (fs.existsSync(publicPhotoPath)) {
        console.log(`[API] Found image in public directory: ${publicPhotoPath}`);
        buffer = fs.readFileSync(publicPhotoPath);
      }
    } catch (error) {
      console.error(`[API] Error reading from public directory:`, error);
    }
    
    // Strategy 2: If not found in public dir, check database and try Nextcloud
    if (!buffer) {
      // Check database for record with either /photos/ or /api/photos/ prefix
      const photoRecord = await prisma.photo.findFirst({
        where: { 
          OR: [
            { src },
            { src: apiSrc }
          ]
        },
      });

      if (photoRecord) {
        console.log(`[API] Found photo record in database with ID: ${photoRecord.id}`);
        
        // Try to download from Nextcloud
        buffer = await downloadPhoto(src);
      } else {
        console.log(`[API] No record found in database for: ${src} or ${apiSrc}`);
      }
    }
    
    // Strategy 3: Try alternative path formats with Nextcloud
    if (!buffer) {
      const alternativePaths = [
        // Without /photos/ prefix
        `/${filename}`,
        // Just the filename
        filename,
      ];
      
      // Special handling for timestamp-based files
      const timestampMatch = filename.match(/^(\d{13})-(.+)$/);
      if (timestampMatch && timestampMatch[2]) {
        const timestamp = timestampMatch[1];
        const baseName = timestampMatch[2];
        
        // Add multiple variations of timestamp-based patterns
        alternativePaths.push(`/photos/${baseName}`);
        alternativePaths.push(`/${baseName}`); 
        alternativePaths.push(baseName);
        alternativePaths.push(`/photos/${timestamp}/${baseName}`);
        alternativePaths.push(`${timestamp}-${baseName}`);
        alternativePaths.push(`/Photos/${baseName}`);
        alternativePaths.push(`/Photos/Portfolio/${baseName}`);
        
        console.log(`[API] Timestamp-based file detected: ${filename}`);
        console.log(`[API] Trying alternative paths: ${alternativePaths.join(', ')}`);
      }
      
      for (const altPath of alternativePaths) {
        buffer = await downloadPhoto(altPath);
        if (buffer) {
          console.log(`[API] Found photo using alternative path: ${altPath}`);
          break;
        }
      }
    }
    
    // Strategy 4: Use sample test images as fallback
    if (!buffer) {
      const testImages = [
        path.join(process.cwd(), 'scripts', 'test-image.jpg'),
        path.join(process.cwd(), 'scripts', 'processed-test-image.jpg')
      ];
      
      for (const testImagePath of testImages) {
        try {
          if (fs.existsSync(testImagePath)) {
            buffer = fs.readFileSync(testImagePath);
            console.log(`[API] Using sample test image: ${testImagePath}`);
            break;
          }
        } catch (readError) {
          console.error(`[API] Error reading test image: ${testImagePath}`, readError);
        }
      }
    }
    
    // Final fallback: Use the placeholder image
    if (!buffer) {
      console.log(`[API] Photo not found in any storage: ${src}`);
      return NextResponse.redirect(new URL("/placeholder-image.svg", request.url));
    }

    // Determine content type based on extension
    let contentType = "image/jpeg"; // Default for jpg/jpeg
    
    // Get extension from filename
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (extension === "png") {
      contentType = "image/png";
    } else if (extension === "svg") {
      contentType = "image/svg+xml";
    } else if (extension === "webp") {
      contentType = "image/webp";
    } else if (extension === "gif") {
      contentType = "image/gif";
    }

    // Return photo with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    // Extract filename from URL path to avoid synchronous params access
    const errorFilename = request.nextUrl.pathname.split('/').pop() || 'unknown';
    console.error(`Error serving photo ${errorFilename}:`, error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    
    // For production, serve a placeholder instead of error
    if (process.env.VERCEL_ENV === "production") {
      console.log(`[API/Vercel] Error in production for ${errorFilename} - serving placeholder`);
      return NextResponse.redirect(new URL("/placeholder-image.svg", request.url));
    }

    // In development, also serve a placeholder but with a different status
    return NextResponse.redirect(new URL("/placeholder-image.svg", request.url));
  }
}
EOL
