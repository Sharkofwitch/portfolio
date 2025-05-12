/**
 * Vercel Environment Check Script
 * This script verifies that all required environment variables are set correctly
 * for Vercel deployment
 */

const requiredVars = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NEXTCLOUD_URL",
  "NEXTCLOUD_USERNAME",
  "NEXTCLOUD_PASSWORD",
  "NEXTCLOUD_PHOTOS_PATH",
  "ADMIN_PASSWORD",
];

console.log("🔍 Checking environment variables for Vercel deployment...");
console.log("=======================================================\n");

const missingVars = [];
const presentVars = [];

// Check each variable
for (const variable of requiredVars) {
  if (!process.env[variable]) {
    missingVars.push(variable);
  } else {
    presentVars.push(variable);
  }
}

// Output results
console.log("✅ Variables present:");
if (presentVars.length === 0) {
  console.log("   None");
} else {
  presentVars.forEach((variable) => {
    // Don't show the actual values for sensitive variables
    const value =
      variable.includes("PASSWORD") || variable.includes("SECRET")
        ? "********"
        : process.env[variable];
    console.log(`   ${variable}: ${value}`);
  });
}

console.log("\n❌ Variables missing:");
if (missingVars.length === 0) {
  console.log("   None - All required variables are set");
} else {
  missingVars.forEach((variable) => {
    console.log(`   ${variable}`);
  });
}

// Provide guidance if any variables are missing
if (missingVars.length > 0) {
  console.log("\n⚠️ Missing environment variables detected!");
  console.log("To fix this issue:");
  console.log("1. Go to your Vercel project settings");
  console.log('2. Navigate to the "Environment Variables" section');
  console.log(`3. Add the missing variables: ${missingVars.join(", ")}`);
  console.log("\nFor local development:");
  console.log(
    "1. Create a .env file in the project root if not already present",
  );
  console.log("2. Add the missing variables to the .env file");

  // Exit with error code
  process.exit(1);
} else {
  console.log("\n🎉 All required environment variables are set!");
}

// Verify Nextcloud connection specifically
console.log(
  "\n🔄 Testing Nextcloud connection with the provided credentials...",
);

// Dynamic import for webdav (ESM module)
import("webdav")
  .then(async ({ createClient }) => {
    const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL;
    const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME;
    const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD;

    // Create WebDAV client
    const baseUrl = NEXTCLOUD_URL.endsWith("/")
      ? NEXTCLOUD_URL.slice(0, -1)
      : NEXTCLOUD_URL;
    const webdavUrl = `${baseUrl}/remote.php/webdav`;

    const client = createClient(webdavUrl, {
      username: NEXTCLOUD_USERNAME,
      password: NEXTCLOUD_PASSWORD,
      headers: { Accept: "*/*" },
    });

    try {
      // Try to list root directory to test connection
      const rootContents = await client.getDirectoryContents("/");
      console.log("✅ Nextcloud connection successful");
      console.log(
        `   Found ${rootContents.length} items in the root directory`,
      );

      // Try to list photos directory
      const NEXTCLOUD_PHOTOS_PATH = (
        process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
      ).replace(/\/+/g, "/");
      const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");

      try {
        const photosContents = await client.getDirectoryContents(cleanPath);
        const photoFiles = photosContents.filter(
          (item) => !item.type.includes("directory"),
        );

        console.log(`✅ Photos directory access successful`);
        console.log(`   Found ${photoFiles.length} photos in ${cleanPath}`);

        if (photoFiles.length > 0) {
          console.log("   Sample photos:");
          photoFiles.slice(0, 3).forEach((photo) => {
            console.log(`   - ${photo.basename}`);
          });
        }
      } catch (photosError) {
        console.error(`❌ Cannot access photos directory: ${cleanPath}`);
        console.error(`   Error: ${photosError.message}`);
      }
    } catch (error) {
      console.error("❌ Nextcloud connection failed");
      console.error(`   Error: ${error.message}`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Failed to import webdav module");
    console.error(`   Error: ${error.message}`);
  });
