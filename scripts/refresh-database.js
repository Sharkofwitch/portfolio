/**
 * Database refresh script for the image system
 * 
 * This script refreshes the database connection with Prisma and ensures
 * all images have proper database records with consistent paths
 */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma client with connection refresh
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
});

async function refreshDatabase() {
  try {
    console.log('Starting database refresh process...');
    
    // First disconnect to ensure a fresh connection
    await prisma.$disconnect();
    console.log('Disconnected from database to ensure fresh connection');
    
    // Reconnect by executing a simple query
    const count = await prisma.photo.count();
    console.log(`Connected to database. Found ${count} photo records.`);
    
    // Check for database records without proper image paths
    const photosWithoutProperPath = await prisma.photo.findMany({
      where: {
        NOT: {
          OR: [
            { src: { startsWith: '/api/photos/' } },
            { src: { startsWith: '/photos/' } }
          ]
        }
      }
    });
    
    console.log(`Found ${photosWithoutProperPath.length} photo records with non-standard paths`);
    
    // Update any records with inconsistent paths
    let updatedCount = 0;
    for (const photo of photosWithoutProperPath) {
      // Extract filename from existing path if possible
      const existingPath = photo.src || '';
      const filename = existingPath.split('/').pop();
      
      if (!filename) {
        console.log(`Cannot determine filename for photo ID ${photo.id}, skipping`);
        continue;
      }
      
      // Update to standard path format
      const standardPath = `/api/photos/${filename}`;
      await prisma.photo.update({
        where: { id: photo.id },
        data: { 
          src: standardPath,
          updatedAt: new Date()
        }
      });
      
      console.log(`Updated photo ${photo.id} path: ${existingPath} => ${standardPath}`);
      updatedCount++;
    }
    
    console.log(`\nDatabase refresh complete. Updated ${updatedCount} records.`);
    console.log(`Total photos in database: ${count}`);
    
    return {
      success: true,
      totalPhotos: count,
      updatedPhotos: updatedCount
    };
  } catch (error) {
    console.error('Error refreshing database:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

// Execute if run directly
if (require.main === module) {
  refreshDatabase()
    .then(result => {
      if (result.success) {
        console.log('Database refresh completed successfully.');
        process.exit(0);
      } else {
        console.error('Database refresh failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error during database refresh:', err);
      process.exit(1);
    });
}

module.exports = { refreshDatabase };