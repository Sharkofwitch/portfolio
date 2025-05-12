import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "webdav";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Set max duration to 60 seconds for uploads in Vercel

// Get environment variables directly
const NEXTCLOUD_URL = process.env.NEXTCLOUD_URL || "";
const NEXTCLOUD_USERNAME = process.env.NEXTCLOUD_USERNAME || "";
const NEXTCLOUD_PASSWORD = process.env.NEXTCLOUD_PASSWORD || "";
const NEXTCLOUD_PHOTOS_PATH = (
  process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"
).replace(/\/+/g, "/");

// Create WebDAV client specifically for Vercel
function getVercelClient() {
  const baseUrl = NEXTCLOUD_URL.endsWith("/")
    ? NEXTCLOUD_URL.slice(0, -1)
    : NEXTCLOUD_URL;
  const webdavUrl = `${baseUrl}/remote.php/webdav`;

  return createClient(webdavUrl, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD,
    headers: {
      Accept: "*/*",
    },
  });
}

/**
 * Special lightweight upload function for Vercel
 */
async function vercelOptimizedUpload(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  // Set up paths (client will be created when needed)
  const cleanPath = NEXTCLOUD_PHOTOS_PATH.replace(/^\/+|\/+$/g, "");
  const randomId = randomBytes(4).toString("hex");
  const safeName = `${Date.now()}-${randomId}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const fullPath = `${cleanPath}/${safeName}`;

  console.log(`[VercelUpload] Starting optimized upload to: ${fullPath}`);
  console.log(`[VercelUpload] Buffer size: ${buffer.length} bytes`);

  const maxRetries = 3;
  let retryCount = 0;
  let success = false;
  let lastError;

  while (retryCount < maxRetries && !success) {
    try {
      // Get a fresh client for each attempt
      const uploadClient = getVercelClient();

      // Upload in one direct call - optimized for serverless
      await uploadClient.putFileContents(fullPath, buffer, {
        contentLength: buffer.length,
        overwrite: true,
      });

      success = true;
      console.log(
        `[VercelUpload] Upload successful on attempt ${retryCount + 1}`,
      );
      return safeName;
    } catch (error) {
      lastError = error;
      retryCount++;
      console.error(
        `[VercelUpload] Error on attempt ${retryCount}:`,
        error instanceof Error ? error.message : String(error),
      );

      // Exit early if we've reached max retries
      if (retryCount >= maxRetries) {
        break;
      }

      // Wait before retry with exponential backoff
      const backoffMs = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
      console.log(`[VercelUpload] Retrying in ${backoffMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new Error("Upload failed after multiple attempts");
}

export async function POST(req: NextRequest) {
  try {
    console.log("[VercelUploadEndpoint] Request received");

    // Validate auth
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "admin") {
      console.log("[VercelUploadEndpoint] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Extract metadata
    const metadata = {
      title: formData.get("title") as string,
      alt: formData.get("alt") as string,
      year: (formData.get("year") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      camera: (formData.get("camera") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
    };

    if (!file) {
      console.log("[VercelUploadEndpoint] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!metadata.title || !metadata.alt) {
      console.log("[VercelUploadEndpoint] Missing required metadata");
      return NextResponse.json(
        { error: "Title and alt text are required" },
        { status: 400 },
      );
    }

    // Get file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[VercelUploadEndpoint] Buffer size: ${buffer.length} bytes`);

    // Perform optimized upload
    const uniqueName = await vercelOptimizedUpload(buffer, file.name);
    console.log(`[VercelUploadEndpoint] Upload success: ${uniqueName}`);

    // Save to database
    const src = `/photos/${uniqueName}`;

    // Use Node fetch to avoid issues with undici in serverless
    const dbResponse = await fetch(`${req.nextUrl.origin}/api/photos`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.token || ""}`,
      },
      body: JSON.stringify({
        src,
        ...metadata,
      }),
    });

    if (!dbResponse.ok) {
      const errorData = await dbResponse.json();
      console.error("[VercelUploadEndpoint] DB save error:", errorData);
      return NextResponse.json(
        {
          error: "Upload succeeded but database update failed",
          details: errorData,
          src: src,
        },
        { status: 500 },
      );
    }

    // Return success
    return NextResponse.json({
      success: true,
      src,
      filename: uniqueName,
    });
  } catch (error) {
    console.error("[VercelUploadEndpoint] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
