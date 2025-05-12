/**
 * Simple test to directly check a file in Nextcloud
 */
require("dotenv").config();
// Use dynamic import for ESM module
const webdavPromise = import("webdav");

// Get environment variables
const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL;
const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME;
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD;
const NEXTCLOUD_PHOTOS_PATH = (
  process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
).replace(/\/+/g, "/");

if (!NEXTCLOUD_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_PASSWORD) {
  console.error("Missing required Nextcloud environment variables");
  process.exit(1);
}

// Create WebDAV client
const baseUrl = NEXTCLOUD_URL.endsWith("/")
  ? NEXTCLOUD_URL.slice(0, -1)
  : NEXTCLOUD_URL;
const webdavUrl = `${baseUrl}/remote.php/webdav`;

// We'll initialize the client inside the async function

async function testNextcloudDirectly() {
  console.log("🧪 Testing Nextcloud WebDAV directly");
  console.log("----------------------------------");
  console.log(`Using WebDAV URL: ${webdavUrl}`);
  console.log(`Using Photos Path: ${NEXTCLOUD_PHOTOS_PATH}\n`);

  // Initialize the client inside the async function
  const { createClient } = await webdavPromise;
  const client = createClient(webdavUrl, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD,
    headers: { Accept: "*/*" },
  });

  // Specific photos we're having problems with
  const problemFiles = ["image_12.jpg", "image_36.jpg"];

  // Try each photo with all possible path combinations
  for (const filename of problemFiles) {
    console.log(`\n📷 Testing photo: ${filename}`);

    const pathsToTry = [
      NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "") + "/" + filename,
      filename,
      `Photos/${filename}`,
      `Portfolio/${filename}`,
      `Photos/Portfolio/${filename}`,
      // Just in case NEXTCLOUD_PHOTOS_PATH is wrong and should be just Portfolio
      `Portfolio/${filename}`,
    ];

    console.log(`Checking ${pathsToTry.length} possible paths:`);

    for (const path of pathsToTry) {
      try {
        console.log(`\n🔍 Checking: "${path}"`);
        const exists = await client.exists(path);
        console.log(`    Exists: ${exists}`);

        if (exists) {
          try {
            const stats = await client.stat(path);
            console.log(`    Size: ${stats.size} bytes`);
            console.log(`    Modified: ${stats.lastmod}`);
          } catch (statsError) {
            console.log(`    Error getting stats: ${statsError.message}`);
          }
        }
      } catch (error) {
        console.log(`    Error: ${error.message}`);
      }
    }
  }

  // List root directory
  try {
    console.log("\n📂 Listing root directory:");
    const rootContents = await client.getDirectoryContents("/");
    rootContents.slice(0, 5).forEach((item) => {
      console.log(
        `    ${item.type === "directory" ? "📁" : "📄"} ${item.filename} (${item.basename})`,
      );
    });
    if (rootContents.length > 5) {
      console.log(`    ... and ${rootContents.length - 5} more items`);
    }
  } catch (error) {
    console.log(`Error listing root: ${error.message}`);
  }

  // List Photos directory if it exists
  try {
    console.log("\n📂 Listing Photos directory:");
    const photosContents = await client.getDirectoryContents("Photos");
    photosContents.slice(0, 5).forEach((item) => {
      console.log(
        `    ${item.type === "directory" ? "📁" : "📄"} ${item.filename} (${item.basename})`,
      );
    });
    if (photosContents.length > 5) {
      console.log(`    ... and ${photosContents.length - 5} more items`);
    }
  } catch (error) {
    console.log(`Error listing Photos: ${error.message}`);
  }

  // Try to list NEXTCLOUD_PHOTOS_PATH directly
  try {
    const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");
    console.log(`\n📂 Listing ${cleanPath} directory:`);
    const photoPathContents = await client.getDirectoryContents(cleanPath);
    photoPathContents.slice(0, 5).forEach((item) => {
      console.log(
        `    ${item.type === "directory" ? "📁" : "📄"} ${item.filename} (${item.basename})`,
      );
    });
    if (photoPathContents.length > 5) {
      console.log(`    ... and ${photoPathContents.length - 5} more items`);
    }
  } catch (error) {
    console.log(`Error listing ${NEXTCLOUD_PHOTOS_PATH}: ${error.message}`);
  }
}

testNextcloudDirectly()
  .then(() => console.log("\n✅ Test completed"))
  .catch((err) => console.error("❌ Test failed:", err));
