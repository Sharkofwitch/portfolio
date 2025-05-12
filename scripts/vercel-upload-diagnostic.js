/**
 * Vercel Upload Diagnostic Tool
 *
 * This script tests Nextcloud uploads in a way that simulates the Vercel environment
 * to help diagnose upload issues in production.
 */

// Set the VERCEL environment variable to simulate Vercel environment
process.env.VERCEL = "1";

// Use dynamic import for ESM modules
import("fs")
  .then(async (fs) => {
    const path = await import("path");
    const { createClient } = await import("webdav");

    // Get environment variables directly
    const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || "";
    const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME || "";
    const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";
    const NEXTCLOUD_PHOTOS_PATH = (
      process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
    ).replace(/\/+/g, "/");

    // Verify environment variables
    if (!NEXTCLOUD_URL || !NEXTCLOUD_USERNAME || !NEXTCLOUD_PASSWORD) {
      console.error("❌ Missing required Nextcloud environment variables");
      console.error(
        "Please set NEXTCLOUD_URL, NEXTCLOUD_USERNAME, and NEXTCLOUD_PASSWORD",
      );
      process.exit(1);
    }

    // Create WebDAV client
    const baseUrl = NEXTCLOUD_URL.endsWith("/")
      ? NEXTCLOUD_URL.slice(0, -1)
      : NEXTCLOUD_URL;
    const webdavUrl = `${baseUrl}/remote.php/webdav`;

    // Create client function to ensure fresh connections
    function getClient() {
      console.log(`📡 Creating WebDAV client for: ${webdavUrl}`);
      return createClient(webdavUrl, {
        username: NEXTCLOUD_USERNAME,
        password: NEXTCLOUD_PASSWORD,
        headers: {
          Accept: "*/*",
        },
      });
    }

    /**
     * Get the full path for a photo in Nextcloud
     */
    function getPhotoPath(filename) {
      // Strip photo path of any leading/trailing slashes and ensure consistent format
      const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");

      // Clean the filename
      let cleanFilename = filename.replace(/^\/+/g, "");
      cleanFilename = cleanFilename
        .replace(/^photos\//, "")
        .replace(/^Photos\//, "")
        .replace(/^Portfolio\//, "");

      // Extract just the filename if it contains any path
      if (cleanFilename.includes("/")) {
        cleanFilename = cleanFilename.split("/").pop() || cleanFilename;
      }

      // Join path parts and ensure proper formatting
      return [cleanPath, cleanFilename].filter(Boolean).join("/");
    }

    /**
     * Upload a photo to Nextcloud with Vercel optimizations
     */
    async function uploadPhotoVercelStyle(buffer, filename) {
      const path = getPhotoPath(filename);
      console.log(`🚀 Uploading "${filename}" to path: ${path}`);
      console.log(`📦 Buffer size: ${buffer.length} bytes`);

      // Validate the buffer is not empty
      if (!buffer || buffer.length === 0) {
        throw new Error("File buffer is empty");
      }

      // Validate buffer size (Vercel has payload limits but we've increased them)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (buffer.length > maxSize) {
        throw new Error(
          `File too large: ${Math.round(buffer.length / 1024 / 1024)}MB (max 50MB)`,
        );
      }

      // Get a fresh client
      const uploadClient = getClient();

      // Skip directory checks in Vercel-style environment
      console.log("🔄 Skipping directory existence check (Vercel style)");

      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;
      let lastError;

      while (retryCount < maxRetries && !success) {
        try {
          if (retryCount > 0) {
            console.log(`🔄 Retry attempt ${retryCount}/${maxRetries - 1}`);
            // Get a fresh client for each retry
            const retryClient = getClient();
            await retryClient.putFileContents(path, buffer, {
              contentLength: buffer.length,
              overwrite: true,
            });
          } else {
            await uploadClient.putFileContents(path, buffer, {
              contentLength: buffer.length,
              overwrite: true,
            });
          }
          success = true;
          console.log(
            `✅ Upload successful on attempt ${retryCount + 1}/${maxRetries}`,
          );
        } catch (uploadError) {
          lastError = uploadError;
          retryCount++;
          console.error(
            `❌ Upload failed on attempt ${retryCount}/${maxRetries}: ${uploadError.message}`,
          );

          if (retryCount >= maxRetries) {
            console.error(`❌ All ${maxRetries} upload attempts failed`);
            throw lastError;
          }

          // Exponential backoff
          const backoffTime = Math.min(
            1000 * Math.pow(2, retryCount - 1),
            4000,
          );
          console.log(`⏱ Waiting ${backoffTime}ms before next attempt`);
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }
      }

      // Skip verification to reduce API calls (Vercel style)
      console.log("🔄 Skipping file verification check (Vercel style)");

      return success;
    }

    /**
     * Run diagnostics
     */
    async function runDiagnostics() {
      console.log("🔍 Starting Vercel upload diagnostics...");
      console.log("===========================================");
      console.log(`🌐 Nextcloud URL: ${baseUrl}`);
      console.log(`📁 Photos Path: ${NEXTCLOUD_PHOTOS_PATH}`);
      console.log("===========================================\n");

      try {
        // Test 1: Basic connection test
        console.log("🔍 TEST 1: Basic connection test");
        const client = getClient();

        try {
          const rootContents = await client.getDirectoryContents("/");
          console.log(
            `✅ Connection successful! Found ${rootContents.length} items in root directory`,
          );
        } catch (error) {
          console.error("❌ Connection failed:", error.message);
          console.error("Please check your Nextcloud credentials and URL");
          return;
        }

        // Test 2: Create a test file
        console.log("\n🔍 TEST 2: File upload test");

        // Create a test image
        const testFilename = `test-${Date.now()}.txt`;
        const testContent = Buffer.from(
          `This is a test file created at ${new Date().toISOString()}`,
        );

        try {
          await uploadPhotoVercelStyle(testContent, testFilename);
          console.log(`✅ Test file upload successful: ${testFilename}`);

          // Try to verify the file exists (even though we skip this in Vercel)
          try {
            const verifyClient = getClient();
            const verifyPath = getPhotoPath(testFilename);
            const exists = await verifyClient.exists(verifyPath);
            if (exists) {
              console.log(
                `✅ Verification check passed: File exists at ${verifyPath}`,
              );
            } else {
              console.log(
                `⚠️ Verification check failed: File not found at ${verifyPath}`,
              );
            }
          } catch (verifyError) {
            console.log(`⚠️ Verification check error: ${verifyError.message}`);
          }
        } catch (uploadError) {
          console.error("❌ Test file upload failed:", uploadError.message);
          console.error(uploadError);
          return;
        }

        // Test 3: Try uploading a real image if available
        const testImagePath = path.join(__dirname, "test-image.jpg");
        const largeImagePath = path.join(__dirname, "large-test-image.jpg");

        try {
          // Try with regular test image first
          if (fs.existsSync(testImagePath)) {
            console.log("\n🔍 TEST 3: Standard image upload test");
            try {
              const imageBuffer = fs.readFileSync(testImagePath);
              const imageFilename = `test-image-${Date.now()}.jpg`;

              await uploadPhotoVercelStyle(imageBuffer, imageFilename);
              console.log(`✅ Test image upload successful: ${imageFilename}`);
            } catch (imageError) {
              console.error("❌ Test image upload failed:", imageError.message);
            }
          } else {
            console.log(
              "\n🔍 TEST 3: Standard image upload test - SKIPPED (no test-image.jpg found)",
            );
          }

          // Try with large test image if available
          if (fs.existsSync(largeImagePath)) {
            console.log("\n🔍 TEST 4: Large image upload test");
            try {
              const imageBuffer = fs.readFileSync(largeImagePath);
              console.log(
                `📊 Large image size: ${Math.round(imageBuffer.length / 1024)} KB`,
              );
              const imageFilename = `large-test-image-${Date.now()}.jpg`;

              // Import the image processor
              const { default: sharp } = await import("sharp");

              // Get image dimensions
              const metadata = await sharp(imageBuffer).metadata();
              console.log(
                `📏 Image dimensions: ${metadata.width}x${metadata.height}`,
              );

              // Resize if needed
              let processedBuffer = imageBuffer;
              if (metadata.width > 2400 || metadata.height > 2400) {
                console.log("🔄 Resizing large image...");
                processedBuffer = await sharp(imageBuffer)
                  .resize(2400, 2400, {
                    fit: "inside",
                    withoutEnlargement: true,
                  })
                  .jpeg({ quality: 85 })
                  .toBuffer();

                console.log(
                  `📊 After resize: ${Math.round(processedBuffer.length / 1024)} KB`,
                );
              }

              await uploadPhotoVercelStyle(processedBuffer, imageFilename);
              console.log(
                `✅ Large test image upload successful: ${imageFilename}`,
              );
            } catch (imageError) {
              console.error(
                "❌ Large test image upload failed:",
                imageError.message,
              );
            }
          } else {
            console.log(
              "\n🔍 TEST 4: Large image upload test - SKIPPED (no large-test-image.jpg found)",
            );
          }
        } catch (fsError) {
          console.log("\n❌ ERROR checking for test images:", fsError.message);
        }

        console.log("\n✅ Diagnostics completed!");
      } catch (error) {
        console.error(
          "\n❌ An unexpected error occurred during diagnostics:",
          error,
        );
      }
    }

    // Run the diagnostics
    await runDiagnostics().catch(console.error);
  })
  .catch((err) => {
    console.error("Failed to import modules:", err);
    process.exit(1);
  });
