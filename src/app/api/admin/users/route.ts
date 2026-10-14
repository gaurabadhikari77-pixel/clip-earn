import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminUserId = searchParams.get("adminUserId");

    if (adminUserId) {
      const admin = db.getUserById(adminUserId);
      if (!admin || (admin.role !== "owner" && admin.role !== "admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const users = db.getUsers().map((u) => {
      const stats = db.getUserPostLimitStats(u.id);
      return {
        ...u,
        postsTodayCount: stats.postsUsedToday,
        effectiveDailyLimit: stats.dailyLimit,
      };
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminUserId, targetUserId, role, customDailyLimit, isBanned, addCredits } = body;

    if (adminUserId) {
      const admin = db.getUserById(adminUserId);
      if (!admin || (admin.role !== "owner" && admin.role !== "admin")) {
        return NextResponse.json(
          { error: "Unauthorized: Admin privileges required." },
          { status: 403 }
        );
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    const user = db.getUserById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (role !== undefined) {
      db.updateUserRole(targetUserId, role);
    }

    if (customDailyLimit !== undefined) {
      // number (e.g. 10), -1 for unlimited, or null for default role limit
      db.updateUserCustomLimit(targetUserId, customDailyLimit);
    }

    if (isBanned !== undefined) {
      db.banUser(targetUserId, Boolean(isBanned));
    }

    if (typeof addCredits === "number") {
      db.addCredits(targetUserId, addCredits);
    }

    const updatedUser = db.getUserById(targetUserId);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
