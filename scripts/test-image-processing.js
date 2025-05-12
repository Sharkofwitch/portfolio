#!/usr/bin/env node

/**
 * This script provides a simplified test for the image processing functionality
 * without requiring authentication. It helps test the core image processing logic.
 */

import("sharp").then(async (sharpModule) => {
  const sharp = sharpModule.default;
  const fs = await import("fs");
  const path = await import("path");

  console.log("🖼️ Testing image processing functionality...");

  // Path to test image
  const testImagePath =
    process.argv[2] || path.join(__dirname, "test-image.jpg");
  const outputPath = path.join(__dirname, "processed-test-image.jpg");

  try {
    // Check if test image exists
    if (!fs.existsSync(testImagePath)) {
      console.error(`❌ Test image not found at ${testImagePath}`);
      process.exit(1);
    }

    // Read test image
    const imageBuffer = fs.readFileSync(testImagePath);
    const originalSize = imageBuffer.length;
    console.log(
      `📄 Original image size: ${Math.round(originalSize / 1024)} KB`,
    );

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📊 Image dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`📋 Format: ${metadata.format}`);

    // Process image (resize to fit within 1200x1200)
    console.log(`\n🔄 Processing image...`);

    // Calculate new dimensions (maintaining aspect ratio)
    const maxWidth = 1200;
    const maxHeight = 1200;

    let newWidth = metadata.width;
    let newHeight = metadata.height;

    if (metadata.width > maxWidth) {
      newWidth = maxWidth;
      newHeight = Math.round(metadata.height * (maxWidth / metadata.width));
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = Math.round(metadata.width * (maxHeight / metadata.height));
    }

    // Only resize if dimensions changed
    let processedBuffer;
    if (newWidth !== metadata.width || newHeight !== metadata.height) {
      console.log(`📏 Resizing to ${newWidth}x${newHeight}`);
      processedBuffer = await sharp(imageBuffer)
        .resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      console.log(`📏 No resize needed, dimensions within limits`);
      processedBuffer = imageBuffer;
    }

    // Optimize quality if image is still too large (> 2MB)
    const maxSizeMB = 2;
    if (processedBuffer.length > maxSizeMB * 1024 * 1024) {
      console.log(`📉 Reducing quality to fit within ${maxSizeMB}MB...`);

      // Try with decreasing quality until size is acceptable
      for (let quality = 80; quality >= 60; quality -= 5) {
        console.log(`🔄 Trying quality: ${quality}%`);
        processedBuffer = await sharp(imageBuffer)
          .resize(newWidth, newHeight, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toBuffer();

        if (processedBuffer.length <= maxSizeMB * 1024 * 1024) {
          console.log(`✅ Target size achieved with quality: ${quality}%`);
          break;
        }
      }
    }

    // Save processed image for inspection
    fs.writeFileSync(outputPath, processedBuffer);

    // Compare sizes
    const processedSize = processedBuffer.length;
    const reduction = Math.round((1 - processedSize / originalSize) * 100);

    console.log(`\n📊 Results:`);
    console.log(`   - Original size: ${Math.round(originalSize / 1024)} KB`);
    console.log(`   - Processed size: ${Math.round(processedSize / 1024)} KB`);
    console.log(
      `   - Size reduction: ${reduction}% ${reduction > 0 ? "✅" : "⚠️"}`,
    );
    console.log(`   - Processed image saved to: ${outputPath}`);

    console.log(`\n✅ Image processing test completed successfully!`);
  } catch (error) {
    console.error(`\n❌ Error during image processing test:`);
    console.error(error);
    process.exit(1);
  }
});
