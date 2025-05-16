/**
 * Final verification script for the universal image loading solution
 * This script checks that all image types load correctly in the live deployment
 */
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const USE_HTTPS = process.env.USE_HTTPS === "true";
const BASE_URL = process.env.VERIFY_URL || "http://localhost:3000";
const TEST_IMAGES = [
  // Previously problematic timestamp-prefixed images
  "1747175977747-playground-poise.jpeg",
  "1747175912709-diverse-perspectives-campus-connections.jpeg",
  // Regular images
  "1747177111179-where-the-light-falls-soft.jpg",
  // Add a non-existent image to test fallback
  "non-existent-image-123456.jpg",
];

// Output directory for verification images
const OUTPUT_DIR = path.join(__dirname, "final-verification");

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function fetchImage(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching: ${url}`);
    const httpClient = url.startsWith("https:") ? https : http;

    // Implement timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout fetching ${url}`));
    }, timeout);

    const req = httpClient.get(url, (res) => {
      const { statusCode } = res;
      const contentType = res.headers["content-type"];

      console.log(`Status: ${statusCode}`);
      console.log(`Content-Type: ${contentType}`);

      let error;
      if (statusCode !== 200) {
        error = new Error(`Request Failed. Status Code: ${statusCode}`);
      }

      if (error) {
        res.resume(); // Consume response to free memory
        clearTimeout(timeoutId);
        reject(error);
        return;
      }

      // Collect the data
      const chunks = [];
      let size = 0;

      res.on("data", (chunk) => {
        chunks.push(chunk);
        size += chunk.length;
      });

      res.on("end", () => {
        clearTimeout(timeoutId);
        const data = Buffer.concat(chunks);
        console.log(`Received ${data.length} bytes`);

        if (data.length === 0) {
          reject(new Error("Empty response"));
          return;
        }

        resolve({
          data,
          contentType,
          statusCode,
          size: data.length,
        });
      });
    });

    req.on("error", (e) => {
      clearTimeout(timeoutId);
      reject(new Error(`Error fetching ${url}: ${e.message}`));
    });
  });
}

async function verifyImageLoading() {
  console.log("=".repeat(50));
  console.log(" FINAL VERIFICATION - UNIVERSAL IMAGE LOADING SOLUTION ");
  console.log("=".repeat(50));
  console.log(`\nTesting against: ${BASE_URL}\n`);

  // Get all photos from database
  const dbPhotos = await prisma.photo.findMany({
    select: { id: true, src: true, title: true },
    take: 5, // Limit to avoid testing too many
  });

  console.log(`Found ${dbPhotos.length} photos in database.`);

  // Combine database photos with test images
  const testImages = [...TEST_IMAGES];
  dbPhotos.forEach((photo) => {
    // Extract filename from src path
    const filename = photo.src.split("/").pop();
    if (filename && !testImages.includes(filename)) {
      testImages.push(filename);
    }
  });

  // Remove duplicates
  const uniqueTestImages = [...new Set(testImages)];
  console.log(`Testing ${uniqueTestImages.length} unique images...\n`);

  // Results tracking
  const successful = [];
  const failed = [];

  // Test each image
  for (const imageFilename of uniqueTestImages) {
    console.log(`\n===== Testing ${imageFilename} =====`);
    const imageUrl = `${BASE_URL}/api/photos/${imageFilename}`;

    try {
      const startTime = Date.now();
      const result = await fetchImage(imageUrl);
      const duration = Date.now() - startTime;

      // Save verified image to disk
      const outputPath = path.join(OUTPUT_DIR, `final-${imageFilename}`);
      fs.writeFileSync(outputPath, result.data);
      console.log(
        `✅ SUCCESS: Image loaded successfully (${result.size} bytes, ${duration}ms)`,
      );
      console.log(`Saved verified image to: ${outputPath}`);

      successful.push({
        filename: imageFilename,
        size: result.size,
        duration,
      });
    } catch (error) {
      const duration = Date.now() - new Date();
      console.log(
        `❌ FAILED: Could not load image "${imageFilename}" (${duration}ms)`,
      );
      console.log(`   Error: ${error.message}`);

      failed.push({
        filename: imageFilename,
        error: error.message,
        duration,
      });
    }
  }

  // Print results summary
  console.log(`\n================= Results Summary =================`);
  console.log(`Tests run: ${uniqueTestImages.length}`);
  console.log(`Successful: ${successful.length}`);
  console.log(`Failed: ${failed.length}`);

  console.log(`\n✅ SUCCESSFUL TESTS:`);
  successful.forEach((test) => {
    console.log(`- ${test.filename}: ${test.size} bytes (${test.duration}ms)`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ FAILED TESTS:`);
    failed.forEach((test) => {
      console.log(`- ${test.filename}: ${test.error} (${test.duration}ms)`);
    });
    console.log(`\n⚠️ Some images failed to load.`);
  } else {
    console.log(
      `\n🎉 All images loaded successfully! The universal solution is working perfectly.`,
    );
  }

  await prisma.$disconnect();
}

// Run the verification
verifyImageLoading().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
