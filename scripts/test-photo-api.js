/**
 * Test script for photo loading
 * This script uses curl to test the photo API endpoints
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const BASE_URL = "http://localhost:3000";
const TEST_PHOTOS = [
  "image_1.jpg",
  "image_2.jpg",
  "image_3.jpg",
  "photo_01.jpg",
];

// Function to make API requests
function makeRequest(url) {
  try {
    console.log(`🔍 Testing URL: ${url}`);
    const output = execSync(`curl -s -I "${url}"`, { encoding: "utf8" });
    return { success: !output.includes("404"), output };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

// Test the photos API
console.log("🧪 Testing photos API...");
console.log("----------------------------------------");

// First test the photos list endpoint
try {
  console.log("📋 Testing /api/photos endpoint...");
  const photosOutput = execSync(`curl -s "${BASE_URL}/api/photos"`, {
    encoding: "utf8",
  });
  const photosData = JSON.parse(photosOutput);

  console.log(
    `✅ /api/photos returned ${photosData.photos?.length || 0} photos`,
  );
  if (photosData.photos?.length > 0) {
    console.log(`   First photo: ${photosData.photos[0].src}`);
  }

  // Now test individual photo endpoints
  console.log("\n📷 Testing individual photo endpoints...");

  // If we have photos from the API, test the first 3
  if (photosData.photos?.length > 0) {
    const samplesToTest = photosData.photos.slice(0, 3);
    for (const photo of samplesToTest) {
      const photoFilename = path.basename(photo.src);
      const photoUrl = `${BASE_URL}/api/photos/${photoFilename}`;
      const result = makeRequest(photoUrl);
      console.log(`${result.success ? "✅" : "❌"} ${photoUrl}`);
      if (!result.success) {
        console.log("   Response:", result.output.split("\n")[0]);
      }
    }
  } else {
    // Otherwise test some predefined photo paths
    for (const photoName of TEST_PHOTOS) {
      const photoUrl = `${BASE_URL}/api/photos/${photoName}`;
      const result = makeRequest(photoUrl);
      console.log(`${result.success ? "✅" : "❌"} ${photoUrl}`);
      if (!result.success) {
        console.log("   Response:", result.output.split("\n")[0]);
      }
    }
  }
} catch (error) {
  console.error("❌ Error testing photos API:", error.message);
}

console.log("\n✨ Test completed");
