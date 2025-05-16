#!/usr/bin/env node

/**
 * This script fixes image paths in the database and ensures
 * they're all properly formatted for the API routes
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Format image path the same way as in utils.ts
 */
function formatImagePath(src) {
  if (!src) {
    return "/placeholder-image.svg";
  }

  // If it's already a complete URL or absolute path, return as is
  if (src.startsWith("http") || src.startsWith("data:")) {
    return src;
  }

  // Get the filename from the path
  const filename = src.split("/").pop();

  // If the filename contains a timestamp (likely from Date.now()), ensure it's using the API route
  if (filename && /^\d{13}-/.test(filename)) {
    return `/api/photos/${filename}`;
  }

  // If it's already properly formatted with /api/photos/ prefix, return as is
  if (src.startsWith("/api/photos/")) {
    return src;
  }

  // If it's using /photos/ prefix, convert it to use the API route
  if (src.startsWith("/photos/")) {
    return src.replace("/photos/", "/api/photos/");
  }

  // If it's just a filename, add the proper API prefix
  if (!src.startsWith("/")) {
    return `/api/photos/${src}`;
  }

  // For any other format, use the API route with the filename
  return `/api/photos/${src.split("/").pop()}`;
}

async function fixImagePaths() {
  console.log("Starting to fix image paths in database...");

  try {
    // Get all photos from the database
    const photos = await prisma.photo.findMany();
    console.log(`Found ${photos.length} photos in database.`);

    let updatedCount = 0;

    // Process each photo
    for (const photo of photos) {
      const originalPath = photo.src;
      const formattedPath = formatImagePath(originalPath);

      if (originalPath !== formattedPath) {
        console.log(`Updating path: ${originalPath} -> ${formattedPath}`);

        // Update the path in the database
        await prisma.photo.update({
          where: { id: photo.id },
          data: { src: formattedPath },
        });

        updatedCount++;
      }
    }

    console.log(
      `Updated ${updatedCount} photo paths out of ${photos.length} total.`,
    );
  } catch (error) {
    console.error("Error fixing image paths:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixImagePaths()
  .then(() => console.log("Image path fixing complete!"))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
