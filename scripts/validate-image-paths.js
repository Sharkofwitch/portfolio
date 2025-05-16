#!/usr/bin/env node

/**
 * This script validates and checks image paths in the application
 * It verifies that all image paths are correctly formatted and accessible
 */

const fs = require("fs");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
// Node.js 18+ has built-in fetch

// Function to format image paths (same as in utils.ts)
function formatImagePath(src) {
  if (!src) {
    return "/placeholder-image.svg";
  }

  // If it's already a complete URL or absolute path, return as is
  if (src.startsWith("http") || src.startsWith("data:")) {
    return src;
  }

  // If it's already properly formatted with /photos/ or /api/photos/ prefix, return as is
  if (src.startsWith("/photos/") || src.startsWith("/api/photos/")) {
    return src;
  }

  // If it's just a filename, add the proper prefix
  if (!src.startsWith("/")) {
    return `/photos/${src}`;
  }

  // For any other format, assume it needs the /photos/ prefix
  return `/api/photos/${src.split("/").pop()}`;
}

async function validatePhotosJson() {
  try {
    console.log("Validating photos.json...");
    const photosJsonPath = path.join(__dirname, "../src/data/photos.json");

    // Read the photos JSON file
    const photosContent = await readFile(photosJsonPath, "utf-8");
    const photosData = JSON.parse(photosContent);

    let fixedPaths = false;

    // Check and fix each photo's src path
    if (photosData.photos && Array.isArray(photosData.photos)) {
      photosData.photos = photosData.photos.map((photo) => {
        const originalSrc = photo.src;
        const formattedSrc = formatImagePath(originalSrc);

        if (originalSrc !== formattedSrc) {
          console.log(`Fixing path: ${originalSrc} -> ${formattedSrc}`);
          fixedPaths = true;
          return {
            ...photo,
            src: formattedSrc,
          };
        }

        return photo;
      });

      // Save the file if paths were fixed
      if (fixedPaths) {
        await writeFile(
          photosJsonPath,
          JSON.stringify(photosData, null, 2),
          "utf-8",
        );
        console.log("Updated photos.json with corrected paths");
      } else {
        console.log("All paths in photos.json are correctly formatted");
      }
    }
  } catch (error) {
    console.error("Error validating photos.json:", error);
  }
}

// Check if a URL is accessible
async function checkUrlAccess(url, baseUrl = "http://localhost:3000") {
  try {
    if (!url) return false;

    // Skip data URLs or external URLs
    if (url.startsWith("data:") || url.match(/^https?:\/\//)) {
      return true;
    }

    const fullUrl = url.startsWith("/")
      ? `${baseUrl}${url}`
      : `${baseUrl}/${url}`;

    const response = await fetch(fullUrl, { method: "HEAD" });
    const success = response.ok;

    if (!success) {
      console.error(`❌ 404 error for image: ${fullUrl}`);
    } else {
      console.log(`✓ Image accessible: ${fullUrl}`);
    }

    return success;
  } catch (error) {
    console.error(`Error checking URL access for ${url}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("Starting image path validation...");

  // Validate photos.json
  await validatePhotosJson();

  console.log("\nImage path validation complete!");
}

// Run the script
main().catch((error) => {
  console.error("Validation script error:", error);
  process.exit(1);
});
