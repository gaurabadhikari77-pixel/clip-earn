import { NextRequest, NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/stripe";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const result = await paymentProvider.handleWebhook(rawBody, signature);
    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 400 }
    );
  }
}
