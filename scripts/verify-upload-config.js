#!/usr/bin/env node

/**
 * This script checks the environment configuration for photo uploads
 * to help diagnose any issues with the Vercel environment.
 */

console.log("🔍 Photo Upload Configuration Check");
console.log("===================================");

// Check Vercel environment variables
console.log("🌐 Environment:");
console.log(`VERCEL: ${process.env.VERCEL || "not set"}`);
console.log(
  `NEXT_PUBLIC_VERCEL: ${process.env.NEXT_PUBLIC_VERCEL || "not set"}`,
);

// Check NextCloud configuration (without revealing secrets)
console.log("\n🔒 NextCloud Configuration:");
console.log(
  `NEXTCLOUD_URL: ${process.env.NEXTCLOUD_URL ? "✅ Set" : "❌ Missing"}`,
);
console.log(
  `NEXTCLOUD_USERNAME: ${process.env.NEXTCLOUD_USERNAME ? "✅ Set" : "❌ Missing"}`,
);
console.log(
  `NEXTCLOUD_PASSWORD: ${process.env.NEXTCLOUD_PASSWORD ? "✅ Set" : "❌ Missing"}`,
);
console.log(
  `NEXTCLOUD_PHOTOS_PATH: ${process.env.NEXTCLOUD_PHOTOS_PATH || "/Photos/Portfolio"} (default if not set)`,
);

// File size limits
console.log("\n📊 File Size Limits:");
console.log(`Max upload size in MB: 50`);
console.log(`Max image dimensions: 2400x2400`);

console.log("\n🔄 Upload Flow:");
console.log(`1. In Vercel: Using optimized /api/vercel-upload endpoint`);
console.log(`2. In Development: Using standard /api/photos endpoint`);

console.log("\n📝 Current Configuration:");
console.log(`- Memory allocated: 1024MB for upload endpoints`);
console.log(
  `- Max duration: 60 seconds for vercel-upload, 30 seconds for photos endpoint`,
);
console.log(
  `- Added exponential backoff retry logic for more reliable uploads`,
);
console.log(`- Automatic image resizing for large images`);
console.log(`- Vercel environment detection in admin page`);

console.log("\n✅ Configuration check complete!");
