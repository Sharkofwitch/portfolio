import { PrismaClient } from "@prisma/client";
import photoData from "../src/data/photos.json";

const prisma = new PrismaClient();

async function importPhotos() {
  try {
    console.log("Starting photo import...");

    for (const photo of photoData.photos) {
      console.log(`Importing photo: ${photo.title}`);

      await prisma.photo.upsert({
        where: {
          id: photo.id,
        },
        update: {
          src: photo.src,
          title: photo.title,
          alt: photo.alt,
          width: photo.width,
          height: photo.height,
          year: photo.year,
          location: photo.location,
          camera: photo.camera,
          description: photo.description,
          updatedAt: new Date(),
        },
        create: {
          id: photo.id,
          src: photo.src,
          title: photo.title,
          alt: photo.alt,
          width: photo.width,
          height: photo.height,
          year: photo.year,
          location: photo.location,
          camera: photo.camera,
          description: photo.description,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    console.log("Photo import completed successfully!");
  } catch (error) {
    console.error("Error importing photos:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importPhotos();
