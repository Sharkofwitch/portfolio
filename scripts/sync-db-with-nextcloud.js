/**
 * Synchronize the database with actual photos in Nextcloud
 * This script will:
 * 1. Get all photos from Nextcloud
 * 2. Update the database to only include photos that exist
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const webdavPromise = import("webdav");

// Initialize Prisma client
const prisma = new PrismaClient();

// Get environment variables for Nextcloud
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

async function syncDatabaseWithNextcloud() {
  try {
    console.log("🔄 Starting database synchronization with Nextcloud");
    console.log("===================================================\n");

    // Initialize WebDAV client
    const { createClient } = await webdavPromise;
    const baseUrl = NEXTCLOUD_URL.endsWith("/")
      ? NEXTCLOUD_URL.slice(0, -1)
      : NEXTCLOUD_URL;
    const webdavUrl = `${baseUrl}/remote.php/webdav`;

    const client = createClient(webdavUrl, {
      username: NEXTCLOUD_USERNAME,
      password: NEXTCLOUD_PASSWORD,
      headers: { Accept: "*/*" },
    });

    // Step 1: List all photos in Nextcloud
    console.log("🔍 Listing photos in Nextcloud...");
    const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");
    let nextcloudPhotos = [];

    try {
      const directoryContents = await client.getDirectoryContents(cleanPath);
      nextcloudPhotos = directoryContents
        .filter((item) => !item.type.includes("directory"))
        .map((file) => ({
          filename: file.basename,
          path: file.filename,
          size: file.size,
          lastModified: file.lastmod,
        }));

      console.log(`✅ Found ${nextcloudPhotos.length} photos in Nextcloud`);
      console.log("   Available photos:");
      nextcloudPhotos.forEach((photo) => {
        console.log(`   - ${photo.filename} (${photo.size} bytes)`);
      });
    } catch (error) {
      console.error(`❌ Error listing Nextcloud directory: ${error.message}`);
      return;
    }

    // Extract just the filenames for easy comparison
    const availablePhotos = new Set(nextcloudPhotos.map((p) => p.filename));

    // Step 2: Get all photos from database
    console.log("\n🔍 Checking photos in database...");
    const dbPhotos = await prisma.photo.findMany();
    console.log(`Found ${dbPhotos.length} photos in database`);

    // Step 3: Identify photos to remove
    const photosToRemove = dbPhotos.filter((dbPhoto) => {
      const filename = path.basename(dbPhoto.src);
      return !availablePhotos.has(filename);
    });

    console.log(
      `\n❌ Found ${photosToRemove.length} photos in database that don't exist in Nextcloud:`,
    );
    photosToRemove.forEach((photo) => {
      console.log(
        `   - ID: ${photo.id}, Title: "${photo.title}", Filename: ${path.basename(photo.src)}`,
      );
    });

    // Step 4: Remove the non-existent photos from the database
    if (photosToRemove.length > 0) {
      console.log("\n🗑️ Removing non-existent photos from database...");

      for (const photo of photosToRemove) {
        await prisma.photo.delete({
          where: { id: photo.id },
        });
        console.log(`   ✅ Removed photo: ${photo.title} (ID: ${photo.id})`);
      }

      console.log("✅ Database cleanup completed");
    } else {
      console.log("\n✅ No photos need to be removed from the database");
    }

    // Step 5: Also update the photos.json file for fallback
    console.log("\n📝 Updating photos.json file for fallback...");
    const photosJsonPath = path.join(
      process.cwd(),
      "src",
      "data",
      "photos.json",
    );

    try {
      // Read the current json file
      const photosJson = JSON.parse(fs.readFileSync(photosJsonPath, "utf8"));

      // Filter out photos that don't exist in Nextcloud
      const updatedPhotos = photosJson.photos.filter((photo) => {
        const filename = path.basename(photo.src);
        return availablePhotos.has(filename);
      });

      // Write the updated json back to file
      photosJson.photos = updatedPhotos;
      fs.writeFileSync(photosJsonPath, JSON.stringify(photosJson, null, 2));

      console.log(
        `✅ Updated photos.json - now contains ${updatedPhotos.length} photos`,
      );
    } catch (error) {
      console.error(`❌ Error updating photos.json: ${error.message}`);
    }

    console.log("\n🎉 Synchronization completed!");
  } catch (error) {
    console.error("❌ Synchronization failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDatabaseWithNextcloud();
