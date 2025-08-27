import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/social/like
export async function POST(request: Request) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 },
      );
    }

    // For now, we'll create anonymous likes
    // Later you can add auth and use the user's ID
    await prisma.like.create({
      data: {
        photoId,
        // userId will be added later with auth
      },
    });

    // Get updated likes count
    const likesCount = await prisma.like.count({
      where: { photoId },
    });

    return NextResponse.json({
      success: true,
      likes: likesCount,
      isLiked: true,
    });
  } catch (error) {
    // Handle unique constraint violation (already liked)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Already liked this photo" },
        { status: 400 },
      );
    }

    console.error("Error liking photo:", error);
    return NextResponse.json(
      { error: "Error processing like" },
      { status: 500 },
    );
  }
}

// DELETE /api/social/like
export async function DELETE(request: Request) {
  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return NextResponse.json(
        { error: "Photo ID is required" },
        { status: 400 },
      );
    }

    // Remove the like
    // Later you can add auth and use the user's ID in the where clause
    await prisma.like.deleteMany({
      where: {
        photoId,
        // userId will be added later with auth
      },
    });

    // Get updated likes count
    const likesCount = await prisma.like.count({
      where: { photoId },
    });

    return NextResponse.json({
      success: true,
      likes: likesCount,
      isLiked: false,
    });
  } catch (error) {
    console.error("Error unliking photo:", error);
    return NextResponse.json(
      { error: "Error processing unlike" },
      { status: 500 },
    );
  }
}
