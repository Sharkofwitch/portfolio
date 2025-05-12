import { NextRequest, NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/nextcloud";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import os from "os";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Set max duration to 30 seconds for uploads

// Helper function to get environment info
function getEnvironmentInfo() {
  return {
    environment: process.env.VERCEL === "1" ? "Vercel" : "Development",
    nodeVersion: process.version,
    platform: os.platform(),
    memory: `${Math.round(os.totalmem() / 1024 / 1024)}MB total, ${Math.round(os.freemem() / 1024 / 1024)}MB free`,
    cpus: os.cpus().length,
    nextcloudUrl: process.env.NEXTCLOUD_URL
      ? process.env.NEXTCLOUD_URL.replace(/\/\/([^:]+):[^@]+@/, "//***:***@")
      : "Not configured",
    photosPath: process.env.NEXTCLOUD_PHOTOS_PATH || "Default path",
    timestamp: new Date().toISOString(),
  };
}

// GET endpoint - Test upload with generated image
export async function GET() {
  try {
    // Skip auth check in diagnostic mode to allow remote testing
    const isDiagnosticMode = process.env.DIAGNOSTIC_MODE === "1";

    if (!isDiagnosticMode) {
      // Check authentication for normal operation
      const session = await getServerSession(authOptions);
      if (session?.user?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.log("[Test] Upload test route called (GET)");
    const envInfo = getEnvironmentInfo();
    console.log("[Test] Environment:", envInfo);

    // Create a simple test image (1x1 transparent pixel)
    const base64Data =
      "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    const imageData = Buffer.from(base64Data, "base64");

    console.log(
      "[Test] Test image buffer created, size:",
      imageData.length,
      "bytes",
    );

    // Generate unique name for the test file
    const testFilename = `test-upload-${Date.now()}.gif`;

    console.log(`[Test] Uploading test image with name: ${testFilename}`);

    // Try to upload with timing
    const startTime = Date.now();
    await uploadPhoto(imageData, testFilename);
    const endTime = Date.now();

    return NextResponse.json({
      success: true,
      message: `Test upload successful: ${testFilename}`,
      filename: testFilename,
      timeTaken: `${endTime - startTime}ms`,
      environment: envInfo,
    });
  } catch (error) {
    console.error("[Test] Upload test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        environment: getEnvironmentInfo(),
      },
      { status: 500 },
    );
  }
}

// POST endpoint - Test upload with provided file
export async function POST(req: NextRequest) {
  try {
    console.log("[Test] Upload test route called (POST)");
    const envInfo = getEnvironmentInfo();
    console.log("[Test] Environment:", envInfo);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided",
          environment: envInfo,
        },
        { status: 400 },
      );
    }

    console.log(
      `[Test] Received file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`,
    );

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[Test] Converted to buffer: ${buffer.length} bytes`);

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        {
          error: "Empty file content",
          environment: envInfo,
        },
        { status: 400 },
      );
    }

    // Generate a unique filename
    const uniqueName = `test-upload-${Date.now()}-${file.name}`;
    console.log(`[Test] Uploading file with name: ${uniqueName}`);

    // Try to upload with timing
    const startTime = Date.now();
    await uploadPhoto(buffer, uniqueName);
    const endTime = Date.now();

    return NextResponse.json({
      success: true,
      message: `Test upload successful: ${uniqueName}`,
      filename: uniqueName,
      originalName: file.name,
      size: buffer.length,
      timeTaken: `${endTime - startTime}ms`,
      environment: envInfo,
    });
  } catch (error) {
    console.error("[Test] Upload test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        environment: getEnvironmentInfo(),
      },
      { status: 500 },
    );
  }
}
