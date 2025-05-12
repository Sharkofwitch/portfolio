/**
 * Simple script to test the photos API directly
 * This can help diagnose image loading issues
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Configuration
const API_HOST = "localhost";
const API_PORT = 3000;
const API_PATH = "/api/photos";
const OUTPUT_DIR = path.join(__dirname, "api-test-output");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Promisify HTTP requests
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(`Request failed with status code ${res.statusCode}`),
          );
          return;
        }

        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => {
          try {
            const result = JSON.parse(Buffer.concat(data).toString());
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

// Get a single photo
function getPhoto(filename) {
  return new Promise((resolve, reject) => {
    const url = `http://${API_HOST}:${API_PORT}/api/photos/${encodeURIComponent(filename)}`;
    console.log(`Fetching photo: ${url}`);

    http
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(
            new Error(`Request failed with status code ${res.statusCode}`),
          );
          return;
        }

        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => {
          try {
            const buffer = Buffer.concat(data);
            const outputPath = path.join(OUTPUT_DIR, filename);
            fs.writeFileSync(outputPath, buffer);
            console.log(
              `Saved photo to ${outputPath} (${buffer.length} bytes)`,
            );
            resolve(outputPath);
          } catch (e) {
            reject(new Error(`Failed to save photo: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function testApi() {
  try {
    console.log("🔍 Testing Photos API");
    console.log(`URL: http://${API_HOST}:${API_PORT}${API_PATH}`);
    console.log("-------------------------------");

    // Fetch list of photos
    console.log("\n📋 Fetching photo list...");
    const apiUrl = `http://${API_HOST}:${API_PORT}${API_PATH}`;
    const photoData = await httpGet(apiUrl);

    console.log("API Response type:", typeof photoData);
    console.log("Is array?", Array.isArray(photoData));
    console.log("Has photos property?", !!photoData.photos);

    // Get photos array
    const photos = Array.isArray(photoData) ? photoData : photoData.photos;

    if (!photos || photos.length === 0) {
      console.log("❌ No photos returned from API");
      return;
    }

    console.log(`✅ Found ${photos.length} photos`);

    // Test downloading a few photos
    console.log("\n📥 Testing photo download...");
    const samplesToTest = photos.slice(0, 3);

    for (const photo of samplesToTest) {
      const filename = photo.src.split("/").pop();
      console.log(`\n📷 Testing photo: ${filename}`);

      try {
        await getPhoto(filename);
        console.log("✅ Download successful");
      } catch (err) {
        console.log(`❌ Download failed: ${err.message}`);
      }
    }

    console.log("\n✅ API test completed");
  } catch (error) {
    console.error("❌ Error testing API:", error);
  }
}

testApi();
