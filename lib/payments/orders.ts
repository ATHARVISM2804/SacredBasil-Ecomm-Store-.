import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type OrderItemRow = {
  product_id: string;
  product_name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  customer_name: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; pincode: string; country?: string };
  gift_message: string | null;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total: number;
  status: string;
  razorpay_order_id: string | null;
  paid_at: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  created_at: string;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

const ORDER_COLUMNS =
  "id, order_number, user_id, email, phone, customer_name, shipping_address, gift_message, subtotal, discount, coupon_code, shipping_fee, total, status, razorpay_order_id, paid_at, tracking_carrier, tracking_number, created_at, items:order_items(product_id, product_name, variant, quantity, unit_price, line_total)";

/** Service-role read. Callers must have authorised access (receipt token, webhook, verify). */
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) throw new Error(`Could not load order: ${error.message}`);
  return (data as OrderWithItems | null) ?? null;
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  if (error) throw new Error(`Could not load order: ${error.message}`);
  return (data as OrderWithItems | null) ?? null;
}
