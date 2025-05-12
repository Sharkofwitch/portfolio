#!/bin/bash

# Load environment variables
source .env

# Function to upload a file
upload_file() {
  local file="$1"
  local filename=$(basename "$file")
  
  echo "Uploading $filename to Nextcloud..."
  
  # Use curl to upload the file
  curl -X PUT \
    -u "${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}" \
    -T "$file" \
    "${NEXTCLOUD_URL}/remote.php/webdav${NEXTCLOUD_PHOTOS_PATH}/${filename}"
  
  if [ $? -eq 0 ]; then
    echo "Successfully uploaded $filename"
  else
    echo "Failed to upload $filename"
    exit 1
  fi
}

# Create photos directory if it doesn't exist
echo "Creating photos directory in Nextcloud..."
curl -X MKCOL \
  -u "${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}" \
  "${NEXTCLOUD_URL}/remote.php/webdav${NEXTCLOUD_PHOTOS_PATH}"

# Upload all jpg files from public/photos
echo "Starting photo upload..."
for file in public/photos/*.jpg; do
  if [ -f "$file" ]; then
    upload_file "$file"
  fi
done

echo "Photo upload complete!"
