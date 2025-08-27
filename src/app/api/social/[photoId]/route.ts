import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/social/[photoId] - Get social data for a photo
export async function GET(
  request: Request,
  { params }: { params: { photoId: string } },
) {
  try {
    const photoId = params.photoId;

    // Get likes count and comments in parallel
    const [likesCount, comments] = await Promise.all([
      prisma.like.count({
        where: { photoId },
      }),
      prisma.comment.findMany({
        where: { photoId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          text: true,
          userName: true,
          createdAt: true,
        },
      }),
    ]);

    // Check if the current user has liked the photo
    // For now, we'll use a simple check. Later you can add auth and check against userId
    const isLiked = false; // Will be implemented with auth

    return NextResponse.json({
      likes: likesCount,
      isLiked,
      comments,
    });
  } catch (error) {
    console.error("Error fetching social data:", error);
    return NextResponse.json(
      { error: "Error fetching social data" },
      { status: 500 },
    );
  }
}
