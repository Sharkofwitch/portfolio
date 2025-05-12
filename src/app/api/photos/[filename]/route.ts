import { NextRequest, NextResponse } from "next/server";
import { downloadPhoto } from "@/lib/nextcloud";
import prisma from "@/lib/prisma";

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

    // Extract the filename and build the src path
    const filename = params.filename;
    const src = `/photos/${filename}`;

    console.log(
      `[API${isProduction ? "/Vercel" : ""}] Attempting to load photo: ${src}`,
    );
    console.log(`[API] Raw filename parameter: ${filename}`);

    // Skip known problematic images immediately
    const knownBadFiles = ["image_12.jpg", "image_36.jpg"];
    if (knownBadFiles.includes(filename)) {
      console.log(`[API] Skipping known problematic image: ${filename}`);
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    // First check the database
    const photoRecord = await prisma.photo.findFirst({
      where: { src },
    });

    if (photoRecord) {
      console.log(
        `[API] Found photo record in database with ID: ${photoRecord.id}`,
      );
    } else {
      console.log(`[API] No record found in database for: ${src}`);
      // If not in database, return placeholder immediately to save time
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    // Then try to download from Nextcloud with improved path handling
    const buffer = await downloadPhoto(src);

    if (!buffer) {
      console.log(`[API] Photo not found in Nextcloud storage: ${src}`);

      // Always serve a placeholder instead of 404
      console.log(`[API] Serving placeholder for missing photo`);
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    // If we have the file, determine its content type
    let contentType = "image/jpeg"; // Default for jpg/jpeg

    if (filename.toLowerCase().endsWith(".png")) {
      contentType = "image/png";
    } else if (filename.toLowerCase().endsWith(".svg")) {
      contentType = "image/svg+xml";
    } else if (filename.toLowerCase().endsWith(".webp")) {
      contentType = "image/webp";
    } else if (filename.toLowerCase().endsWith(".gif")) {
      contentType = "image/gif";
    }

    // Return photo with appropriate content type and caching headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving photo:", error);
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    }

    // For Vercel production, serve a placeholder instead of error
    if (process.env.VERCEL_ENV === "production") {
      console.log(
        "[API/Vercel] Error in production - serving placeholder instead",
      );
      return NextResponse.redirect(
        new URL("/placeholder-image.svg", request.url),
      );
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
