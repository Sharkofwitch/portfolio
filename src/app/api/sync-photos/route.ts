import { NextRequest, NextResponse } from "next/server";
import { createClient } from "webdav";
import prisma from "@/lib/prisma";
import { getEnvVar } from "@/lib/env";

// Ensure this is a dynamic route with no caching
export const dynamic = "force-dynamic";

// Get environment variables for Nextcloud
const NEXTCLOUD_URL = getEnvVar("NEXTCLOUD_URL");
const NEXTCLOUD_USERNAME = getEnvVar("NEXTCLOUD_USERNAME");
const NEXTCLOUD_PASSWORD = getEnvVar("NEXTCLOUD_PASSWORD");
const NEXTCLOUD_PHOTOS_PATH = (
  process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
).replace(/\/+/g, "/");

// Create WebDAV client
const baseUrl = NEXTCLOUD_URL.endsWith("/")
  ? NEXTCLOUD_URL.slice(0, -1)
  : NEXTCLOUD_URL;
const webdavUrl = `${baseUrl}/remote.php/webdav`;
const client = createClient(webdavUrl, {
  username: NEXTCLOUD_USERNAME,
  password: NEXTCLOUD_PASSWORD,
  headers: { Accept: "*/*" },
});

export async function GET(request: NextRequest) {
  try {
    // Require API key for this admin operation
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Step 1: List all photos in Nextcloud
    const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");
    const directoryContents = await client.getDirectoryContents(cleanPath);

    const nextcloudPhotos = directoryContents
      .filter((item) => !item.type.includes("directory"))
      .map((file: { basename: string; filename: string; type: string }) => ({
        filename: file.basename,
        path: file.filename,
      }));

    // Extract just the filenames for easy comparison
    const availablePhotoFilenames = new Set(
      nextcloudPhotos.map((p) => p.filename),
    );

    // Step 2: Get all photos from database
    const dbPhotos = await prisma.photo.findMany();

    // Step 3: Identify photos to remove (in DB but not in Nextcloud)
    const photosToRemove = dbPhotos.filter((dbPhoto) => {
      const filename = dbPhoto.src.split("/").pop();
      return filename && !availablePhotoFilenames.has(filename);
    });

    // Step 4: Remove the non-existent photos from the database
    const removeResults = [];
    for (const photo of photosToRemove) {
      await prisma.photo.delete({
        where: { id: photo.id },
      });
      removeResults.push({
        id: photo.id,
        title: photo.title,
        filename: photo.src.split("/").pop(),
      });
    }

    // Step 5: Find photos in Nextcloud that aren't in the DB (optional addition)
    const dbPhotoFilenames = new Set(
      dbPhotos.map((p) => p.src.split("/").pop()),
    );
    const photosToAdd = nextcloudPhotos.filter(
      (ncPhoto) => !dbPhotoFilenames.has(ncPhoto.filename),
    );

    return NextResponse.json({
      success: true,
      message: "Synchronization completed successfully",
      stats: {
        nextcloudPhotosCount: nextcloudPhotos.length,
        dbPhotosCount: {
          before: dbPhotos.length,
          after: dbPhotos.length - photosToRemove.length,
        },
        removedPhotos: removeResults,
        availableToAdd: photosToAdd.map((p) => p.filename),
      },
    });
  } catch (error) {
    console.error("Error synchronizing photos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
