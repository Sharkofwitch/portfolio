/**
 * This script specifically tests loading the problematic images from Nextcloud
 * using multiple possible path formats.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Import the downloadPhoto function from the Nextcloud module
async function main() {
  try {
    console.log("Testing direct Nextcloud access for problematic images");

    // Load required modules dynamically
    const { downloadPhoto } = require("../src/lib/nextcloud");

    // Define the problematic files
    const problematicFiles = {
      "1747175977747-playground-poise.jpeg": "playground-poise.jpeg",
      "1747175912709-diverse-perspectives-campus-connections.jpeg":
        "diverse-perspectives-campus-connections.jpeg",
    };

    // Test each file with multiple path formats
    for (const [timestampFilename, baseFilename] of Object.entries(
      problematicFiles,
    )) {
      console.log(`\n===== Testing ${timestampFilename} =====`);

      // Create an array of paths to try
      const pathsToTry = [
        baseFilename,
        `/${baseFilename}`,
        `/photos/${baseFilename}`,
        `/Photos/${baseFilename}`,
        `/Portfolio/${baseFilename}`,
        `/Photos/Portfolio/${baseFilename}`,
        `/photos/Portfolio/${baseFilename}`,
        timestampFilename,
        `/${timestampFilename}`,
        `/photos/${timestampFilename}`,
        `/Photos/${timestampFilename}`,
      ];

      console.log(`Trying paths: ${pathsToTry.join(", ")}`);

      // Try each path
      let successPath = null;
      let imageBuffer = null;

      for (const testPath of pathsToTry) {
        try {
          console.log(`Attempting to download from path: ${testPath}`);
          const buffer = await downloadPhoto(testPath);

          if (buffer && buffer.length > 0) {
            console.log(
              `✓ SUCCESS! Found image at path: ${testPath} (${buffer.length} bytes)`,
            );
            successPath = testPath;
            imageBuffer = buffer;
            break;
          } else {
            console.log(`✗ Path ${testPath} returned no data`);
          }
        } catch (error) {
          console.error(`✗ Error with path ${testPath}:`, error.message);
        }
      }

      if (successPath && imageBuffer) {
        console.log(
          `Found working path for ${timestampFilename}: ${successPath}`,
        );
        console.log(`Writing successful path to a file for reference...`);

        // Create a mapping file that can be used by the API route
        const mappingData = JSON.stringify(
          {
            filename: timestampFilename,
            workingPath: successPath,
            testedOn: new Date().toISOString(),
            bufferSize: imageBuffer.length,
          },
          null,
          2,
        );

        // Save the mapping data
        const mappingFilePath = path.join(
          process.cwd(),
          "scripts",
          `${timestampFilename.replace(/\..+$/, "")}-mapping.json`,
        );
        fs.writeFileSync(mappingFilePath, mappingData);
        console.log(`Mapping saved to: ${mappingFilePath}`);

        // Also save a copy of the actual image for debugging
        const debugDir = path.join(process.cwd(), "scripts", "debug-images");
        if (!fs.existsSync(debugDir)) {
          fs.mkdirSync(debugDir, { recursive: true });
        }

        const debugImagePath = path.join(debugDir, timestampFilename);
        fs.writeFileSync(debugImagePath, imageBuffer);
        console.log(`Debug image saved to: ${debugImagePath}`);
      } else {
        console.log(`❌ Failed to find working path for ${timestampFilename}`);
      }
    }

    console.log(
      "\nTest completed. Check the mapping files for successful paths.",
    );
  } catch (error) {
    console.error("Error running test script:", error);
    process.exit(1);
  }
}

// Run the main function
main();
