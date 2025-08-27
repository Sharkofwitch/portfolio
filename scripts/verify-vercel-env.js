#!/usr/bin/env node

// List of required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

// Check if all required environment variables are set
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error("Error: Missing required environment variables:");
  missingEnvVars.forEach((envVar) => {
    console.error(`  - ${envVar}`);
  });
  process.exit(1);
}

console.log("✓ All required environment variables are set");
process.exit(0);
