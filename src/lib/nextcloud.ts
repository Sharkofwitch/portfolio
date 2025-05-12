import { createClient } from "webdav";
import { getEnvVar } from "./env";

// Get environment variables
const NEXTCLOUD_URL = getEnvVar("NEXTCLOUD_URL");
const NEXTCLOUD_USERNAME = getEnvVar("NEXTCLOUD_USERNAME");
const NEXTCLOUD_PASSWORD = getEnvVar("NEXTCLOUD_PASSWORD");
const NEXTCLOUD_PHOTOS_PATH =
  process.env.NEXTCLOUD_PHOTOS_PATH || "Photos/Portfolio";

// Create WebDAV client
const baseUrl = NEXTCLOUD_URL.endsWith("/")
  ? NEXTCLOUD_URL.slice(0, -1)
  : NEXTCLOUD_URL;
const webdavUrl = `${baseUrl}/remote.php/webdav`;

const client = createClient(webdavUrl, {
  username: NEXTCLOUD_USERNAME,
  password: NEXTCLOUD_PASSWORD,
  headers: {
    Accept: "*/*",
  },
});

/**
 * Get the full path for a photo in Nextcloud
 */
function getPhotoPath(filename: string): string {
  // Remove any leading or trailing slashes from the path and filename
  const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");
  const cleanFilename = filename.replace(/^\/+|\/+$/g, "");

  // Handle cases where filename might include 'photos/' prefix
  const finalFilename = cleanFilename.replace(/^photos\//, "");

  // Join path parts and ensure proper formatting
  return [cleanPath, finalFilename].filter(Boolean).join("/");
}

/**
 * Upload a photo to Nextcloud
 */
export async function uploadPhoto(
  buffer: Buffer,
  filename: string,
): Promise<void> {
  const path = getPhotoPath(filename);
  await client.putFileContents(path, buffer);
}

/**
 * Download a photo from Nextcloud
 */
export async function downloadPhoto(src: string): Promise<Buffer | null> {
  try {
    // Extract the filename from the src path, which could be like "/photos/image.jpg"
    const filename = src.split("/").pop()!;

    // Get the clean path for Nextcloud
    const path = getPhotoPath(filename);

    console.log(
      `[Nextcloud] Attempting to download file: ${path} (from src: ${src})`,
    );
    console.log(`[Nextcloud] Using Nextcloud base URL: ${webdavUrl}`);
    console.log(`[Nextcloud] NEXTCLOUD_PHOTOS_PATH: ${NEXTCLOUD_PHOTOS_PATH}`);

    // Check if file exists first
    const exists = await client.exists(path);
    if (!exists) {
      console.log(`[Nextcloud] File not found at path: ${path}`);

      // Try a simple approach as fallback - just the filename directly
      const simplePath = filename;
      console.log(`[Nextcloud] Trying fallback path: ${simplePath}`);

      const simpleExists = await client.exists(simplePath);
      if (!simpleExists) {
        console.log(
          `[Nextcloud] File not found at fallback path either: ${simplePath}`,
        );
        return null;
      }

      console.log(
        `[Nextcloud] File found at fallback path, downloading: ${simplePath}`,
      );
      const simpleResponse = await client.getFileContents(simplePath);

      if (simpleResponse instanceof Buffer) {
        console.log(
          `[Nextcloud] Successfully downloaded file from fallback path: ${simplePath}, size: ${simpleResponse.length} bytes`,
        );
        return simpleResponse;
      }

      return null;
    }

    console.log(`[Nextcloud] File exists, downloading: ${path}`);
    const response = await client.getFileContents(path);

    if (response instanceof Buffer) {
      console.log(
        `[Nextcloud] Successfully downloaded file: ${path}, size: ${response.length} bytes`,
      );
      return response;
    }

    console.log(
      `[Nextcloud] File response is not a Buffer: ${typeof response}`,
    );
    return null;
  } catch (error) {
    console.error(`[Nextcloud] Error downloading photo ${src}:`, error);
    return null;
  }
}

/**
 * Delete a photo from Nextcloud
 */
export async function deletePhoto(src: string): Promise<void> {
  const filename = src.split("/").pop()!;
  const path = getPhotoPath(filename);
  await client.deleteFile(path);
}

/**
 * Check if a photo exists in Nextcloud
 */
export async function photoExists(src: string): Promise<boolean> {
  try {
    const filename = src.split("/").pop()!;
    const path = getPhotoPath(filename);
    return await client.exists(path);
  } catch (error) {
    console.error("Error checking if photo exists:", error);
    return false;
  }
}

/**
 * Test connection to Nextcloud
 */
export async function testConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Try to list the root directory to check if authentication works
    await client.getDirectoryContents("/");
    return {
      success: true,
      message: `Successfully connected to Nextcloud at ${NEXTCLOUD_URL}`,
    };
  } catch (error) {
    console.error("Error connecting to Nextcloud:", error);
    return {
      success: false,
      message: `Failed to connect to Nextcloud: ${(error as Error).message}`,
    };
  }
}

/**
 * Get photos with metadata from Nextcloud
 */
import { INextcloudPhoto } from "./nextcloud-types";

export async function getPhotosWithMetadata(): Promise<INextcloudPhoto[]> {
  try {
    // Get all files in the photos directory
    const filesResponse = await client.getDirectoryContents(
      NEXTCLOUD_PHOTOS_PATH,
    );

    // Handle both possible return types
    const files = Array.isArray(filesResponse)
      ? filesResponse
      : filesResponse.data;

    // Filter just image files
    const imageFiles = files.filter((file) => {
      const filename = file.basename;
      return (
        !file.type.endsWith("directory") && /\.(jpe?g|png)$/i.test(filename)
      );
    });

    // Map to photo metadata structure
    return imageFiles.map((file) => {
      const filename = file.basename;
      const src = `/photos/${filename}`;

      // Generate a unique ID based on the file path
      return {
        filename: file.basename || "",
        publicUrl: src,
        metadata: {
          size: file.size,
          lastmod: file.lastmod || new Date().toISOString(),
          mime: file.mime,
        },
      };
    });
  } catch (error) {
    console.error("Error getting photos with metadata:", error);
    return [];
  }
}
