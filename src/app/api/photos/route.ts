import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { uploadPhoto, deletePhoto } from "@/lib/nextcloud";
import prisma from "@/lib/prisma";
import path from "path";
import photoData from "@/data/photos.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/photos - Start");
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (session?.user?.role !== "admin") {
      console.log("Unauthorized - No valid admin session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    console.log("Received file:", file?.name);

    // Extract metadata from form and ensure string types
    const metadata: {
      title: string;
      alt: string;
      year?: string | null;
      location?: string | null;
      camera?: string | null;
      description?: string | null;
    } = {
      title: String(formData.get("title") || ""),
      alt: String(formData.get("alt") || ""),
      year: formData.get("year") ? String(formData.get("year")) : null,
      location: formData.get("location")
        ? String(formData.get("location"))
        : null,
      camera: formData.get("camera") ? String(formData.get("camera")) : null,
      description: formData.get("description")
        ? String(formData.get("description"))
        : null,
    };
    console.log("Metadata:", metadata);

    if (!file) {
      console.log("No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!metadata.title || !metadata.alt) {
      console.log("Missing required metadata");
      return NextResponse.json(
        { error: "Title and alt text are required" },
        { status: 400 },
      );
    }

    // Generate a unique filename
    const uniqueName = `${Date.now()}-${metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}${path.extname(file.name)}`;
    const src = `/photos/${uniqueName}`;
    console.log("Generated src:", src);

    // Upload to Nextcloud
    console.log(`Uploading to Nextcloud... File size: ${file.size} bytes`);
    console.log(`File type: ${file.type}`);

    try {
      // Get file data - using synchronous execution to avoid any issues with async boundaries
      console.log("Converting file to array buffer...");
      const arrayBuffer = await file.arrayBuffer();
      console.log(
        `ArrayBuffer obtained, size: ${arrayBuffer.byteLength} bytes`,
      );

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        console.error("Empty array buffer received");
        return NextResponse.json(
          { error: "Empty file content" },
          { status: 400 },
        );
      }

      console.log("Converting array buffer to Node.js Buffer...");
      const buffer = Buffer.from(arrayBuffer);
      console.log(`Buffer created, size: ${buffer.length} bytes`);

      if (!buffer || buffer.length === 0) {
        console.error("Empty buffer created from array buffer");
        return NextResponse.json(
          { error: "Failed to process file" },
          { status: 500 },
        );
      }

      // Process the image if needed (will auto-resize if over size limit)
      let processedBuffer = buffer;
      if (buffer.length > 5 * 1024 * 1024) {
        // If over 5MB
        try {
          console.log(
            `File is large (${Math.round(buffer.length / 1024 / 1024)}MB), attempting to resize...`,
          );
          // Dynamically import the image processor to keep it out of the main bundle
          const { processImage } = await import("@/lib/image-processor");

          // Use type assertion to bypass the Buffer type checking
          // @ts-expect-error - Buffer types are compatible at runtime
          processedBuffer = await processImage(buffer, 30); // Allow up to 30MB after processing
          console.log(
            `Image processed. New size: ${Math.round(processedBuffer.length / 1024 / 1024)}MB`,
          );
        } catch (processingError) {
          console.error("Error processing large image:", processingError);
          // Continue with the original buffer if processing fails
          console.log("Continuing with unprocessed image");
        }
      }

      // Upload using buffer and uniqueName
      console.log(`Starting upload to Nextcloud with filename: ${uniqueName}`);
      await uploadPhoto(processedBuffer, uniqueName);
      console.log(`Upload successful for file: ${uniqueName}`);

      // Skip additional verification as the uploadPhoto function already verifies
      // that the file exists after upload
    } catch (uploadError) {
      console.error("Error uploading to Nextcloud:", uploadError);
      if (uploadError instanceof Error) {
        console.error("Error details:", uploadError.message);
        console.error("Error stack:", uploadError.stack);
      }
      return NextResponse.json(
        {
          error: "Failed to upload to storage",
          details:
            uploadError instanceof Error
              ? uploadError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }

    // Save to database with default dimensions
    console.log("Saving to database...");
    const photo = await prisma.photo.create({
      data: {
        src, // src is already a string
        title: metadata.title, // already converted to string in metadata extraction
        alt: metadata.alt, // already converted to string in metadata extraction
        width: 1600, // default width
        height: 1067, // default height
        year: metadata.year, // already properly typed in metadata extraction
        location: metadata.location, // already properly typed in metadata extraction
        camera: metadata.camera, // already properly typed in metadata extraction
        description: metadata.description, // already properly typed in metadata extraction
      },
    });
    console.log("Database save successful:", photo);

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error("Error handling photo upload:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // First try to get photos from the database
    const dbPhotos = await prisma.photo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`API: Found ${dbPhotos.length} photos in database`);

    if (dbPhotos.length > 0) {
      // Check if any photos need path fixing (for backward compatibility)
      const normalizedPhotos = dbPhotos.map((photo) => {
        // Make sure all photos use the API route format
        if (!photo.src.startsWith("/api/photos/")) {
          const filename = photo.src.split("/").pop();
          return {
            ...photo,
            src: `/api/photos/${filename}`,
          };
        }
        return photo;
      });

      // Return in consistent format that works with all components
      return NextResponse.json({
        success: true,
        photos: normalizedPhotos,
      });
    }

    // If no photos in DB, fallback to photos.json
    console.log(
      `API: No photos in DB, returning ${photoData.photos.length} from fallback JSON`,
    );
    return NextResponse.json({
      success: true,
      photos: photoData.photos,
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Support both JSON and FormData for better flexibility
    let id: string | null = null;
    let metadata: Record<string, string | number | null | undefined> = {};
    let createNew = false;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle JSON request from our vercel-optimized flow
      const jsonData = await req.json();
      id = jsonData.id || null;

      // If coming from vercel-upload endpoint, src is provided but id isn't
      if (!id && jsonData.src) {
        createNew = true;
        console.log(
          "Creating new photo from JSON data with src:",
          jsonData.src,
        );

        metadata = {
          src: String(jsonData.src || ""),
          title: String(jsonData.title || ""),
          alt: String(jsonData.alt || ""),
          width: 1600, // default width
          height: 1067, // default height
          year: jsonData.year ? String(jsonData.year) : null,
          location: jsonData.location ? String(jsonData.location) : null,
          camera: jsonData.camera ? String(jsonData.camera) : null,
          description: jsonData.description
            ? String(jsonData.description)
            : null,
        };
      } else {
        metadata = {
          title: String(jsonData.title || ""),
          alt: String(jsonData.alt || ""),
          year: jsonData.year ? String(jsonData.year) : null,
          location: jsonData.location ? String(jsonData.location) : null,
          camera: jsonData.camera ? String(jsonData.camera) : null,
          description: jsonData.description
            ? String(jsonData.description)
            : null,
        };
      }
    } else {
      // Handle traditional FormData
      const formData = await req.formData();
      id = formData.get("id") as string;

      if (!id) {
        return NextResponse.json(
          { error: "Photo ID required" },
          { status: 400 },
        );
      }

      // Extract metadata from form with proper string handling
      metadata = {
        title: String(formData.get("title") || ""),
        alt: String(formData.get("alt") || ""),
        year: formData.get("year") ? String(formData.get("year")) : null,
        location: formData.get("location")
          ? String(formData.get("location"))
          : null,
        camera: formData.get("camera") ? String(formData.get("camera")) : null,
        description: formData.get("description")
          ? String(formData.get("description"))
          : null,
      };
    }

    if (!metadata.title || !metadata.alt) {
      return NextResponse.json(
        { error: "Title and alt text are required" },
        { status: 400 },
      );
    }

    // Create new or update existing
    let photo;
    if (createNew) {
      console.log("Creating new photo in database:", metadata);
      // Ensure all values are properly typed as strings for Prisma
      photo = await prisma.photo.create({
        data: {
          src: String(metadata.src || ""),
          title: String(metadata.title || ""),
          alt: String(metadata.alt || ""),
          width: 1600, // default width
          height: 1067, // default height
          year: metadata.year ? String(metadata.year) : null,
          location: metadata.location ? String(metadata.location) : null,
          camera: metadata.camera ? String(metadata.camera) : null,
          description: metadata.description
            ? String(metadata.description)
            : null,
        },
      });
      console.log("New photo created:", photo);
    } else {
      console.log(`Updating photo with ID ${id}`);
      photo = await prisma.photo.update({
        where: { id: id! },
        data: {
          title: String(metadata.title || ""),
          alt: String(metadata.alt || ""),
          year: metadata.year ? String(metadata.year) : null,
          location: metadata.location ? String(metadata.location) : null,
          camera: metadata.camera ? String(metadata.camera) : null,
          description: metadata.description
            ? String(metadata.description)
            : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      photo,
    });
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    // Get the photo to delete
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Get the filename from the src path
    const filename = path.basename(photo.src);

    // Delete from both Nextcloud and database
    await Promise.all([
      deletePhoto(filename),
      prisma.photo.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
