import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, targetVideoId, sessionId } = body;

    if (!userId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = db.getSettings();

    if (type === "vip") {
      db.updateUserRole(userId, "vip");
      db.addCredits(userId, 10); // Welcome credit boost for VIP
    } else if (type === "pin" && targetVideoId) {
      db.pinVideo(targetVideoId, settings.pinDurationHours);
    }

    const amount = type === "vip" ? settings.vipMonthlyPrice : settings.pinVideoPrice;

    const tx = db.addTransaction({
      userId,
      userEmail: user.email,
      type,
      amount,
      currency: "usd",
      status: "completed",
      stripeSessionId: sessionId || `sim_${Date.now()}`,
      targetVideoId: targetVideoId || undefined,
    });

    const updatedUser = db.getUserById(userId);
    const limitStats = db.getUserPostLimitStats(userId);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      limitStats,
      transaction: tx,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
