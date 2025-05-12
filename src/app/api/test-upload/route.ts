import { NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/nextcloud";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Test] Upload test route called");

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

    // Try to upload
    await uploadPhoto(imageData, testFilename);

    return NextResponse.json({
      success: true,
      message: `Test upload successful: ${testFilename}`,
      filename: testFilename,
    });
  } catch (error) {
    console.error("[Test] Upload test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
