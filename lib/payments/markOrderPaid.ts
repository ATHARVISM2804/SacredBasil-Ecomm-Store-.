import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { adminNotifyEmail, sendEmail } from "@/lib/email/send";
import { adminOrderEmail, orderConfirmationEmail } from "@/lib/email/templates";
import { getOrderByNumber } from "./orders";

export type MarkPaidResult = { found: false } | { found: true; orderId: string; orderNumber: string; newlyPaid: boolean };

/**
 * The one way an order becomes paid, shared by /api/checkout/verify and the
 * Razorpay webhook. The database function `mark_order_paid` does the status
 * change, audit event, stock decrement and coupon count in one transaction
 * and only once; emails go out only from the call that flipped the status.
 */
export async function markOrderPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  source: "checkout" | "webhook",
): Promise<MarkPaidResult> {
  const { data, error } = await createSupabaseAdminClient().rpc("mark_order_paid", {
    p_razorpay_order_id: razorpayOrderId,
    p_razorpay_payment_id: razorpayPaymentId,
    p_note: source === "webhook" ? "Payment captured (Razorpay webhook)" : "Payment verified at checkout",
  });
  if (error) throw new Error(`mark_order_paid failed: ${error.message}`);

  const row = (data as { order_id: string; order_number: string; newly_paid: boolean }[] | null)?.[0];
  if (!row) return { found: false };

  if (row.newly_paid) await sendOrderEmails(row.order_number);
  return { found: true, orderId: row.order_id, orderNumber: row.order_number, newlyPaid: row.newly_paid };
}

/** Marks a pending order failed (a later successful attempt can still pay it). */
export async function markOrderFailed(razorpayOrderId: string, reason?: string) {
  const { error } = await createSupabaseAdminClient().rpc("mark_order_failed", {
    p_razorpay_order_id: razorpayOrderId,
    p_note: reason ? `Payment failed: ${reason.slice(0, 200)}` : null,
  });
  if (error) throw new Error(`mark_order_failed failed: ${error.message}`);
}

/** Never throws: a payment must not be reported as failed because an email bounced. */
async function sendOrderEmails(orderNumber: string) {
  try {
    const order = await getOrderByNumber(orderNumber);
    if (!order) return;
    const admin = adminNotifyEmail();
    await Promise.all([
      sendEmail(orderConfirmationEmail(order)),
      admin ? sendEmail(adminOrderEmail(order, admin)) : Promise.resolve(),
    ]);
  } catch (error) {
    console.error(`[orders] emails for ${orderNumber} failed`, error);
  }
}
