/**
 * Script to test if the problematic images load correctly
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching: ${url}`);
    
    const req = http.get(url, (response) => {
      console.log(`Status: ${response.statusCode}`);
      console.log(`Content-Type: ${response.headers['content-type']}`);
      
      if (response.statusCode !== 200) {
        console.log(`Failed with status: ${response.statusCode}`);
        return resolve(null);
      }
      
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`Redirected to: ${response.headers.location}`);
        return fetchImage(response.headers.location).then(resolve).catch(reject);
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`Received ${buffer.length} bytes`);
        resolve(buffer);
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error fetching ${url}:`, error.message);
      resolve(null);
    });
    
    req.end();
  });
}

async function testImage(imageName) {
  console.log(`\n===== Testing ${imageName} =====`);
  
  const url = `http://localhost:3000/api/photos/${imageName}`;
  const buffer = await fetchImage(url);
  
  if (buffer && buffer.length > 0) {
    console.log(`✅ SUCCESS: Image loaded successfully (${buffer.length} bytes)`);
    
    // Save the image for verification
    const debugDir = path.join(process.cwd(), 'scripts', 'debug-output');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }
    
    const outputPath = path.join(debugDir, `verified-${imageName}`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved verified image to: ${outputPath}`);
    
    return true;
  } else {
    console.error(`❌ FAILED: Could not load image ${imageName}`);
    return false;
  }
}

async function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (response) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log('Testing problematic images with new API handler...\n');
  
  // Make sure the development server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.error('ERROR: Development server is not running. Please start it with "npm run dev"');
    process.exit(1);
  }
  
  // Test the problematic images
  const results = [];
  results.push(await testImage('1747175977747-playground-poise.jpeg'));
  results.push(await testImage('1747175912709-diverse-perspectives-campus-connections.jpeg'));
  
  // Summarize results
  console.log('\n===== Results Summary =====');
  console.log(`Playground Poise: ${results[0] ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Campus Connections: ${results[1] ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (results.every(r => r)) {
    console.log('\n🎉 All images loaded successfully!');
  } else {
    console.log('\n⚠️ Some images failed to load.');
  }
}

main();
