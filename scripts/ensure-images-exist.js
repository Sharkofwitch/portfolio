#!/usr/bin/env node

/**
 * This script ensures that all images in the database have corresponding files
 * by copying sample images to the public/photos directory if needed
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function ensureImagesExist() {
  console.log("Starting to ensure all images exist...");

  try {
    // Get all photos from the database
    const photos = await prisma.photo.findMany();
    console.log(`Found ${photos.length} photos in database.`);

    // Ensure public/photos directory exists
    const photosDir = path.join(process.cwd(), "public/photos");
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
      console.log(`Created directory: ${photosDir}`);
    }

    // Sample images to use for missing files
    const sampleImages = [
      path.join(process.cwd(), "scripts/test-image.jpg"),
      path.join(process.cwd(), "scripts/processed-test-image.jpg"),
    ];

    let sampleImageIndex = 0;
    let restoredCount = 0;

    // Check each photo and create placeholder files if needed
    for (const photo of photos) {
      // Extract filename from the path
      const filename = photo.src.split("/").pop();
      const targetPath = path.join(photosDir, filename);

      // If the file doesn't exist, copy a sample image
      if (!fs.existsSync(targetPath)) {
        // Find a sample image that exists
        let sampleImage = null;
        for (let i = 0; i < sampleImages.length; i++) {
          const index = (sampleImageIndex + i) % sampleImages.length;
          if (fs.existsSync(sampleImages[index])) {
            sampleImage = sampleImages[index];
            sampleImageIndex = (index + 1) % sampleImages.length;
            break;
          }
        }

        if (sampleImage) {
          try {
            // Copy the sample image with the required filename
            fs.copyFileSync(sampleImage, targetPath);
            console.log(`Created placeholder for: ${filename}`);
            restoredCount++;
          } catch (error) {
            console.error(`Error copying file for ${filename}:`, error);
          }
        } else {
          console.error("No sample images found!");
          break;
        }
      }
    }

    console.log(`Restored ${restoredCount} missing image files.`);
  } catch (error) {
    console.error("Error ensuring images exist:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureImagesExist()
  .then(() => console.log("Image existence check complete!"))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
