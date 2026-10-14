import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = db.getVideoById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    return NextResponse.json({ video });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    const video = db.getVideoById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (userId) {
      const user = db.getUserById(userId);
      const isOwnerOrAdmin = user && (user.role === "owner" || user.role === "admin");
      const isVideoAuthor = video.userId === userId;

      if (!isOwnerOrAdmin && !isVideoAuthor) {
        return NextResponse.json(
          { error: "Unauthorized to delete this video" },
          { status: 403 }
        );
      }
    }

    const deleted = db.deleteVideo(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
