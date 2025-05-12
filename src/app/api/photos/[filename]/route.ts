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
    // Extract the filename and build the src path
    const filename = params.filename;
    const src = `/photos/${filename}`;

    console.log(`[API] Attempting to load photo: ${src}`);

    // First check the database
    const photoRecord = await prisma.photo.findFirst({
      where: { src },
    });

    // Then try to download from Nextcloud
    const buffer = await downloadPhoto(src);

    if (!buffer) {
      console.log(`[API] Photo not found in Nextcloud storage: ${src}`);

      // If no database record exists either, serve placeholder
      if (!photoRecord) {
        console.log(
          `[API] Photo also not found in database, serving placeholder`,
        );
        return NextResponse.redirect(
          new URL("/placeholder-image.svg", request.url),
        );
      }

      return new NextResponse("Photo not found in storage", { status: 404 });
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
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
