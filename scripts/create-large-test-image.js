#!/usr/bin/env node

/**
 * This script creates a larger test image for upload testing
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

console.log("🖼️ Creating larger test image for upload testing...");

// Create a larger image to test resizing
const width = 3000;
const height = 2000;
const outputPath = path.join(__dirname, "large-test-image.jpg");

// Generate gradient image with more complex pattern
sharp({
  create: {
    width,
    height,
    channels: 3,
    background: { r: 0, g: 0, b: 0 },
  },
})
  .composite([
    {
      input: Buffer.from([
        255,
        0,
        0, // red
        0,
        255,
        0, // green
        0,
        0,
        255, // blue
        255,
        255,
        0, // yellow
      ]),
      raw: {
        width: 2,
        height: 2,
        channels: 3,
      },
      tile: true,
      gravity: "center",
    },
  ])
  .jpeg({
    quality: 90,
  })
  .toFile(outputPath)
  .then(() => {
    console.log(`✅ Created larger test image: ${outputPath}`);
    console.log(`   Dimensions: ${width}x${height}, JPEG format`);

    // Get file size
    const stats = fs.statSync(outputPath);
    console.log(`   File size: ${Math.round(stats.size / 1024)} KB`);
  })
  .catch((err) => {
    console.error("❌ Error creating test image:", err);
    process.exit(1);
  });
