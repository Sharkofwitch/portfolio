/**
 * Test script to verify photo loading from Nextcloud
 * This script tests both the Nextcloud connection and direct photo loading
 */
const {
  downloadPhoto,
  testConnection,
  getPhotosWithMetadata,
} = require("../src/lib/nextcloud");
const path = require("path");

async function testPhotoLoading() {
  try {
    console.log("🔍 Testing Nextcloud connection...");
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
