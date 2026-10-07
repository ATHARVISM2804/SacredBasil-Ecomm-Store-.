import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Receipt tokens let the thank-you page show an order without exposing
 * orders by their (sequential, guessable) number alone. The token is an
 * HMAC of the order number keyed from the Razorpay secret, which always
 * exists whenever an order can have been paid online.
 */

function key() {
  const base = process.env.ORDER_RECEIPT_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!base) return null;
  return createHmac("sha256", base).update("sacred-basil:receipt:v1").digest();
}

export function receiptToken(orderNumber: string) {
  const k = key();
  if (!k) throw new Error("Receipt tokens need RAZORPAY_KEY_SECRET or ORDER_RECEIPT_SECRET");
  return createHmac("sha256", k).update(orderNumber).digest("base64url").slice(0, 32);
}

export function verifyReceiptToken(orderNumber: string, token: string) {
  const k = key();
  if (!k || !token) return false;
  const expected = Buffer.from(createHmac("sha256", k).update(orderNumber).digest("base64url").slice(0, 32));
  const got = Buffer.from(token);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
