/**
 * Script to list successful photo records from the database
 * This will help us understand what's working and what isn't
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listPhotos() {
  try {
    console.log('Fetching photo records from database...');
    
    const photos = await prisma.photo.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    console.log(`Found ${photos.length} photos in database.`);
    console.log('\n----- Photo Records -----');
    
    photos.forEach((photo, index) => {
      console.log(`\n[${index + 1}] ID: ${photo.id}`);
      console.log(`   Title: ${photo.title || 'No title'}`);
      console.log(`   Source: ${photo.src || 'No source'}`);
      console.log(`   Created: ${photo.createdAt.toISOString()}`);
    });
    
    console.log('\n----- Path Analysis -----');
    
    // Analyze paths to find patterns in what works
    const pathTypes = {
      apiPhotos: 0,
      photos: 0,
      timestamp: 0,
      other: 0
    };
    
    const pathPatterns = {};
    
    photos.forEach(photo => {
      if (!photo.src) return;
      
      let pattern = 'unknown';
      
      if (photo.src.startsWith('/api/photos/')) {
        pathTypes.apiPhotos++;
        pattern = '/api/photos/[filename]';
      } else if (photo.src.startsWith('/photos/')) {
        pathTypes.photos++;
        pattern = '/photos/[filename]';
      } else if (/^\/\d{13}-/.test(photo.src)) {
        pathTypes.timestamp++;
        pattern = '/[timestamp]-[name]';
      } else {
        pathTypes.other++;
        pattern = 'other';
      }
      
      pathPatterns[pattern] = (pathPatterns[pattern] || 0) + 1;
    });
    
    console.log('Path types frequency:');
    Object.entries(pathTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\nPath patterns:');
    Object.entries(pathPatterns).forEach(([pattern, count]) => {
      console.log(`   ${pattern}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error listing photos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPhotos();
