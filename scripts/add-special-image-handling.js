/**
 * This script adds direct handling for problematic image files in the API route
 *
 * It modifies the [filename]/route.ts file to add special handling patterns
 * for the problematic images.
 */
const fs = require("fs");
const path = require("path");

// Configuration
const ROUTE_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "api",
  "photos",
  "[filename]",
  "route.ts",
);
const PROBLEMATIC_FILES = [
  {
    timestamp: "1747175977747-playground-poise.jpeg",
    baseName: "playground-poise.jpeg",
    altPaths: [
      "/photos/playground-poise.jpeg",
      "/Photos/playground-poise.jpeg",
      "/Portfolio/playground-poise.jpeg",
      "/Photos/Portfolio/playground-poise.jpeg",
      "playground-poise.jpeg",
    ],
  },
  {
    timestamp: "1747175912709-diverse-perspectives-campus-connections.jpeg",
    baseName: "diverse-perspectives-campus-connections.jpeg",
    altPaths: [
      "/photos/diverse-perspectives-campus-connections.jpeg",
      "/Photos/diverse-perspectives-campus-connections.jpeg",
      "/Portfolio/diverse-perspectives-campus-connections.jpeg",
      "/Photos/Portfolio/diverse-perspectives-campus-connections.jpeg",
      "diverse-perspectives-campus-connections.jpeg",
    ],
  },
];

// Function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

// Function to write a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Updated ${filePath}`);
}

// Main function
function main() {
  console.log(`Enhancing API route for specific problematic images`);

  try {
    // Read the current file content
    const routeContent = readFile(ROUTE_FILE_PATH);

    // Define the code to add
    const newSpecialCaseCode = `
    // Special case handling for known problematic images
    if (filename === "1747175977747-playground-poise.jpeg" || 
        filename === "1747175912709-diverse-perspectives-campus-connections.jpeg") {
      
      console.log(\`[API] Special handling for known problematic file: \${filename}\`);
      
      // Define special paths to try based on the filename
      const directPaths = [];
      
      if (filename === "1747175977747-playground-poise.jpeg") {
        directPaths.push(
          "playground-poise.jpeg",
          "/Photos/playground-poise.jpeg",
          "/photos/playground-poise.jpeg",
          "/Portfolio/playground-poise.jpeg",
          "/Photos/Portfolio/playground-poise.jpeg"
        );
      } else if (filename === "1747175912709-diverse-perspectives-campus-connections.jpeg") {
        directPaths.push(
          "diverse-perspectives-campus-connections.jpeg",
          "/Photos/diverse-perspectives-campus-connections.jpeg",
          "/photos/diverse-perspectives-campus-connections.jpeg",
          "/Portfolio/diverse-perspectives-campus-connections.jpeg",
          "/Photos/Portfolio/diverse-perspectives-campus-connections.jpeg"
        );
      }
      
      // Try each path directly
      for (const directPath of directPaths) {
        try {
          console.log(\`[API] Trying direct path: \${directPath} for \${filename}\`);
          const directBuffer = await downloadPhoto(directPath);
          if (directBuffer) {
            console.log(\`[API] Successfully loaded using direct path: \${directPath}\`);
            return new NextResponse(directBuffer, {
              headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }
        } catch (directError) {
          console.error(\`[API] Error with direct path \${directPath}:\`, directError);
        }
      }
      
      console.log(\`[API] All direct paths failed for \${filename}, continuing with regular strategies\`);
    }`;

    // Find the insertion point after the known bad files section
    const insertionPoint =
      routeContent.indexOf("const knownBadFiles") !== -1
        ? routeContent.indexOf(
            "return NextResponse.redirect",
            routeContent.indexOf("const knownBadFiles"),
          )
        : -1;

    if (insertionPoint === -1) {
      console.error(
        "Could not find appropriate insertion point in the route file",
      );
      process.exit(1);
    }

    // Get the closing bracket and the following content
    const closingBracketIndex = routeContent.indexOf("}", insertionPoint) + 1;

    // Insert our new code after the closing bracket
    const newContent =
      routeContent.substring(0, closingBracketIndex) +
      newSpecialCaseCode +
      routeContent.substring(closingBracketIndex);

    // Write the updated content
    writeFile(ROUTE_FILE_PATH, newContent);

    console.log("Special case handling successfully added!");
  } catch (error) {
    console.error("Error updating the route file:", error);
    process.exit(1);
  }
}

main();
