/**
 * Test script for photo upload functionality with a direct API call
 */

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Configuration
const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("🧪 Testing direct API upload functionality");
  console.log("====================================\n");

  try {
    // Test the API endpoint directly
    console.log("\n📤 Calling the test upload API endpoint...");

    const response = await fetch(`${BASE_URL}/api/test-upload`);
    const statusCode = response.status;
    let responseData = null;

    try {
      responseData = await response.json();
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
    }

    console.log(`🔍 Response status: ${statusCode}`);

    if (responseData) {
      console.log("🔍 Response data:", JSON.stringify(responseData, null, 2));

      if (responseData.success) {
        console.log("✅ Test upload API call successful!");
        if (responseData.filename) {
          console.log(`📝 Uploaded test file: ${responseData.filename}`);
        }
      } else {
        console.log("❌ Test upload API call failed.");
        if (responseData.error) {
          console.error("Error details:", responseData.error);
        }
        if (responseData.stack) {
          console.error("Error stack:", responseData.stack);
        }
      }
    } else {
      console.log("❌ No valid JSON response received");
    }
  } catch (error) {
    console.error("❌ Error calling test API:", error.message);
  }
}

main().catch(console.error);
