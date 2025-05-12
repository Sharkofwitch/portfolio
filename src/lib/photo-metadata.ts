import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function savePhotoMetadata(filename: string, metadata: any) {
  try {
    return await prisma.photo.upsert({
      where: { id: filename }, // assuming 'id' is your unique field
      update: {
        ...metadata,
        updatedAt: new Date()
      },
      create: {
        id: filename, // assuming 'id' is your unique field
        ...metadata,
      },
    });
  } catch (error) {
    console.error('Error saving photo metadata:', error);
    throw error;
  }
}

export async function getPhotoMetadata(filename: string) {
  try {
    return await prisma.photo.findUnique({
      where: { id: filename }, // assuming 'id' is your unique field
    });
  } catch (error) {
    console.error('Error getting photo metadata:', error);
    return null;
  }
}

export async function deletePhotoMetadata(filename: string) {
  try {
    return await prisma.photo.delete({
      where: { id: filename }, // assuming 'id' is your unique field
    });
  } catch (error) {
    console.error('Error deleting photo metadata:', error);
    // Don't throw, as the photo might not exist in the database
  }
}
