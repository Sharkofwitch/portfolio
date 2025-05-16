/**
 * Comprehensive test script for the universal image loading solution
 * Tests various image types and naming patterns to ensure the solution is robust
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Function to fetch an image by URL
function fetchImage(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching: ${url}`);
    
    const req = http.get(url, (response) => {
      console.log(`Status: ${response.statusCode}`);
      
      if (response.headers['content-type']) {
        console.log(`Content-Type: ${response.headers['content-type']}`);
      }
      
      // If redirected to placeholder, handle this case
      if (response.statusCode >= 300 && response.statusCode < 400 && 
          response.headers.location && 
          response.headers.location.includes('placeholder-image.svg')) {
        console.log(`Redirected to placeholder image`);
        return resolve({ 
          success: false, 
          buffer: null, 
          redirectUrl: response.headers.location,
          isPlaceholder: true 
        });
      }
      
      // Handle other redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`Redirected to: ${response.headers.location}`);
        return fetchImage(response.headers.location, timeout)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        console.log(`Failed with status: ${response.statusCode}`);
        return resolve({ 
          success: false, 
          buffer: null, 
          statusCode: response.statusCode 
        });
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Received ${buffer.length} bytes`);
        resolve({ 
          success: true, 
          buffer, 
          contentType: response.headers['content-type'] 
        });
      });
    });
    
    // Set timeout
    req.setTimeout(timeout, () => {
      req.destroy();
      console.error(`Timeout fetching ${url}`);
      resolve({ success: false, buffer: null, error: 'Timeout' });
    });
    
    req.on('error', (error) => {
      console.error(`Error fetching ${url}:`, error.message);
      resolve({ success: false, buffer: null, error: error.message });
    });
    
    req.end();
  });
}

// Test a single image
async function testImage(imageName, options = {}) {
  const { saveOutput = true, baseUrl = 'http://localhost:3000' } = options;
  console.log(`\n===== Testing ${imageName} =====`);
  
  const start = Date.now();
  const url = `${baseUrl}/api/photos/${imageName}`;
  const result = await fetchImage(url);
  const duration = Date.now() - start;
  
  if (result.success && result.buffer && result.buffer.length > 0) {
    console.log(`✅ SUCCESS: Image loaded successfully (${result.buffer.length} bytes, ${duration}ms)`);
    
    // Save the image for verification if requested
    if (saveOutput) {
      const debugDir = path.join(process.cwd(), 'scripts', 'debug-output');
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      
      // Use a sanitized version of the filename for the output file
      const safeFilename = imageName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const outputPath = path.join(debugDir, `verified-${safeFilename}`);
      fs.writeFileSync(outputPath, result.buffer);
      console.log(`Saved verified image to: ${outputPath}`);
    }
    
    return { 
      success: true, 
      name: imageName,
      size: result.buffer.length,
      duration,
      contentType: result.contentType
    };
  } else if (result.isPlaceholder || (result.redirectUrl && result.redirectUrl.includes('placeholder-image.svg'))) {
    // Expected failure for non-existent images that redirect to placeholder
    if (options.expectPlaceholder) {
      console.log(`✓ EXPECTED: Non-existent image correctly redirected to placeholder (${duration}ms)`);
      return { 
        success: true, 
        name: imageName, 
        isPlaceholder: true,
        duration
      };
    } else {
      console.error(`❌ FAILED: Image "${imageName}" redirected to placeholder (${duration}ms)`);
      return { 
        success: false, 
        name: imageName, 
        error: 'Redirected to placeholder',
        duration
      };
    }
  } else {
    console.error(`❌ FAILED: Could not load image "${imageName}" (${duration}ms)`);
    if (result.error) {
      console.error(`   Error: ${result.error}`);
    }
    return { 
      success: false, 
      name: imageName, 
      error: result.error || 'Unknown error',
      duration
    };
  }
}

// Check if the development server is running
async function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (response) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Get real image names from the database
async function getImagesFromDatabase(limit = 5) {
  try {
    console.log('Fetching real images from database...');
    
    // Get most recent photos from database
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    console.log(`Found ${photos.length} photos in database.`);
    
    return photos.map(photo => {
      // Extract filename from src
      const filename = photo.src?.split('/').pop() || '';
      return {
        id: photo.id,
        filename: filename,
        src: photo.src || ''
      };
    }).filter(photo => photo.filename);
  } catch (error) {
    console.error('Error fetching photos from database:', error);
    return [];
  }
}

// Main test function
async function main() {
  console.log('==================================================');
  console.log(' UNIVERSAL IMAGE LOADING SOLUTION - COMPREHENSIVE TEST ');
  console.log('==================================================\n');
  
  // Make sure the development server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.error('ERROR: Development server is not running. Please start it with "npm run dev"');
    process.exit(1);
  }
  
  // Get actual images from database
  const dbImages = await getImagesFromDatabase(5);
  
  // List of images to test
  const testImages = [
    // Previously problematic images - known to work with universal solution
    '1747175977747-playground-poise.jpeg',
    '1747175912709-diverse-perspectives-campus-connections.jpeg',
    
    // Real images from database
    ...dbImages.map(img => img.filename),
    
    // Non-existent image (should redirect to placeholder)
    'non-existent-image-123456.jpg'
  ];
  
  // Deduplicate the list
  const uniqueTestImages = [...new Set(testImages)];
  console.log(`Testing ${uniqueTestImages.length} unique images...\n`);
  
  // Test all images
  const results = [];
  for (const imageName of uniqueTestImages) {
    // For the non-existent image, expect a placeholder
    const isNonExistent = imageName === 'non-existent-image-123456.jpg';
    
    results.push(await testImage(imageName, {
      expectPlaceholder: isNonExistent,
      saveOutput: !isNonExistent // Don't save placeholder outputs
    }));
  }
  
  // Summarize results
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log('\n================= Results Summary =================');
  console.log(`Tests run: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  // Show successful results
  console.log('\n✅ SUCCESSFUL TESTS:');
  results.filter(r => r.success).forEach(result => {
    if (result.isPlaceholder) {
      console.log(`- ${result.name}: Correctly redirected to placeholder (${result.duration}ms)`);
    } else {
      console.log(`- ${result.name}: ${result.size || '?'} bytes (${result.duration}ms)`);
    }
  });
  
  // Show failed results
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`- ${result.name}: ${result.error} (${result.duration}ms)`);
    });
    
    console.log('\n⚠️ Some images failed to load.');
  } else {
    console.log('\n🎉 All images loaded successfully!');
  }
  
  // Cleanup
  await prisma.$disconnect();
}

// Run the test
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
