import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAdminDbConfigured } from "@/lib/payments/config";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { markOrderFailed, markOrderPaid } from "@/lib/payments/markOrderPaid";
import { getOrderByRazorpayId } from "@/lib/payments/orders";

/**
 * Razorpay webhook: the source of truth for payment state.
 * Subscribe to payment.captured, order.paid and payment.failed, with the
 * secret in RAZORPAY_WEBHOOK_SECRET. Events are de-duplicated through
 * public.payment_events (x-razorpay-event-id).
 */

type PaymentEntity = { id: string; order_id: string | null; amount: number; status: string; error_description?: string };
type WebhookEvent = {
  event: string;
  payload: { payment?: { entity: PaymentEntity }; order?: { entity: { id: string; amount_paid: number } } };
};

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !isAdminDbConfigured()) return NextResponse.json({ reason: "not_configured" }, { status: 503 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!signature || !verifyWebhookSignature(raw, signature, secret)) {
    return NextResponse.json({ reason: "signature_mismatch" }, { status: 400 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(raw) as WebhookEvent;
  } catch {
    return NextResponse.json({ reason: "invalid" }, { status: 400 });
  }

  const db = createSupabaseAdminClient();
  const eventId = request.headers.get("x-razorpay-event-id");
  if (eventId) {
    const { error } = await db.from("payment_events").insert({ id: eventId, type: event.event, payload: event });
    if (error?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    if (error) {
      console.error("[webhooks/razorpay] could not record event", error.message);
      return NextResponse.json({ reason: "failed" }, { status: 500 });
    }
  }

  try {
    await handle(event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[webhooks/razorpay] ${event.event} failed`, error);
    // Forget the event so Razorpay's retry is processed.
    if (eventId) await db.from("payment_events").delete().eq("id", eventId);
    return NextResponse.json({ reason: "failed" }, { status: 500 });
  }
}

async function handle(event: WebhookEvent) {
  const payment = event.payload.payment?.entity;
  switch (event.event) {
    case "payment.captured":
    case "order.paid": {
      const razorpayOrderId = payment?.order_id ?? event.payload.order?.entity.id;
      if (!payment || !razorpayOrderId) return;
      const order = await getOrderByRazorpayId(razorpayOrderId);
      if (!order) return; // Not one of ours (e.g. a payment link).
      if (payment.amount < order.total * 100) {
        console.error(`[webhooks/razorpay] amount mismatch for ${order.order_number}: ${payment.amount} paise`);
        return;
      }
      await markOrderPaid(razorpayOrderId, payment.id, "webhook");
      return;
    }
    case "payment.failed": {
      if (payment?.order_id) await markOrderFailed(payment.order_id, payment.error_description);
      return;
    }
    default:
      return;
  }
}
