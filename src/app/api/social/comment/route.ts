import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/social/comment
export async function POST(request: Request) {
  try {
    const { photoId, text } = await request.json();

    if (!photoId || !text?.trim()) {
      return NextResponse.json(
        { error: "Photo ID and comment text are required" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        photoId,
        text: text.trim(),
        userName: "Guest", // This will be replaced with actual username when auth is added
        // userId will be added later with auth
      },
      select: {
        id: true,
        text: true,
        userName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error creating comment" },
      { status: 500 },
    );
  }
}

// DELETE /api/social/comment (optional - for future use)
export async function DELETE(request: Request) {
  try {
    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 },
      );
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
        // Add userId check later with auth
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Error deleting comment" },
      { status: 500 },
    );
  }
}
