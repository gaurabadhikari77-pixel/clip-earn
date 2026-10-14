export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  type: "vip" | "pin";
  targetVideoId?: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
  isSimulated?: boolean;
}

export interface PaymentProvider {
  name: string;
  createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult>;
  handleWebhook(rawBody: string, signature: string): Promise<{ handled: boolean; type?: string; metadata?: any }>;
}
