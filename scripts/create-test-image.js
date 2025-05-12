#!/usr/bin/env node

/**
 * This script creates a test image for upload testing
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

console.log("🖼️ Creating test image for upload testing...");

// Create a simple gradient image
const width = 800;
const height = 600;
const outputPath = path.join(__dirname, "test-image.jpg");

// Generate a simple gradient image
sharp({
  create: {
    width,
    height,
    channels: 3,
    background: { r: 255, g: 100, b: 100 },
  },
})
  .jpeg({
    quality: 90,
  })
  .toFile(outputPath)
  .then(() => {
    console.log(`✅ Created test image: ${outputPath}`);
    console.log(`   Dimensions: ${width}x${height}, JPEG format`);

    // Get file size
    const stats = fs.statSync(outputPath);
    console.log(`   File size: ${Math.round(stats.size / 1024)} KB`);
  })
  .catch((err) => {
    console.error("❌ Error creating test image:", err);
    process.exit(1);
  });
