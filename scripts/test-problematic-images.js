/**
 * Test script to ensure all the problematic images load correctly
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

// Configuration
const TEST_IMAGES = ["1747175977747-playground-poise.jpeg", "image_35.jpg"];

const BASE_URL = "http://localhost:3000";

// Helper to make HTTP requests
function fetchImage(imagePath) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/api/photos/${imagePath}`;
    console.log(`Fetching image from: ${url}`);

    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      const { statusCode, headers } = res;
      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${headers["content-type"]}`);
      console.log(`Content-Length: ${headers["content-length"] || "unknown"}`);

      // Check if we got a redirect
      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        console.log(`Redirected to: ${headers.location}`);
      }

      // Accumulate data
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));

      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Received ${buffer.length} bytes`);

        resolve({
          success: statusCode >= 200 && statusCode < 300,
          statusCode,
          contentType: headers["content-type"],
          buffer,
          redirected: statusCode >= 300 && statusCode < 400,
          redirectLocation: headers.location,
        });
      });
    });

    req.on("error", (error) => {
      console.error(`Error fetching ${url}:`, error.message);
      reject(error);
    });

    req.end();
  });
}

// Main function
async function testImages() {
  console.log("Testing image loading...");

  // Check if local server is running
  try {
    await fetchImage("test-image.jpg");
  } catch (err) {
    console.error(
      "ERROR: Local development server does not appear to be running.",
    );
    console.error('Please start your Next.js server with "npm run dev" first.');
    process.exit(1);
  }

  // Test each problematic image
  for (const image of TEST_IMAGES) {
    console.log(`\n===== Testing ${image} =====`);

    try {
      const result = await fetchImage(image);

      if (result.success) {
        console.log(`✅ SUCCESS: ${image} loaded correctly`);

        // Save the fetched image to verify its content
        const debugPath = path.join(process.cwd(), "public", "debug");
        if (!fs.existsSync(debugPath)) {
          fs.mkdirSync(debugPath, { recursive: true });
        }

        fs.writeFileSync(
          path.join(debugPath, `fetched-${image}`),
          result.buffer,
        );
        console.log(`Saved fetched image to: public/debug/fetched-${image}`);
      } else if (result.redirected) {
        console.log(
          `⚠️ WARNING: ${image} was redirected to ${result.redirectLocation}`,
        );
      } else {
        console.log(
          `❌ FAILED: ${image} returned status code ${result.statusCode}`,
        );
      }
    } catch (error) {
      console.error(`❌ ERROR testing ${image}:`, error.message);
    }
  }

  console.log("\nTest complete.");
}

testImages();
