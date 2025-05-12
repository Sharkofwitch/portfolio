import { NextRequest, NextResponse } from "next/server";
import { debugUploadPhoto } from "@/lib/nextcloud-debug";
import path from "path";

// Only enable in development
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is only available in development" },
        { status: 403 },
      );
    }

    console.log("[TestAPI] Debugging upload API called");

    // Process the multipart form data
    const formData = await req.formData();
    console.log("[TestAPI] Form data retrieved");

    // Get the file
    const file = formData.get("file") as File | null;
    if (!file) {
      console.error("[TestAPI] No file in form data");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(
      `[TestAPI] File: ${file.name}, size: ${file.size} bytes, type: ${file.type}`,
    );

    // Extract metadata
    const metadata = {
      title: (formData.get("title") as string) || "Test Image",
      alt: (formData.get("alt") as string) || "Test Image Alt Text",
      description: (formData.get("description") as string) || undefined,
    };
    console.log("[TestAPI] Metadata:", metadata);

    // Generate filename
    const uniqueName = `debug-${Date.now()}-${path.basename(file.name)}`;
    const src = `/photos/${uniqueName}`;
    console.log(`[TestAPI] Generated src path: ${src}`);

    // Get the file data
    const arrayBuffer = await file.arrayBuffer();
    console.log(
      `[TestAPI] ArrayBuffer obtained, size: ${arrayBuffer.byteLength} bytes`,
    );
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[TestAPI] Buffer created, size: ${buffer.length} bytes`);

    // Upload to Nextcloud
    console.log("[TestAPI] Starting upload to Nextcloud");
    const uploadResult = await debugUploadPhoto(buffer, uniqueName);

    if (!uploadResult) {
      throw new Error("Failed to upload to Nextcloud");
    }

    console.log("[TestAPI] Upload to Nextcloud successful");

    // Create a photo response object without saving to the database
    const photo = {
      id: "debug-" + Date.now(),
      src,
      title: metadata.title,
      alt: metadata.alt,
      description: metadata.description,
      width: 100, // Placeholder values
      height: 100,
    };
    console.log("[TestAPI] Created test photo object:", photo);

    return NextResponse.json({
      success: true,
      message: "Test upload successful",
      photo,
    });
  } catch (error) {
    console.error("[TestAPI] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 },
    );
  }
}
