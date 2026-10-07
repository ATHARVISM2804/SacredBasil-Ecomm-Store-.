import { NextResponse } from "next/server";
import { paymentsReady } from "@/lib/payments/config";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import { markOrderPaid } from "@/lib/payments/markOrderPaid";
import { receiptToken } from "@/lib/payments/receipt";

const ID = /^[A-Za-z0-9_]{1,64}$/;

/**
 * Called by the Razorpay Checkout success handler. The signature proves the
 * payment belongs to our Razorpay order; only then is the order marked paid.
 * The webhook does the same independently, so either can arrive first.
 */
export async function POST(request: Request) {
  if (!paymentsReady()) return NextResponse.json({ reason: "payments_not_configured" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ reason: "invalid" }, { status: 400 });
  }
  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    !ID.test(orderId) ||
    !ID.test(paymentId) ||
    signature.length > 128
  ) {
    return NextResponse.json({ reason: "invalid" }, { status: 400 });
  }

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ reason: "signature_mismatch" }, { status: 400 });
  }

  try {
    const result = await markOrderPaid(orderId, paymentId, "checkout");
    if (!result.found) return NextResponse.json({ reason: "not_found" }, { status: 404 });
    return NextResponse.json({ orderNumber: result.orderNumber, token: receiptToken(result.orderNumber) });
  } catch (error) {
    console.error("[checkout/verify]", error);
    // The payment itself succeeded; the webhook will still record it.
    return NextResponse.json({ reason: "failed" }, { status: 502 });
  }
}
