/**
 * This script provides utilities for image processing before uploads
 */

import sharp from "sharp";

/**
 * Process an image to resize it if it's too large
 *
 * @param buffer The original image buffer
 * @param maxSizeMB Maximum file size in MB
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @returns The processed buffer (resized if needed)
 */
export async function processImage(
  buffer: Buffer,
  maxSizeMB = 5,
  maxWidth = 2400,
  maxHeight = 2400,
): Promise<Buffer> {
  // If the buffer is already under the size limit, return it as is
  if (buffer.length <= maxSizeMB * 1024 * 1024) {
    console.log(
      "[ImageProcessor] Image is already under size limit, skipping processing",
    );
    return buffer;
  }

  try {
    console.log("[ImageProcessor] Processing large image...");

    // Get image info
    const metadata = await sharp(buffer).metadata();
    console.log(
      `[ImageProcessor] Original image: ${metadata.width}x${metadata.height}, ${buffer.length} bytes`,
    );

    // Calculate target dimensions while maintaining aspect ratio
    const needsResize =
      (metadata.width && metadata.width > maxWidth) ||
      (metadata.height && metadata.height > maxHeight);

    let processedBuffer = buffer;

    // Resize if needed
    if (needsResize && metadata.width && metadata.height) {
      console.log("[ImageProcessor] Resizing image to fit within limits...");

      // Calculate aspect ratio and new dimensions
      const aspectRatio = metadata.width / metadata.height;
      let newWidth = metadata.width;
      let newHeight = metadata.height;

      if (metadata.width > maxWidth) {
        newWidth = maxWidth;
        newHeight = Math.round(maxWidth / aspectRatio);
      }

      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = Math.round(maxHeight * aspectRatio);
      }

      console.log(`[ImageProcessor] Resizing to ${newWidth}x${newHeight}`);
      processedBuffer = await sharp(buffer)
        .resize(newWidth, newHeight, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer();
    }

    // If still over limit, reduce quality
    if (processedBuffer.length > maxSizeMB * 1024 * 1024) {
      console.log(
        "[ImageProcessor] Still over size limit, reducing quality...",
      );

      // Start with quality 90 and reduce until under limit or reaching min quality
      let quality = 90;
      const minQuality = 70;
      const format = metadata.format === "png" ? "png" : "jpeg";

      while (quality >= minQuality) {
        console.log(`[ImageProcessor] Trying with quality ${quality}%`);

        const sharpInstance = sharp(needsResize ? processedBuffer : buffer);

        if (format === "jpeg" || format === "jpg") {
          processedBuffer = await sharpInstance.jpeg({ quality }).toBuffer();
        } else {
          processedBuffer = await sharpInstance.png({ quality }).toBuffer();
        }

        if (processedBuffer.length <= maxSizeMB * 1024 * 1024) {
          break;
        }

        quality -= 5;
      }
    }

    console.log(
      `[ImageProcessor] Processing complete. Original: ${buffer.length} bytes, Processed: ${processedBuffer.length} bytes, ` +
        `Reduction: ${Math.round((1 - processedBuffer.length / buffer.length) * 100)}%`,
    );

    return processedBuffer;
  } catch (error) {
    console.error("[ImageProcessor] Error processing image:", error);
    throw error;
  }
}
