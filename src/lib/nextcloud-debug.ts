import { createClient } from "webdav";

// Get environment variables directly
const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || "";
const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME || "";
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";
const NEXTCLOUD_PHOTOS_PATH = (
  process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
).replace(/\/+/g, "/");

if (!NEXTCLOUD_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_PASSWORD) {
  console.error("Missing required Nextcloud environment variables");
}

// Calculate WebDAV URL
const baseUrl = NEXTCLOUD_URL.endsWith("/")
  ? NEXTCLOUD_URL.slice(0, -1)
  : NEXTCLOUD_URL;
const webdavUrl = `${baseUrl}/remote.php/webdav`;

/**
 * Create a fresh WebDAV client
 */
function getClient() {
  return createClient(webdavUrl, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD,
    headers: {
      Accept: "*/*",
    },
  });
}

/**
 * Get the full photo path in Nextcloud
 */
function getPhotoPath(filename: string): string {
  const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");
  let cleanFilename = filename.replace(/^\/+/g, "");

  // Extract just the filename if it contains any path
  if (cleanFilename.includes("/")) {
    cleanFilename = cleanFilename.split("/").pop() || cleanFilename;
  }

  return [cleanPath, cleanFilename].filter(Boolean).join("/");
}

/**
 * Simplified upload function for testing
 */
export async function debugUploadPhoto(
  buffer: Buffer,
  filename: string,
): Promise<boolean> {
  try {
    console.log("[DebugNextcloud] Starting upload...");

    if (!buffer || buffer.length === 0) {
      console.error("[DebugNextcloud] Empty buffer");
      return false;
    }

    const path = getPhotoPath(filename);
    console.log(`[DebugNextcloud] Path: ${path}`);
    console.log(`[DebugNextcloud] Buffer size: ${buffer.length} bytes`);

    // Get a fresh client
    const client = getClient();

    // Upload the file
    await client.putFileContents(path, buffer, {
      contentLength: buffer.length,
      overwrite: true,
    });

    // Verify upload
    const exists = await client.exists(path);
    if (!exists) {
      console.error("[DebugNextcloud] File not found after upload");
      return false;
    }

    console.log("[DebugNextcloud] Upload successful and verified!");
    return true;
  } catch (error) {
    console.error("[DebugNextcloud] Upload error:", error);
    return false;
  }
}
