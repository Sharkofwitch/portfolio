import { createClient } from "webdav";

// Get environment variables directly - more resilient against module loader issues
const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || "";
const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME || "";
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";
// Use environment variable or fallback, ensuring no double slashes
const NEXTCLOUD_PHOTOS_PATH = (
  process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
).replace(/\/+/g, "/");

// Validate required environment variables
if (!NEXTCLOUD_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_PASSWORD) {
  console.error("Missing required Nextcloud environment variables");
}

// Create WebDAV client with a function to ensure fresh connections in serverless environments
const baseUrl = NEXTCLOUD_URL.endsWith("/")
  ? NEXTCLOUD_URL.slice(0, -1)
  : NEXTCLOUD_URL;
const webdavUrl = `${baseUrl}/remote.php/webdav`;

// Create client factory to avoid stale connections in serverless environments
function getClient() {
  return createClient(webdavUrl, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD,
    headers: {
      Accept: "*/*",
    },
  });
}

// For backward compatibility
const client = getClient();

/**
 * Get the full path for a photo in Nextcloud
 */
function getPhotoPath(filename: string): string {
  // Strip photo path of any leading/trailing slashes and ensure consistent format
  const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");

  // Clean the filename: remove leading slashes and extract just the filename
  let cleanFilename = filename.replace(/^\/+/g, "");

  // Handle various path formats
  cleanFilename = cleanFilename
    .replace(/^photos\//, "") // Remove "photos/" prefix if present
    .replace(/^Photos\//, "") // Remove "Photos/" prefix if present
    .replace(/^Portfolio\//, ""); // Remove "Portfolio/" prefix if present

  // Extract just the filename if it contains any path
  if (cleanFilename.includes("/")) {
    cleanFilename = cleanFilename.split("/").pop() || cleanFilename;
  }

  console.log(
    `[Nextcloud] Cleaned path: ${cleanPath}, cleaned filename: ${cleanFilename}`,
  );

  // Join path parts and ensure proper formatting
  return [cleanPath, cleanFilename].filter(Boolean).join("/");
}

/**
 * Upload a photo to Nextcloud
 */
export async function uploadPhoto(
  buffer: Buffer,
  filename: string,
): Promise<void> {
  try {
    const path = getPhotoPath(filename);
    console.log(`[Nextcloud] Uploading photo: ${filename} to path: ${path}`);
    console.log(`[Nextcloud] Buffer size: ${buffer.length} bytes`);

    // Validate the buffer is not empty
    if (!buffer || buffer.length === 0) {
      console.error(`[Nextcloud] Empty buffer for ${filename}`);
      throw new Error("File buffer is empty");
    }

    // Get a fresh client for this operation
    const uploadClient = getClient();

    // Ensure the parent directory exists
    const dirPath = path.split("/").slice(0, -1).join("/");
    console.log(`[Nextcloud] Ensuring directory exists: ${dirPath}`);

    try {
      // Check if directory exists, if not create it
      const dirExists = await uploadClient.exists(dirPath);
      if (!dirExists) {
        console.log(
          `[Nextcloud] Directory does not exist, creating: ${dirPath}`,
        );
        await uploadClient.createDirectory(dirPath);
      }
    } catch (dirError) {
      console.log(
        `[Nextcloud] Directory check/creation skipped: ${dirError.message}`,
      );
      // Continue with upload anyway as the directory might already exist
    }

    // Upload with explicit content type
    console.log(`[Nextcloud] Starting upload to: ${path}`);
    await uploadClient.putFileContents(path, buffer, {
      contentLength: buffer.length,
      overwrite: true,
    });

    // Verify the file exists after upload
    const exists = await uploadClient.exists(path);
    if (exists) {
      console.log(`[Nextcloud] Upload successful and verified: ${path}`);
    } else {
      throw new Error(`File uploaded but not found at path: ${path}`);
    }
  } catch (error) {
    console.error(`[Nextcloud] Upload error for ${filename}:`, error);
    if (error instanceof Error) {
      console.error(`[Nextcloud] Error details: ${error.message}`);
      console.error(`[Nextcloud] Error stack: ${error.stack}`);
    }
    throw error;
  }
}

/**
 * Download a photo from Nextcloud
 * Enhanced with additional error handling and validation, optimized for serverless environments
 */
export async function downloadPhoto(src: string): Promise<Buffer | null> {
  try {
    // Extract the filename from the src path, which could be like "/photos/image.jpg"
    const filename = src.split("/").pop()!;

    // Skip known non-existent files early
    const knownBadFiles = ["image_12.jpg", "image_36.jpg"];
    if (knownBadFiles.includes(filename)) {
      console.log(`[Nextcloud] Skipping known non-existent file: ${filename}`);
      return null;
    }

    // Try multiple path formats to maximize chances of finding the file
    const pathsToTry = [
      getPhotoPath(filename), // Primary path from getPhotoPath
      filename, // Just filename directly at root
      `Photos/${filename}`, // Photos folder at root
      `Portfolio/${filename}`, // Portfolio folder at root
      `Photos/Portfolio/${filename}`, // Photos/Portfolio path
      `${NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "")}/${filename}`, // Explicit NEXTCLOUD_PHOTOS_PATH
      `/Photos/${filename}`, // Photos folder with leading slash
      `/Portfolio/${filename}`, // Portfolio folder with leading slash
      `/Photos/Portfolio/${filename}`, // Full path with leading slash
      `/remote.php/webdav/${filename}`, // Direct webdav path
    ];

    console.log(`[Nextcloud] Attempting to download file (from src: ${src})`);
    console.log(`[Nextcloud] Using Nextcloud base URL: ${webdavUrl}`);
    console.log(`[Nextcloud] NEXTCLOUD_PHOTOS_PATH: ${NEXTCLOUD_PHOTOS_PATH}`);

    // Get a fresh client for this request (important for serverless environments)
    const client = getClient();

    // Try each path option until we find the file
    for (const currentPath of pathsToTry) {
      try {
        console.log(`[Nextcloud] Checking path: ${currentPath}`);
        const exists = await client.exists(currentPath);
        if (!exists) {
          console.log(`[Nextcloud] File not found at path: ${currentPath}`);
          continue;
        }

        // File exists at this path, try to download it
        console.log(
          `[Nextcloud] File exists, downloading from: ${currentPath}`,
        );
        const response = await client.getFileContents(currentPath);

        if (response instanceof Buffer) {
          console.log(
            `[Nextcloud] Successfully downloaded file: ${currentPath}, size: ${response.length} bytes`,
          );
          return response;
        }
      } catch (pathError) {
        console.error(
          `[Nextcloud] Error checking path ${currentPath}: ${pathError instanceof Error ? pathError.message : String(pathError)}`,
        );
        // Continue to try next path
      }
    }

    // If we reach here, we didn't find the file
    console.log(`[Nextcloud] File not found in any path: ${filename}`);
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
