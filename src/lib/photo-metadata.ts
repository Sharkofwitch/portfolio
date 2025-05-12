import { PrismaClient, Prisma } from "@prisma/client";
import type { Photo } from "@prisma/client";

const prisma = new PrismaClient();

type PhotoUpdateData = Partial<Omit<Photo, "id" | "createdAt" | "updatedAt">>;

export async function savePhotoMetadata(
  filename: string,
  metadata: PhotoUpdateData,
) {
  try {
    const input = {
      src: metadata.src ?? "",
      title: metadata.title ?? "",
      alt: metadata.alt ?? "",
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      year: metadata.year,
      location: metadata.location,
      camera: metadata.camera,
      description: metadata.description,
      metadata:
        metadata.metadata === null
          ? Prisma.JsonNull
          : (metadata.metadata as Prisma.InputJsonValue),
    };

    return await prisma.photo.upsert({
      where: { id: filename },
      update: {
        ...input,
        updatedAt: new Date(),
      },
      create: {
        id: filename,
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error saving photo metadata:", error);
    throw error;
  }
}

export async function getPhotoMetadata(filename: string) {
  try {
    return await prisma.photo.findUnique({
      where: { id: filename },
    });
  } catch (error) {
    console.error("Error getting photo metadata:", error);
    return null;
  }
}

export async function deletePhotoMetadata(filename: string) {
  try {
    return await prisma.photo.delete({
      where: { id: filename },
    });
  } catch (error) {
    console.error("Error deleting photo metadata:", error);
    // Don't throw, as the photo might not exist in the database
  }
}
