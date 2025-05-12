#!/bin/bash
# Run this script to test upload functionality directly in Vercel environment
# by calling a test endpoint

echo "Vercel Photo Upload Test"
echo "======================="

# Parse command line arguments
BASE_URL=${1:-"https://your-vercel-url.vercel.app"}
IMAGE_PATH=${2:-"scripts/test-image.jpg"}

# Verify the image exists
if [ ! -f "$IMAGE_PATH" ]; then
  echo "❌ Error: Image file not found: $IMAGE_PATH"
  exit 1
fi

echo "🌐 Testing URL: $BASE_URL"
echo "🖼️ Using image: $IMAGE_PATH"

# Create a temporary form data for the request
BOUNDARY="---------------------------$(date +%s)"
FILENAME=$(basename "$IMAGE_PATH")

# Create a temporary file for the form data
TEMP_FILE=$(mktemp)

# Write form data to the temporary file
{
  echo "--$BOUNDARY"
  echo "Content-Disposition: form-data; name=\"title\""
  echo ""
  echo "Diagnostic Test Image"
  echo "--$BOUNDARY"
  echo "Content-Disposition: form-data; name=\"alt\""
  echo ""
  echo "Test image for Vercel diagnostics"
  echo "--$BOUNDARY"
  echo "Content-Disposition: form-data; name=\"file\"; filename=\"$FILENAME\""
  echo "Content-Type: image/jpeg"
  echo ""
  cat "$IMAGE_PATH"
  echo ""
  echo "--$BOUNDARY--"
} > "$TEMP_FILE"

echo "📤 Sending request to $BASE_URL/api/test-upload..."

# Send the request using curl
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: multipart/form-data; boundary=$BOUNDARY" \
  --data-binary "@$TEMP_FILE" \
  "$BASE_URL/api/test-upload")

# Clean up the temporary file
rm "$TEMP_FILE"

# Check if the response contains "success"
if echo "$RESPONSE" | grep -q "\"success\":true"; then
  echo "✅ Upload test successful!"
  echo "Response: $RESPONSE"
  exit 0
else
  echo "❌ Upload test failed"
  echo "Response: $RESPONSE"
  exit 1
fi
