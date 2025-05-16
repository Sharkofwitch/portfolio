// filepath: /Users/admin/Coding/Web Development/portfolio/src/app/api/photos/[filename]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { downloadPhoto } from "@/lib/nextcloud";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Generate a comprehensive list of potential search paths for a given filename
 * This universal approach handles timestamp-prefixed files and various path formats
 */
function generateSearchPaths(filename: string): string[] {
  const searchPaths: string[] = [];

  // Always try the exact filename as provided
  searchPaths.push(filename);
  searchPaths.push(`/${filename}`);

  // Handle timestamp-based filenames (e.g., "1747175977747-playground-poise.jpeg")
  const timestampMatch = filename.match(/^(\d{13})-(.+)$/);

  if (timestampMatch) {
    const timestamp = timestampMatch[1]; // e.g., "1747175977747"
    const baseName = timestampMatch[2]; // e.g., "playground-poise.jpeg"

    // Add base filename variations
    searchPaths.push(baseName);
    searchPaths.push(`/${baseName}`);

    // Add combinations with timestamp
    searchPaths.push(`${timestamp}/${baseName}`);
    searchPaths.push(`/${timestamp}/${baseName}`);
  }

  // Add common folder structure variations
  const filenameWithoutPath = filename.split("/").pop() || filename;

  // Add standard paths with various capitalization patterns
  const pathVariations = [
    "photos",
    "Photos",
    "Portfolio",
    "portfolio",
    "Photos/Portfolio",
    "photos/Portfolio",
    "Photos/portfolio",
    "photos/portfolio",
  ];

  for (const pathVar of pathVariations) {
    searchPaths.push(`${filenameWithoutPath}`); // Just the filename
    searchPaths.push(`${pathVar}/${filenameWithoutPath}`);
    searchPaths.push(`/${pathVar}/${filenameWithoutPath}`);
  }

  // If the filename has timestamp prefix, also try paths with the base name
  if (timestampMatch) {
    const baseName = timestampMatch[2];

    for (const pathVar of pathVariations) {
      searchPaths.push(`${baseName}`); // Just the base name
      searchPaths.push(`${pathVar}/${baseName}`);
      searchPaths.push(`/${pathVar}/${baseName}`);
    }
  }

  // Remove duplicates
  return [...new Set(searchPaths)];
}

// Use the standard Next.js API route parameters interface
export async function GET(
  request: NextRequest,
  // We extract filename from URL path to avoid synchronous params access
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { params }: { params: { filename: string } },
) {
  try {
    // For Vercel Edge functions, check if we're in production
    const isProduction = process.env.VERCEL_ENV === "production";

    // Extract the filename from URL pathname to avoid synchronous params access
    const pathname = request.nextUrl.pathname;
    const filename = pathname.split("/").pop() || "";
    const src = `/photos/${filename}`;
    const apiSrc = `/api/photos/${filename}`;

    console.log(
      `[API${isProduction ? "/Vercel" : ""}] Attempting to load photo: ${filename}`,
    );

    // Skip known non-existent files early
    const knownBadFiles = ["image_12.jpg", "image_36.jpg"];
    if (knownBadFiles.includes(filename)) {
      console.log(`[API] Skipping known non-existent image: ${filename}`);
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    // Buffer to store the image data
    let buffer: Buffer | null = null;

    // Generate search paths based on filename patterns
    // This universal approach works for all files including previously problematic ones
    const searchPaths = generateSearchPaths(filename);

    // Strategy 1: Check if the image exists in the public/photos directory
    try {
      const publicPhotoPath = path.join(
        process.cwd(),
        "public",
        "photos",
        filename,
      );
      if (fs.existsSync(publicPhotoPath)) {
        console.log(
          `[API] Found image in public directory: ${publicPhotoPath}`,
        );
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
          OR: [{ src }, { src: apiSrc }],
        },
      });

      if (photoRecord) {
        console.log(
          `[API] Found photo record in database with ID: ${photoRecord.id}`,
        );

        // Try to download from Nextcloud with the original src path
        buffer = await downloadPhoto(src);
      } else {
        console.log(
          `[API] No record found in database for: ${src} or ${apiSrc}`,
        );
      }
    }

    // Strategy 3: Try all generated search paths with Nextcloud
    if (!buffer) {
      console.log(
        `[API] Trying ${searchPaths.length} alternative paths for: ${filename}`,
      );

      for (const searchPath of searchPaths) {
        try {
          console.log(`[API] Trying path: ${searchPath}`);
          buffer = await downloadPhoto(searchPath);

          if (buffer) {
            console.log(`[API] ✓ Found photo using path: ${searchPath}`);

            // Log successful path for future reference
            console.log(
              `[API] SUCCESSFUL_PATH_MAPPING: ${filename} => ${searchPath}`,
            );
            break;
          }
        } catch {
          // Non-critical error, continue trying other paths
          console.log(`[API] Failed to load from path: ${searchPath}`);
        }
      }
    }

    // Final fallback: Use the placeholder image
    if (!buffer) {
      console.log(`[API] Photo not found in any storage: ${filename}`);
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    // Determine content type based on extension
    let contentType = "image/jpeg"; // Default for jpg/jpeg

    // Get extension from filename
    const extension = filename.split(".").pop()?.toLowerCase() || "";

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
    const errorFilename =
      request.nextUrl.pathname.split("/").pop() || "unknown";
    console.error(`Error serving photo ${errorFilename}:`, error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }

    // For production, serve a placeholder instead of error
    if (process.env.VERCEL_ENV === "production") {
      console.log(
        `[API/Vercel] Error in production for ${errorFilename} - serving placeholder`,
      );
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    // In development, also serve a placeholder but with a different status
    return NextResponse.redirect(
      new URL("/placeholder-image.svg", request.url),
    );
  }
}
