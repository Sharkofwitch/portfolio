/**
 * Test script to verify photo loading from Nextcloud
 * This script tests both the Nextcloud connection and direct photo loading
 */

// Let's use proper imports for ESM support with TS files
import path from "path";
import dotenv from "dotenv";
import { createClient } from "webdav";

// Load environment variables
dotenv.config();

// Set up Nextcloud connection
const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL;
const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME;
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD;
const NEXTCLOUD_PHOTOS_PATH =
  process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio";

if (!NEXTCLOUD_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_PASSWORD) {
  console.error("❌ Missing required Nextcloud environment variables");
  process.exit(1);
}

const baseUrl = NEXTCLOUD_URL.endsWith("/")
  ? NEXTCLOUD_URL.slice(0, -1)
  : NEXTCLOUD_URL;
const webdavUrl = `${baseUrl}/remote.php/webdav`;

// Create client
const getClient = () => {
  return createClient(webdavUrl, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD,
    headers: { Accept: "*/*" },
  });
};

const client = getClient();

/**
 * Test connection to Nextcloud
 */
async function testConnection() {
  try {
    console.log("🔍 Testing Nextcloud connection...");
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
async function getPhotosWithMetadata() {
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
    const imageFiles = files.filter((file: any) => {
      const filename = file.basename;
      return (
        !file.type.endsWith("directory") && /\.(jpe?g|png)$/i.test(filename)
      );
    });

    // Map to photo metadata structure
    return imageFiles.map((file: any) => {
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

/**
 * Download a photo from Nextcloud
 */
async function downloadPhoto(src: string): Promise<Buffer | null> {
  try {
    const filename = src.split("/").pop()!;

    // Try multiple path formats
    const pathsToTry = [
      `${NEXTCLOUD_PHOTOS_PATH}/${filename}`,
      filename,
      `Photos/${filename}`,
      `Portfolio/${filename}`,
      `Photos/Portfolio/${filename}`,
    ];

    console.log(`[Test] Attempting to download: ${filename}`);

    for (const path of pathsToTry) {
      try {
        console.log(`  Checking path: ${path}`);
        if (await client.exists(path)) {
          console.log(`  Found at: ${path}`);
          const response = await client.getFileContents(path);

          if (response instanceof Buffer) {
            return response;
          }
        }
      } catch (e) {
        console.log(
          `  Error with path ${path}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    console.log(`  File not found: ${filename}`);
    return null;
  } catch (error) {
    console.error(
      `Error downloading photo: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }
}

async function testPhotoLoading() {
  try {
    const connectionTest = await testConnection();

    if (!connectionTest.success) {
      console.error("❌ Nextcloud connection failed:", connectionTest.message);
      return;
    }

    console.log("✅ Nextcloud connection successful:", connectionTest.message);

    // Get list of photos from Nextcloud
    console.log("\n📋 Fetching photo list from Nextcloud...");
    const photos = await getPhotosWithMetadata();

    console.log(`📷 Found ${photos.length} photos in Nextcloud`);

    if (photos.length === 0) {
      console.log(
        "⚠️ No photos found in Nextcloud. Testing with some predefined paths...",
      );

      // Test some common photo paths
      const testPaths = [
        "/photos/image_1.jpg",
        "/photos/photo_01.jpg",
        "/image_1.jpg",
      ];

      for (const testPath of testPaths) {
        console.log(`\n🔍 Testing photo download for: ${testPath}`);
        const buffer = await downloadPhoto(testPath);

        if (buffer) {
          console.log(
            `✅ Successfully downloaded ${testPath} (${buffer.length} bytes)`,
          );
        } else {
          console.log(`❌ Failed to download ${testPath}`);
        }
      }
    } else {
      // Test the first 3 photos from the list
      const samplesToTest = photos.slice(0, 3);

      console.log(
        `\n🧪 Testing download of ${samplesToTest.length} sample photos:`,
      );

      for (const photo of samplesToTest) {
        console.log(
          `\n📷 Testing photo: ${photo.publicUrl} (${photo.filename})`,
        );
        const buffer = await downloadPhoto(photo.publicUrl);

        if (buffer) {
          console.log(
            `✅ Successfully downloaded ${photo.publicUrl} (${buffer.length} bytes)`,
          );
        } else {
          console.log(`❌ Failed to download ${photo.publicUrl}`);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error during testing:", error);
  }
}

testPhotoLoading();
