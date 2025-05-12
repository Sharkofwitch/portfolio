/**
 * Test script for Nextcloud connection and infrastructure
 * This script tests the entire photo loading stack
 */

const { execSync } = require("child_process");

// Configuration
const BASE_URL = "http://localhost:3000";

console.log("🧪 Portfolio Photos System Test");
console.log("===============================\n");

// Step 1: Test Nextcloud connection
console.log("Step 1: Testing Nextcloud connection");
console.log("----------------------------------");
try {
  const nextcloudOutput = execSync(`curl -s "${BASE_URL}/api/nextcloud-test"`, {
    encoding: "utf8",
  });
  const nextcloudData = JSON.parse(nextcloudOutput);

  if (nextcloudData.success) {
    console.log(`✅ Nextcloud connection: ${nextcloudData.message}`);
    console.log(
      `📷 Found ${nextcloudData.photosCount || 0} photos in Nextcloud`,
    );
    if (nextcloudData.photos && nextcloudData.photos.length > 0) {
      console.log("   Sample photos:");
      nextcloudData.photos.forEach((photo) => {
        console.log(`   - ${photo.filename} (${photo.publicUrl})`);
      });
    }
  } else {
    console.log(
      `❌ Nextcloud connection failed: ${nextcloudData.error || "Unknown error"}`,
    );
  }
} catch (error) {
  console.error("❌ Error testing Nextcloud connection:", error.message);
}

console.log();

// Step 2: Test database photos
console.log("Step 2: Testing database photos");
console.log("------------------------------");
try {
  const photosOutput = execSync(`curl -s "${BASE_URL}/api/photos"`, {
    encoding: "utf8",
  });
  const photosData = JSON.parse(photosOutput);

  if (photosData.success) {
    console.log(`✅ Database photos: Found ${photosData.photos.length} photos`);
    if (photosData.photos.length > 0) {
      console.log("   Sample photos:");
      photosData.photos.slice(0, 3).forEach((photo) => {
        console.log(`   - ${photo.title} (${photo.src})`);
      });
    }
  } else {
    console.log(
      `❌ Database photos failed: ${photosData.error || "Unknown error"}`,
    );
  }
} catch (error) {
  console.error("❌ Error testing database photos:", error.message);
}

console.log();

// Step 3: Test individual photo loading
console.log("Step 3: Testing individual photo URLs");
console.log("------------------------------------");

try {
  // Get list of photos from API
  const photosOutput = execSync(`curl -s "${BASE_URL}/api/photos"`, {
    encoding: "utf8",
  });
  const photosData = JSON.parse(photosOutput);

  if (photosData.photos && photosData.photos.length > 0) {
    // Test the first 5 photos or all if less than 5
    const samplesToTest = photosData.photos.slice(0, 5);
    let passCount = 0;
    let failCount = 0;

    for (const photo of samplesToTest) {
      const photoFilename = photo.src.split("/").pop();
      const photoUrl = `${BASE_URL}/api/photos/${photoFilename}`;

      try {
        // Use curl to test if the image loads (just headers)
        console.log(`🔍 Testing photo: ${photoFilename}`);
        const result = execSync(`curl -s -I "${photoUrl}"`, {
          encoding: "utf8",
        });
        const statusLine = result.split("\n")[0];
        const isSuccess = statusLine.includes("200");

        if (isSuccess) {
          console.log(`   ✅ Success: ${statusLine.trim()}`);
          // Also check content type
          const contentTypeLine = result
            .split("\n")
            .find((line) => line.toLowerCase().startsWith("content-type"));
          if (contentTypeLine) {
            console.log(`   📄 ${contentTypeLine.trim()}`);
          }
          passCount++;
        } else {
          console.log(`   ❌ Failed: ${statusLine.trim()}`);
          failCount++;
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failCount++;
      }
    }

    console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);
  } else {
    console.log("❓ No photos found to test");
  }
} catch (error) {
  console.error("❌ Error testing photo URLs:", error.message);
}

console.log("\n✨ Test completed");
