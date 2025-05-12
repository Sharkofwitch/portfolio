/**
 * Simple API test script using direct HTTP requests
 */
const http = require("http");

// Configuration
const API_BASE_URL = "http://localhost:3000/api";
const ENDPOINTS = [
  "/photos",
  "/photos/image_35.jpg",
  "/photos/image_13.jpg",
  "/photos/image_9.jpg",
  // Test problematic photos that should use placeholders
  "/photos/image_12.jpg",
  "/photos/image_36.jpg",
];

// Function to make API requests
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = API_BASE_URL + endpoint;
    console.log(`🔍 Testing API endpoint: ${url}`);

    http
      .get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers["content-type"];

        console.log(
          `   Status: ${statusCode} - ${http.STATUS_CODES[statusCode]}`,
        );
        console.log(`   Content-Type: ${contentType}`);

        // Follow redirects
        if (statusCode === 302 || statusCode === 301) {
          console.log(`   Redirected to: ${res.headers.location}`);
        }

        let error;
        if (statusCode !== 200 && statusCode !== 302 && statusCode !== 301) {
          error = new Error(`Request Failed. Status Code: ${statusCode}`);
        }

        if (error) {
          // Consume response data to free up memory
          res.resume();
          reject(error);
          return;
        }

        res.setEncoding("utf8");
        let rawData = "";

        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            if (contentType?.includes("application/json")) {
              const parsedData = JSON.parse(rawData);
              console.log(
                `   Response data summary: ${JSON.stringify(parsedData).substring(0, 70)}...`,
              );
            } else if (contentType?.includes("image/")) {
              console.log(`   Successfully received image data`);
            } else {
              console.log(`   Response: ${rawData.substring(0, 70)}...`);
            }
            resolve({ statusCode, contentType, data: rawData });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (e) => {
        console.error(`   ❌ HTTP request error: ${e.message}`);
        reject(e);
      });
  });
}

// Main function to test all endpoints
async function testAllEndpoints() {
  console.log("🧪 Testing Portfolio API Endpoints");
  console.log("=================================\n");

  for (const endpoint of ENDPOINTS) {
    try {
      await makeRequest(endpoint);
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}: ${error.message}`);
    }
    console.log(); // Add a newline between tests
  }

  console.log("✨ API testing completed");
}

// Run the tests
testAllEndpoints();
