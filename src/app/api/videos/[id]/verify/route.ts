import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await req.json().catch(() => ({}));
    const { userId, userEmail, watchedSeconds, liked, commented, followed } = body;

    if (!videoId) {
      return NextResponse.json({ error: "Clip ID is required." }, { status: 400 });
    }

    // 1. Resolve user from NextAuth session, or body/header credentials, ALWAYS UPSERTING
    let user = null;
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const email = session.user.email.trim().toLowerCase();
      user =
        db.getUserByEmail(email) ||
        db.upsertUser({
          email,
          name: session.user.name || email.split("@")[0],
          avatar: session.user.image || undefined,
        });
    } else if (userEmail) {
      const email = userEmail.trim().toLowerCase();
      user =
        db.getUserByEmail(email) ||
        db.upsertUser({
          email,
          name: body.userName || email.split("@")[0],
          avatar: body.userAvatar || undefined,
        });
    } else if (userId) {
      user = db.getUserById(userId);
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Please sign in to verify engagement and earn post credits.",
          code: "UNAUTHENTICATED",
        },
        { status: 401 }
      );
    }

    const settings = db.getSettings();
    const minSeconds = settings.minWatchSeconds || 13;

    // Anti-abuse: server verifies that watched seconds >= minWatchSeconds
    if (typeof watchedSeconds !== "number" || watchedSeconds < minSeconds) {
      return NextResponse.json(
        {
          error: `Verification requires watching for at least ${minSeconds} seconds. You were recorded for ${Math.floor(watchedSeconds || 0)}s.`,
          code: "TIME_TOO_SHORT",
        },
        { status: 400 }
      );
    }

    // Record engagement with Owner Bonus System logic
    const result = db.recordEngagement(
      user.id,
      videoId,
      watchedSeconds,
      Boolean(liked),
      Boolean(commented),
      Boolean(followed)
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    const updatedUser = db.getUserById(user.id);
    const limitStats = db.getUserPostLimitStats(user.id);

    return NextResponse.json({
      success: true,
      creditAwarded: result.creditAwarded,
      isOwnerBonus: result.isOwnerBonus,
      slotsAwarded: result.slotsAwarded,
      creditsAwarded: result.creditsAwarded,
      message: result.message,
      postCredits: updatedUser ? updatedUser.credits : 0,
      limitStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify engagement" },
      { status: 500 }
    );
  }
}
