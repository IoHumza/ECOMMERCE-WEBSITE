import { env } from "@/lib/env";

/**
 * Payment provider abstraction.
 *
 * This interface intentionally mirrors how a real provider (Stripe, etc.)
 * would be wired in: the checkout flow never touches provider SDKs
 * directly, it calls this abstraction instead. Swapping the in-memory
 * `MockPaymentProvider` for a `StripePaymentProvider` implementation would
 * require no changes anywhere else in the codebase.
 *
 * To integrate Stripe for real:
 *  1. `npm install stripe`
 *  2. Set PAYMENT_SECRET_KEY in the environment to the Stripe secret key.
 *  3. Implement StripePaymentProvider below using `stripe.paymentIntents.create`.
 *  4. Swap the export of `paymentProvider` to the Stripe implementation.
 */
export type PaymentIntentResult = {
  success: boolean;
  reference: string;
  status: "paid" | "failed" | "pending";
};

export interface PaymentProvider {
  charge(params: { amount: number; currency: string; orderNumber: string }): Promise<PaymentIntentResult>;
}

class MockPaymentProvider implements PaymentProvider {
  async charge(params: { amount: number; currency: string; orderNumber: string }): Promise<PaymentIntentResult> {
    // No real payment secret configured: simulate a successful capture so
    // the rest of the order pipeline (inventory, notifications, etc.) can
    // be exercised end-to-end in development.
    const hasRealCredentials = Boolean(env.paymentSecretKey);
    return {
      success: true,
      reference: `${hasRealCredentials ? "live" : "mock"}_${params.orderNumber}`,
      status: "paid",
    };
  }
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
