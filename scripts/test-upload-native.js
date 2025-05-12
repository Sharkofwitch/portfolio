/**
 * Enhanced test script for photo upload functionality
 * Uses native fetch API in Node.js
 */
require("dotenv").config();

// Configuration
const BASE_URL = "http://localhost:3005";

async function main() {
  console.log("🧪 Testing photo upload functionality");
  console.log("====================================\n");

  try {
    // Create a simple test image (1x1 transparent GIF)
    const base64Data =
      "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Create form data
    const boundary =
      "--------------------------" + Math.random().toString(16).substr(2, 24);
    const filename = `test-upload-${Date.now()}.gif`;

    console.log(`📦 Created test image buffer of ${imageBuffer.length} bytes`);
    console.log(`📝 Will upload as: ${filename}`);

    // Build multipart form data manually
    const formData = buildFormData(boundary, {
      file: {
        filename,
        contentType: "image/gif",
        data: imageBuffer,
      },
      title: "Test Upload Image",
      alt: "This is a test upload",
      year: "2025",
      description: "Uploaded via API test",
    });

    // Make the request
    console.log("\n📤 Attempting to upload photo...");
    const response = await fetch(`${BASE_URL}/api/upload-debug`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: formData,
    });

    const statusCode = response.status;
    console.log(`🔍 Response status: ${statusCode}`);

    let responseData = null;
    try {
      responseData = await response.json();
      console.log("🔍 Response data:", JSON.stringify(responseData, null, 2));

      if (response.ok) {
        console.log("✅ Upload successful!");
      } else {
        console.log("❌ Upload failed.");
        if (responseData?.error) {
          console.error("Error details:", responseData.error);
        }
      }
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError.message);
      console.log("Raw response:", await response.text());
    }
  } catch (error) {
    console.error("❌ Error during upload test:", error.message);
  }
}

// Helper function to build multipart form data
function buildFormData(boundary, fields) {
  const chunks = [];

  // Add regular text fields
  for (const [name, value] of Object.entries(fields)) {
    if (name !== "file" && value !== undefined) {
      chunks.push(
        Buffer.from(
          `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
            `${value}\r\n`,
        ),
      );
    }
  }

  // Add file field if present
  if (fields.file) {
    const { filename, contentType, data } = fields.file;
    chunks.push(
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
          `Content-Type: ${contentType}\r\n\r\n`,
      ),
    );
    chunks.push(data);
    chunks.push(Buffer.from("\r\n"));
  }

  // Add closing boundary
  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  // Concatenate all parts
  return Buffer.concat(chunks);
}

main().catch(console.error);
