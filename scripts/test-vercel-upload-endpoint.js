#!/usr/bin/env node

/**
 * This script tests the Vercel-optimized photo upload flow.
 * It helps diagnose issues with the vercel-upload endpoint.
 */

// Use dynamic imports for ESM modules
import("fs").then(async (fs) => {
  const path = await import("path");
  const fetch = await import("node-fetch");
  const FormData = await import("form-data");

  // Set environment variables to simulate Vercel
  process.env.VERCEL = "1";
  process.env.NEXT_PUBLIC_VERCEL = "1";

  // Configuration
  let baseUrl = process.argv[2] || "http://localhost:3000";
  const imagePath = process.argv[3] || path.join(__dirname, "test-image.jpg");
  const authToken = process.env.AUTH_TOKEN || "test-token";

  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, "");

  async function testVercelUpload(fs, path, nodeFetch, FormDataModule) {
    console.log("🚀 Testing Vercel-optimized upload flow");
    console.log("=======================================");
    console.log(`🌐 API URL: ${baseUrl}/api/vercel-upload`);
    console.log(`🖼️ Image: ${imagePath}`);
    console.log("=======================================\n");

    try {
      // Check if the image exists
      if (!fs.existsSync(imagePath)) {
        console.error(`❌ Error: Image file not found at ${imagePath}`);
        console.log("Please specify a valid image file path");
        process.exit(1);
      }

      // Get file stats
      const stats = fs.statSync(imagePath);
      console.log(`📄 File size: ${Math.round(stats.size / 1024)} KB`);

      // Create form data
      const formData = new FormDataModule.default();
      formData.append("file", fs.createReadStream(imagePath));
      formData.append("title", `Test Upload ${new Date().toISOString()}`);
      formData.append("alt", "Test image alt text");
      formData.append(
        "description",
        "This is a test image uploaded using the Vercel-optimized flow.",
      );

      console.log("📤 Sending upload request...");

      // Perform the upload request with timing
      const startTime = Date.now();
      const response = await nodeFetch.default(`${baseUrl}/api/vercel-upload`, {
        method: "POST",
        body: formData,
        headers: {
          // Add auth headers if you have them
          Authorization: `Bearer ${authToken}`,
        },
      });
      const endTime = Date.now();
      const timeTaken = endTime - startTime;

      if (!response.ok) {
        console.error(`❌ Upload failed with status ${response.status}`);
        const errorText = await response
          .text()
          .catch(() => "Unable to parse error response");
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Error details:", JSON.stringify(errorJson, null, 2));
        } catch (e) {
          console.error("Raw error response:", errorText);
        }
        process.exit(1);
      }

      // Parse the response
      const data = await response.json();
      console.log(`✅ Upload successful! Time taken: ${timeTaken}ms`);
      console.log(`📝 Response:`, JSON.stringify(data, null, 2));

      // Test accessing the uploaded file
      if (data.src) {
        console.log(`\n🔍 Verifying uploaded image...`);
        const verifyUrl = `${baseUrl}${data.src}`;
        console.log(`🌐 Checking URL: ${verifyUrl}`);

        try {
          const verifyResponse = await fetch(verifyUrl);
          if (verifyResponse.ok) {
            console.log(`✅ Image accessible at ${verifyUrl}`);
          } else {
            console.log(
              `❌ Image not accessible. Status: ${verifyResponse.status}`,
            );
          }
        } catch (verifyError) {
          console.error(`❌ Error verifying image:`, verifyError.message);
        }
      }

      console.log("\n✅ Test completed successfully!");
    } catch (error) {
      console.error("❌ Error executing test:", error);
      process.exit(1);
    }
  }

  // Run the test
  testVercelUpload(fs, path, fetch, FormData).catch(console.error);
});
