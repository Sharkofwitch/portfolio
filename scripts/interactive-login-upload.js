/**
 * Interactive login and photo upload test
 */
const readline = require("readline");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs").promises;

// Configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3002";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log("🧪 Interactive Admin Photo Upload Test");
  console.log("=====================================\n");

  // Create a simple test image (1x1 transparent GIF)
  const base64Data =
    "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
  const imageBuffer = Buffer.from(base64Data, "base64");
  const tempFile = "./test-upload.gif";

  try {
    // Save the test image to disk
    await fs.writeFile(tempFile, imageBuffer);
    console.log(`✅ Created test file: ${tempFile}`);

    // Get login credentials
    console.log("\nPlease provide admin credentials:");
    const username =
      (await question('Username (default "admin"): ')) || "admin";
    const password = await question("Password: ");

    if (!password) {
      console.log("❌ Password is required");
      return;
    }

    console.log("\nAttempting login...");

    // Step 1: Get CSRF token by fetching the login page
    console.log("Fetching CSRF token...");
    const loginPage = await fetch(`${BASE_URL}/admin/login`);
    const cookies = loginPage.headers.get("set-cookie") || "";

    // Step 2: Submit login form
    console.log("Submitting login form...");
    const loginResponse = await fetch(
      `${BASE_URL}/api/auth/signin/credentials`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookies,
        },
        body: JSON.stringify({
          username,
          password,
          callbackUrl: `${BASE_URL}/admin`,
        }),
        redirect: "manual",
      },
    );

    // Get session cookie
    const sessionCookies = loginResponse.headers.get("set-cookie") || "";
    if (!sessionCookies.includes("next-auth.session-token")) {
      console.log("❌ Login failed: No session cookie received");
      return;
    }

    console.log("✅ Login successful!");

    // Step 3: Upload photo with session cookie
    console.log("\nPreparing to upload test photo...");

    // Create form data
    const formData = new FormData();
    const filename = `test-upload-${Date.now()}.gif`;
    formData.append(
      "file",
      new Blob([imageBuffer], { type: "image/gif" }),
      filename,
    );
    formData.append("title", "Test Upload");
    formData.append("alt", "Test Upload Alt Text");
    formData.append("description", "Uploaded via test script");

    console.log("Uploading photo...");
    const uploadResponse = await fetch(`${BASE_URL}/api/photos`, {
      method: "POST",
      headers: {
        Cookie: sessionCookies,
      },
      body: formData,
    });

    const statusCode = uploadResponse.status;
    console.log(`Response status: ${statusCode}`);

    try {
      const responseData = await uploadResponse.json();
      console.log("Response data:", JSON.stringify(responseData, null, 2));

      if (uploadResponse.ok) {
        console.log("✅ Photo upload successful!");
      } else {
        console.log("❌ Photo upload failed");
      }
    } catch (e) {
      console.log("❌ Failed to parse response");
      console.log(await uploadResponse.text());
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    // Clean up
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
    rl.close();
  }
}

main().catch(console.error);
