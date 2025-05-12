/**
 * Simple direct test for Nextcloud and database
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

// Create Prisma client
const prisma = new PrismaClient();

// Main function
async function runSimpleTest() {
  try {
    console.log("🧪 Simple Database and Photos Test");
    console.log("================================\n");

    // Step 1: Check if the database is accessible
    console.log("Step 1: Database connection test");
    try {
      // Try to count photos
      const photoCount = await prisma.photo.count();
      console.log(
        `✅ Database connection successful. Found ${photoCount} photos.`,
      );

      // Get photo details
      const photos = await prisma.photo.findMany();
      console.log("Available photos in database:");
      photos.forEach((photo) => {
        console.log(`- ${photo.title} (${photo.src})`);
      });
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
    }

    console.log("\n✨ Test completed");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
runSimpleTest();
