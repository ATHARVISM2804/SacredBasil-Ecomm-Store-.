import type { Product } from "../catalog/types";

/** The product fields the cart, drawer and pricing need (also what /api/catalog returns). */
export type CartProduct = Pick<
  Product,
  "id" | "slug" | "name" | "images" | "variants" | "tiers" | "bespokeFrom" | "stock"
>;

/** settings row `shipping`, editable in the admin. */
export type ShippingSetting = {
  mode: "separate" | "flat" | "free_over";
  flatFee?: number;
  freeOver?: number;
  note?: string;
};

/** A coupon as stored in public.coupons (camelCased). */
export type Coupon = {
  code: string;
  kind: "percent" | "flat";
  value: number;
  minSubtotal: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usedCount: number;
};

export type CatalogResponse = {
  products: CartProduct[];
  shipping: ShippingSetting;
};

export type CheckoutContact = { name: string; email: string; phone: string };

export type CheckoutAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type CreateOrderRequest = {
  lines: { productId: string; variantId?: string; quantity: number }[];
  contact: CheckoutContact;
  address: CheckoutAddress;
  giftMessage?: string;
  couponCode?: string;
  /** The total the customer saw. The server refuses to charge a different amount. */
  expectedTotal: number;
  /** Signed-in customers only: also save this address to their account. */
  saveAddress?: boolean;
};

export type CreateOrderResponse = {
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  /** Paise. */
  amount: number;
  currency: "INR";
  keyId: string;
  prefill: { name: string; email: string; contact: string };
};

export type CheckoutFailure =
  | "payments_not_configured"
  | "invalid"
  | "cart_invalid"
  | "price_changed"
  | "coupon_invalid"
  | "amount_too_low"
  | "failed";
