/**
 * Database path consistency verification script
 * Ensures all database records use the standard format
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verifyDatabaseConsistency() {
  console.log("=".repeat(50));
  console.log(" DATABASE PATH CONSISTENCY VERIFICATION ");
  console.log("=".repeat(50));

  // Get all photos
  const allPhotos = await prisma.photo.findMany();
  console.log(`Found ${allPhotos.length} total photos in database.`);

  // Check for standard format
  const standardFormatPhotos = allPhotos.filter(
    (photo) =>
      photo.src.startsWith("/api/photos/") || photo.src.startsWith("/photos/"),
  );

  console.log(
    `Photos with standard path format: ${standardFormatPhotos.length}`,
  );

  // Find non-standard format photos
  const nonStandardPhotos = allPhotos.filter(
    (photo) =>
      !photo.src.startsWith("/api/photos/") &&
      !photo.src.startsWith("/photos/"),
  );

  console.log(
    `Photos with non-standard path format: ${nonStandardPhotos.length}`,
  );

  // Show details of non-standard photos
  if (nonStandardPhotos.length > 0) {
    console.log("\nPhotos with non-standard paths:");
    nonStandardPhotos.forEach((photo) => {
      console.log(
        `- ID: ${photo.id}, Path: ${photo.src}, Title: ${photo.title || "No title"}`,
      );
    });

    // Suggest fix
    console.log(
      '\nRun the "refresh-database.js" script to fix these inconsistent paths.',
    );
  } else {
    console.log("\n✅ Success! All database records use standard path format.");
    console.log(
      "The database is consistent with our universal image loading solution.",
    );
  }

  await prisma.$disconnect();
}

// Run the verification
verifyDatabaseConsistency().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
