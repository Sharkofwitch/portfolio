/**
 * This script attempts to fix any missing photos by ensuring they're uploaded to Nextcloud
 * and properly registered in the database
 */
const { PrismaClient } = require("@prisma/client");
const { existsSync } = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Initialize Prisma client
const prisma = new PrismaClient();

async function fixMissingPhotos() {
  try {
    console.log("🔧 Starting photo repair process");
    console.log("================================\n");

    // Step 1: Get all photos from database
    console.log("Step 1: Getting all photos from database");
    const dbPhotos = await prisma.photo.findMany();
    console.log(`Found ${dbPhotos.length} photos in database`);

    // Step 2: Check which photos might be missing in Nextcloud
    console.log("\nStep 2: Checking photo files in Nextcloud");

    // Get Nextcloud photos using the API
    const nextcloudOutput = execSync(
      "curl -s http://localhost:3000/api/nextcloud-test",
      { encoding: "utf8" },
    );
    const nextcloudData = JSON.parse(nextcloudOutput);

    const nextcloudPhotos = (nextcloudData.photos || []).map((p) => p.filename);
    console.log(`Found ${nextcloudPhotos.length} photos in Nextcloud`);

    // Step 3: Find photos that are in DB but not in Nextcloud
    const missingPhotos = dbPhotos.filter((dbPhoto) => {
      const filename = path.basename(dbPhoto.src);
      return !nextcloudPhotos.includes(filename);
    });

    console.log(
      `\nFound ${missingPhotos.length} photos that might need repair:`,
    );

    // Step 4: Check each missing photo and try to fix it
    for (const photo of missingPhotos) {
      const filename = path.basename(photo.src);
      console.log(`\n📷 Checking photo: ${filename} (${photo.title})`);

      // First, check if we have a local copy in public/photos
      const localPath = path.join(process.cwd(), "public/photos", filename);

      if (existsSync(localPath)) {
        console.log(`✅ Found local copy at: ${localPath}`);

        // Upload to Nextcloud
        try {
          console.log("🔄 Uploading to Nextcloud...");
          execSync(
            `curl -X PUT -u "$NEXTCLOUD_USERNAME:$NEXTCLOUD_PASSWORD" -T "${localPath}" "$NEXTCLOUD_URL/remote.php/webdav/Photos/Portfolio/${filename}"`,
          );
          console.log("✅ Upload successful");
        } catch (uploadError) {
          console.log(`❌ Upload failed: ${uploadError.message}`);
        }
      } else {
        console.log(`❌ No local copy found at: ${localPath}`);
      }

      // Test if the photo is accessible via the API now
      try {
        console.log("🔍 Testing photo URL...");
        execSync(
          `curl -s -I "http://localhost:3000/api/photos/${filename}" | grep "HTTP/1.1"`,
          { encoding: "utf8" },
        );
        console.log("✅ Photo is now accessible via API");
      } catch (error) {
        console.log("❌ Photo is still not accessible via API");
      }
    }

    console.log("\n✨ Repair process completed");
  } catch (error) {
    console.error("❌ Error during photo repair:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingPhotos();
