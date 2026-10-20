import type { PriceTier, ProductItem, ProductVariant } from "@/lib/catalog/types";

/** Result returned by every admin server action used with useActionState. */
export type ActionState = {
  ok: boolean;
  message: string;
  /** Field-level errors keyed by input name. */
  errors?: Record<string, string>;
};

export const idleState: ActionState = { ok: false, message: "" };

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "failed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ENQUIRY_STATUSES = ["new", "in_progress", "quoted", "won", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type ShippingAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  recipientName?: string;
  recipientPhone?: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  email: string;
  phone: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  gift_message: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type OrderEventRow = {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  actor: string | null;
  /** Staff-only note (column added by 20261005010000_admin.sql). */
  internal?: boolean;
  created_at: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  short_description: string;
  description: string;
  images: string[];
  contents: ProductItem[];
  packaging: string;
  dimensions: string | null;
  variants: ProductVariant[] | null;
  tiers: PriceTier[];
  bespoke_from: number | null;
  customisation: string | null;
  stock: number | null;
  status: "active" | "draft";
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type EnquiryRow = {
  id: string;
  kind: "corporate" | "general";
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  quantity: string | null;
  occasion: string | null;
  collection: string | null;
  budget: string | null;
  delivery_location: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
};

export type CouponRow = {
  code: string;
  kind: "percent" | "flat";
  value: number;
  min_subtotal: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  created_at: string;
};
