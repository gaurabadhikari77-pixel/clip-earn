import Stripe from "stripe";
import { CreateCheckoutParams, CheckoutResult, PaymentProvider } from "./provider";
import { db } from "../store";

const stripeApiKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeApiKey
  ? new Stripe(stripeApiKey, { apiVersion: "2025-02-24.acacia" as any })
  : null;

export class StripePaymentProvider implements PaymentProvider {
  name = "Stripe";

  async createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
    if (stripe) {
      // Real Stripe integration
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: params.type === "vip" ? "subscription" : "payment",
        customer_email: params.userEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name:
                  params.type === "vip"
                    ? "ClipEarn VIP Creator Membership"
                    : "ClipEarn 24h Pinned Video Boost",
                description:
                  params.type === "vip"
                    ? "20 posts/day, VIP section placement, VIP badge, and priority algorithmic exposure."
                    : "Pin your video directly at the top of the Pinned section for 24 hours.",
              },
              unit_amount: Math.round(params.amount * 100),
              ...(params.type === "vip" ? { recurring: { interval: "month" } } : {}),
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: params.userId,
          userEmail: params.userEmail,
          type: params.type,
          targetVideoId: params.targetVideoId || "",
        },
        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}&type=${params.type}&videoId=${params.targetVideoId || ""}`,
        cancel_url: params.cancelUrl,
      };

      const session = await stripe.checkout.sessions.create(sessionParams);

      return {
        url: session.url || params.successUrl,
        sessionId: session.id,
      };
    } else {
      // Demo / Simulator Mode when Stripe keys aren't added yet
      // Allows immediate interactive testing of the monetization flow
      const mockSessionId = `sim_cs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const separator = params.successUrl.includes("?") ? "&" : "?";
      const simulatedUrl = `${params.successUrl}${separator}session_id=${mockSessionId}&type=${params.type}&videoId=${params.targetVideoId || ""}&simulated=true`;

      return {
        url: simulatedUrl,
        sessionId: mockSessionId,
        isSimulated: true,
      };
    }
  }

  async handleWebhook(
    rawBody: string,
    signature: string
  ): Promise<{ handled: boolean; type?: string; metadata?: any }> {
    if (!stripe) {
      return { handled: false };
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("STRIPE_WEBHOOK_SECRET is not configured");
      return { handled: false };
    }

    try {
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata) {
          const { userId, type, targetVideoId } = metadata;

          if (type === "vip") {
            db.updateUserRole(userId, "vip");
          } else if (type === "pin" && targetVideoId) {
            const settings = db.getSettings();
            db.pinVideo(targetVideoId, settings.pinDurationHours);
          }

          db.addTransaction({
            userId,
            userEmail: metadata.userEmail || "",
            type: type as "vip" | "pin",
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
            status: "completed",
            stripeSessionId: session.id,
            targetVideoId: targetVideoId || undefined,
          });
        }
      }

      return { handled: true, type: event.type };
    } catch (err: any) {
      console.error("Stripe Webhook error:", err.message);
      throw err;
    }
  }
}

// Default exported active payment provider
export const paymentProvider: PaymentProvider = new StripePaymentProvider();
