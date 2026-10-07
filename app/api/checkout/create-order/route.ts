import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { paymentsReady } from "@/lib/payments/config";
import { parseLines, priceOnServer } from "@/lib/payments/checkout";
import { createRazorpayOrder, razorpayKeyId } from "@/lib/payments/razorpay";
import { cleanAddress, LIMITS, normalisePhone, validateAddress, validateContact } from "@/lib/cart/validation";
import type { CheckoutFailure, CreateOrderRequest, CreateOrderResponse } from "@/lib/cart/types";

const fail = (reason: CheckoutFailure, status: number, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ reason, ...extra }, { status });

/**
 * Creates a pending order (service role) priced entirely on the server, then
 * a matching Razorpay order. The browser only ever receives the Razorpay
 * order id and the public key id.
 */
export async function POST(request: Request) {
  if (!paymentsReady()) return fail("payments_not_configured", 503);

  let body: Partial<CreateOrderRequest>;
  try {
    body = await request.json();
  } catch {
    return fail("invalid", 400);
  }

  const lines = parseLines(body.lines);
  if (!lines) return fail("invalid", 400, { message: "Your bag could not be read." });

  const contact = body.contact ?? { name: "", email: "", phone: "" };
  const address = body.address ?? { line1: "", city: "", state: "", pincode: "" };
  const fields = { ...validateContact(contact), ...validateAddress(address) };
  const gift = typeof body.giftMessage === "string" ? body.giftMessage.trim() : "";
  if (gift.length > LIMITS.gift) fields.giftMessage = "Please keep the gift message under 300 characters.";
  if (Object.keys(fields).length) return fail("invalid", 422, { fields });

  try {
    const pricing = await priceOnServer(lines, body.couponCode);
    if (!pricing.ok) return fail(pricing.reason, pricing.status, { message: pricing.message, lines: pricing.lines });
    const { totals } = pricing;

    if (totals.total < 1) return fail("amount_too_low", 422, { message: "This order total cannot be paid online." });
    if (body.expectedTotal !== totals.total) {
      return fail("price_changed", 409, {
        total: totals.total,
        message: "Prices have been updated since you opened checkout. Please review your total.",
      });
    }

    // Attach the order to the signed-in customer, if any.
    let userId: string | null = null;
    const userClient = isSupabaseConfigured ? await createSupabaseServerClient() : null;
    if (userClient) {
      const { data } = await userClient.auth.getUser();
      userId = data.user?.id ?? null;
    }

    const name = String(contact.name).trim();
    const email = String(contact.email).trim().toLowerCase();
    const phone = normalisePhone(String(contact.phone))!;
    const shippingAddress = cleanAddress(address as CreateOrderRequest["address"]);

    const db = createSupabaseAdminClient();
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: userId,
        email,
        phone,
        customer_name: name,
        shipping_address: shippingAddress,
        gift_message: gift || null,
        subtotal: totals.subtotal,
        discount: totals.discount,
        coupon_code: totals.couponCode,
        shipping_fee: totals.shipping,
        total: totals.total,
        status: "pending",
      })
      .select("id, order_number")
      .single();
    if (orderError || !order) throw new Error(`order insert failed: ${orderError?.message}`);

    const discard = () => db.from("orders").delete().eq("id", order.id);

    const { error: itemsError } = await db.from("order_items").insert(
      totals.lines.map((l) => ({
        order_id: order.id,
        product_id: l.productId,
        product_name: l.product!.name,
        variant: l.variantName ?? null,
        quantity: l.quantity,
        unit_price: l.unitPrice,
        line_total: l.lineTotal,
      })),
    );
    if (itemsError) {
      await discard();
      throw new Error(`order_items insert failed: ${itemsError.message}`);
    }

    let razorpayOrderId: string;
    try {
      const rzp = await createRazorpayOrder({
        amountPaise: totals.total * 100,
        receipt: order.order_number,
        notes: { order_id: order.id, order_number: order.order_number },
      });
      razorpayOrderId = rzp.id;
    } catch (error) {
      await discard();
      throw error;
    }

    const { error: linkError } = await db
      .from("orders")
      .update({ razorpay_order_id: razorpayOrderId })
      .eq("id", order.id);
    if (linkError) {
      await discard();
      throw new Error(`could not store razorpay_order_id: ${linkError.message}`);
    }

    await db.from("order_events").insert({ order_id: order.id, status: "pending", note: "Order placed, awaiting payment" });

    // Optional: save the address to the customer's account (RLS: owner only).
    if (userId && userClient && body.saveAddress) {
      const { error } = await userClient.from("addresses").insert({
        user_id: userId,
        full_name: name,
        phone,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
      });
      if (error) console.warn("[checkout] could not save address", error.message);
    }

    const response: CreateOrderResponse = {
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId,
      amount: totals.total * 100,
      currency: "INR",
      keyId: razorpayKeyId(),
      prefill: { name, email, contact: phone },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[checkout/create-order]", error);
    return fail("failed", 502, { message: "We couldn’t start the payment. Please try again in a moment." });
  }
}
