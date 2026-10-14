import { NextRequest, NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/stripe";
import { db } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, targetVideoId, redirectOrigin } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "userId and type ('vip' | 'pin') are required." },
        { status: 400 }
      );
    }

    const user = db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const settings = db.getSettings();
    const amount = type === "vip" ? settings.vipMonthlyPrice : settings.pinVideoPrice;

    const origin = redirectOrigin || req.headers.get("origin") || "http://localhost:3000";
    const successUrl = `${origin}/upgrade/success`;
    const cancelUrl = `${origin}/upgrade`;

    const result = await paymentProvider.createCheckoutSession({
      userId,
      userEmail: user.email,
      type,
      targetVideoId,
      amount,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment session" },
      { status: 500 }
    );
  }
}
