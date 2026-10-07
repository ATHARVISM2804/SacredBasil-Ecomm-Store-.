import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay over REST (no SDK). Amounts are paise.
 * https://razorpay.com/docs/api/orders/create/
 */

const API = "https://api.razorpay.com/v1";

function credentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error("Razorpay is not configured");
  return { keyId, secret };
}

export const razorpayKeyId = () => credentials().keyId;

export type RazorpayOrder = { id: string; amount: number; currency: string; receipt: string; status: string };

export async function createRazorpayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, secret } = credentials();
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/** Constant-time comparison of two hex HMAC digests. */
function safeEqualHex(expectedHex: string, received: string) {
  const a = Buffer.from(expectedHex, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Checkout handler signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { secret } = credentials();
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
