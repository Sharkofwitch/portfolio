/**
 * Test script for photo upload functionality
 */

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Configuration
const BASE_URL = "http://localhost:3000";
const TEST_IMAGE_PATH = path.join(__dirname, "api-test-output", "image_9.jpg");
const LOGIN_ENDPOINT = `${BASE_URL}/api/auth/signin`;
const UPLOAD_ENDPOINT = `${BASE_URL}/api/photos`;

async function main() {
  // Import node-fetch dynamically
  const fetch = await import("node-fetch");

  console.log("🧪 Testing photo upload functionality");
  console.log("====================================\n");

  // Check if test image exists
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.error(`❌ Test image not found at: ${TEST_IMAGE_PATH}`);
    return;
  }

  console.log(`✅ Test image found: ${TEST_IMAGE_PATH}`);

  // Create form data for upload
  const formData = new FormData();
  formData.append("file", fs.createReadStream(TEST_IMAGE_PATH));
  formData.append("title", "Upload Test Photo");
  formData.append("alt", "This is a test upload");
  formData.append("year", "2025");
  formData.append("location", "Test Location");
  formData.append("camera", "Test Camera");
  formData.append("description", "This photo was uploaded using a test script");

  console.log("\n📤 Attempting to upload photo...");

  try {
    // Make the upload request
    const response = await fetch.default(UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    const statusCode = response.status;
    const responseData = await response.json().catch(() => null);

    console.log(`🔍 Response status: ${statusCode}`);
    console.log("🔍 Response data:", JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log("✅ Upload successful!");

      if (responseData?.photo?.id) {
        console.log(`📝 Photo ID: ${responseData.photo.id}`);
        console.log(`📝 Photo source: ${responseData.photo.src}`);
      }
    } else {
      console.log("❌ Upload failed.");
    }
  } catch (error) {
    console.error("❌ Error during upload:", error.message);
  }
}

main().catch(console.error);
