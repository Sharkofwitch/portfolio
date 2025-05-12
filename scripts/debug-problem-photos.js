/**
 * Debugging script to check all possible paths for a specific photo
 */
const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugSpecificPhotos() {
  try {
    // Specific photos that are failing
    const problemPhotos = ["image_12.jpg", "image_36.jpg"];

    for (const photoFilename of problemPhotos) {
      console.log(`\n🔍 Debugging photo: ${photoFilename}`);

      // 1. Check if it exists in database
      console.log("\nChecking database...");
      const dbPhoto = await prisma.photo.findFirst({
        where: {
          src: {
            endsWith: photoFilename,
          },
        },
      });

      if (dbPhoto) {
        console.log(
          `✅ Found in database: ${JSON.stringify(dbPhoto, null, 2)}`,
        );
      } else {
        console.log("❌ Not found in database");
      }

      // 2. Check API directly
      console.log("\nChecking API directly...");
      try {
        const apiOutput = execSync(
          `curl -s -v "http://localhost:3000/api/photos/${photoFilename}" 2>&1`,
          { encoding: "utf8" },
        );
        console.log("API response excerpt:");
        console.log(
          apiOutput.substring(0, 500) + (apiOutput.length > 500 ? "..." : ""),
        );
      } catch (apiError) {
        console.log(`API error: ${apiError.message}`);
      }

      // 3. Test all critical code paths by calling a debug endpoint
      console.log("\nTesting all possible Nextcloud paths...");
      // Create a temporary debug file that shows all path attempts
      const debugCode = `
// filepath: /Users/admin/Coding/Web Development/portfolio/src/app/api/debug-photo/[filename]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'webdav';
import { getEnvVar } from '@/lib/env';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Constants from nextcloud.ts
const NEXTCLOUD_URL = getEnvVar("NEXTCLOUD_URL");
const NEXTCLOUD_USERNAME = getEnvVar("NEXTCLOUD_USERNAME");
const NEXTCLOUD_PASSWORD = getEnvVar("NEXTCLOUD_PASSWORD");
const NEXTCLOUD_PHOTOS_PATH = (process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio").replace(/\\/+/g, "/");

const baseUrl = NEXTCLOUD_URL.endsWith("/") ? NEXTCLOUD_URL.slice(0, -1) : NEXTCLOUD_URL;
const webdavUrl = \`\${baseUrl}/remote.php/webdav\`;

const client = createClient(webdavUrl, {
  username: NEXTCLOUD_USERNAME,
  password: NEXTCLOUD_PASSWORD,
  headers: { Accept: "*/*" }
});

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const src = \`/photos/\${filename}\`;
    const results = {
      filename,
      src,
      webdavUrl,
      photosPaths: NEXTCLOUD_PHOTOS_PATH,
      pathChecks: [],
      databaseRecord: null,
      environment: {
        NEXTCLOUD_URL,
        NEXTCLOUD_USERNAME: '***',
        NEXTCLOUD_PHOTOS_PATH: process.env.NEXTCLOUD_PHOTOS_PATH || '(fallback used)'
      },
      success: false
    };
    
    // Check database
    const dbPhoto = await prisma.photo.findFirst({ where: { src } });
    results.databaseRecord = dbPhoto;
    
    // Try multiple paths
    const pathsToTry = [
      NEXTCLOUD_PHOTOS_PATH.replace(/^\\/+|\\/+$/g, "") + "/" + filename,
      filename,
      \`Photos/\${filename}\`,
      \`Portfolio/\${filename}\`,
      \`Photos/Portfolio/\${filename}\`
    ];
    
    for (const path of pathsToTry) {
      try {
        const exists = await client.exists(path);
        results.pathChecks.push({
          path,
          exists,
          error: null
        });
        
        if (exists) {
          results.success = true;
        }
      } catch (error) {
        results.pathChecks.push({
          path,
          exists: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
      `;

      // We'll use the API to write this temporary debug file
      try {
        // Create the debug endpoint directory if it doesn't exist
        execSync(
          `mkdir -p "/Users/admin/Coding/Web Development/portfolio/src/app/api/debug-photo/[filename]"`,
        );

        // Write the debug file
        require("fs").writeFileSync(
          "/Users/admin/Coding/Web Development/portfolio/src/app/api/debug-photo/[filename]/route.ts",
          debugCode,
        );

        // Wait a bit for Next.js to compile it
        console.log("Created debug endpoint, waiting for compilation...");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Call the debug endpoint
        const debugOutput = execSync(
          `curl -s "http://localhost:3000/api/debug-photo/${photoFilename}"`,
          { encoding: "utf8" },
        );
        const debugResult = JSON.parse(debugOutput);

        console.log("Debug result:", JSON.stringify(debugResult, null, 2));
      } catch (debugError) {
        console.log(`Debug error: ${debugError.message}`);
      }
    }
  } finally {
    await prisma.$disconnect();

    // Clean up the debug endpoint
    try {
      require("fs").rmSync(
        "/Users/admin/Coding/Web Development/portfolio/src/app/api/debug-photo",
        { recursive: true, force: true },
      );
      console.log("\nCleaned up debug endpoint");
    } catch (err) {
      console.log("Failed to clean up debug endpoint:", err);
    }
  }
}

debugSpecificPhotos();
