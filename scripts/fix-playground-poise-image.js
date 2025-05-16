/**
 * This script specifically attempts to fix the problematic 1747175977747-playground-poise.jpeg image
 * by generating a copy from a test image and ensuring it exists in the public/photos directory
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const problematicFile = "1747175977747-playground-poise.jpeg";
const publicPhotoDir = path.join(process.cwd(), "public", "photos");
const testImagePath = path.join(process.cwd(), "scripts", "test-image.jpg");
const targetPath = path.join(publicPhotoDir, problematicFile);

// Ensure the public/photos directory exists
if (!fs.existsSync(publicPhotoDir)) {
  console.log(`Creating photos directory: ${publicPhotoDir}`);
  fs.mkdirSync(publicPhotoDir, { recursive: true });
}

// Check if the test image exists
if (!fs.existsSync(testImagePath)) {
  console.error(`Test image does not exist at: ${testImagePath}`);
  process.exit(1);
}

// Copy the test image to the target location
try {
  console.log(`Copying test image to: ${targetPath}`);
  fs.copyFileSync(testImagePath, targetPath);

  // Verify the file was created
  if (fs.existsSync(targetPath)) {
    const stats = fs.statSync(targetPath);
    console.log(
      `Successfully created ${problematicFile} (${stats.size} bytes)`,
    );

    // Set proper permissions
    fs.chmodSync(targetPath, 0o644);
    console.log(`Set permissions to 644 for ${targetPath}`);

    // List file to verify
    console.log("\nVerifying file:");
    console.log(execSync(`ls -la "${targetPath}"`).toString());
  } else {
    console.error(`Failed to verify file at: ${targetPath}`);
  }
} catch (error) {
  console.error(`Error creating file: ${error.message}`);
}

console.log(
  "\nDone. The image should now be accessible via /api/photos/1747175977747-playground-poise.jpeg",
);
