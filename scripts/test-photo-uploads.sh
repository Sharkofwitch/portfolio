#!/bin/bash

# This script runs tests for the photo upload functionality

# Set variables
VERCEL_URL=${1:-"https://your-vercel-deployment-url.vercel.app"}
TEST_IMAGE=${2:-"./test-image.jpg"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📷 Portfolio Photo Upload Test Suite${NC}"
echo "=========================================="
echo -e "${YELLOW}Target:${NC} $VERCEL_URL"
echo -e "${YELLOW}Test image:${NC} $TEST_IMAGE"
echo "=========================================="

# Check if test image exists, if not create a simple one
if [ ! -f "$TEST_IMAGE" ]; then
  echo -e "${YELLOW}Creating test image...${NC}"
  # Use our Node.js script to create the image
  node scripts/create-test-image.js
  # Update the test image path if using the default
  if [ "$TEST_IMAGE" == "./test-image.jpg" ]; then
    TEST_IMAGE="./scripts/test-image.jpg"
    echo -e "${GREEN}✅ Using test image: $TEST_IMAGE${NC}"
  fi
fi

# Run environment check
echo -e "\n${YELLOW}Running environment check...${NC}"
node scripts/verify-upload-config.js

# Run vercel upload endpoint test
echo -e "\n${YELLOW}Testing Vercel-optimized upload endpoint...${NC}"
export NEXT_PUBLIC_VERCEL=1
export VERCEL=1
node scripts/test-vercel-upload-endpoint.js "$VERCEL_URL" "$TEST_IMAGE"

echo -e "\n${GREEN}✅ All tests completed!${NC}"
