import { tierFor } from "../catalog/pricing";
import type { CartLine, PriceTier } from "../catalog/types";
import type { CartProduct, Coupon, ShippingSetting } from "./types";

/**
 * Pure cart pricing. Used by the drawer, the cart and checkout pages for
 * display AND by the server to compute the amount actually charged, so the
 * two can never disagree. Client-supplied prices are never trusted.
 *
 * Quantity tiers apply per line: 12 kits of one product are priced on the
 * 10–25 tier regardless of what else is in the bag.
 */

export const MAX_QUANTITY = 999;

export const DEFAULT_SHIPPING: ShippingSetting = {
  mode: "separate",
  note: "We deliver across India. Shipping charges are not included in the kit price and are confirmed for your destination after you order.",
};

export type LineIssue = "unavailable" | "variant_required" | "invalid_variant" | "out_of_stock" | "invalid_quantity";

export type PricedLine = {
  key: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  product: CartProduct | null;
  tier: PriceTier | null;
  /** The next, cheaper tier (for "add N more for ₹X each" hints). */
  nextTier: PriceTier | null;
  unitPrice: number;
  lineTotal: number;
  /** Quantity at or above the product's bespoke threshold. */
  bespoke: boolean;
  issue?: LineIssue;
};

export type CouponCheck = { ok: true; discount: number } | { ok: false; reason: CouponRejection };
export type CouponRejection = "inactive" | "not_started" | "expired" | "exhausted" | "min_subtotal";

export type CartTotals = {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  couponRejection: CouponRejection | null;
  shipping: number;
  shippingMode: ShippingSetting["mode"];
  /** True when shipping is quoted and charged after the order, not included in `total`. */
  shippingSeparate: boolean;
  shippingNote: string;
  total: number;
  /** Any line that cannot be bought as is. */
  hasIssues: boolean;
  hasBespoke: boolean;
};

export const lineKey = (productId: string, variantId?: string) => `${productId}::${variantId ?? ""}`;

export const isValidQuantity = (q: unknown): q is number =>
  typeof q === "number" && Number.isInteger(q) && q >= 1 && q <= MAX_QUANTITY;

export function checkCoupon(coupon: Coupon, subtotal: number, now = new Date()): CouponCheck {
  if (!coupon.active) return { ok: false, reason: "inactive" };
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return { ok: false, reason: "not_started" };
  if (coupon.endsAt && new Date(coupon.endsAt) < now) return { ok: false, reason: "expired" };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { ok: false, reason: "exhausted" };
  if (subtotal < coupon.minSubtotal) return { ok: false, reason: "min_subtotal" };
  const raw =
    coupon.kind === "percent" ? Math.floor((subtotal * Math.min(coupon.value, 100)) / 100) : coupon.value;
  return { ok: true, discount: Math.max(0, Math.min(raw, subtotal)) };
}

export const couponMessage = (reason: CouponRejection | "not_found", coupon?: Coupon) => {
  switch (reason) {
    case "min_subtotal":
      return `This code applies to orders of ₹${coupon?.minSubtotal.toLocaleString("en-IN")} or more.`;
    case "expired":
      return "This code has expired.";
    case "not_started":
      return "This code is not active yet.";
    case "exhausted":
      return "This code has reached its usage limit.";
    default:
      return "This code isn’t valid.";
  }
};

function shippingFor(setting: ShippingSetting, merchandise: number) {
  const flat = Math.max(0, Math.round(setting.flatFee ?? 0));
  if (setting.mode === "flat") return flat;
  if (setting.mode === "free_over") return merchandise >= (setting.freeOver ?? Infinity) ? 0 : flat;
  return 0;
}

export function priceCart(
  lines: CartLine[],
  products: CartProduct[],
  options: { coupon?: Coupon | null; shippingSetting?: ShippingSetting | null; now?: Date } = {},
): CartTotals {
  const byId = new Map(products.map((p) => [p.id, p]));

  const priced: PricedLine[] = lines.map((line) => {
    const product = byId.get(line.productId) ?? null;
    const base = {
      key: lineKey(line.productId, line.variantId),
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      product,
      tier: null,
      nextTier: null,
      unitPrice: 0,
      lineTotal: 0,
      bespoke: false,
    };
    if (!product || product.tiers.length === 0) return { ...base, issue: "unavailable" as const };
    if (!isValidQuantity(line.quantity)) return { ...base, issue: "invalid_quantity" as const };

    let issue: LineIssue | undefined;
    let variantName: string | undefined;
    if (product.variants?.length) {
      const v = product.variants.find((x) => x.id === line.variantId);
      if (!line.variantId) issue = "variant_required";
      else if (!v) issue = "invalid_variant";
      else variantName = v.name;
    } else if (line.variantId) {
      issue = "invalid_variant";
    }
    if (!issue && product.stock !== null && line.quantity > product.stock) issue = "out_of_stock";

    const tier = tierFor(product.tiers, line.quantity);
    const idx = product.tiers.indexOf(tier);
    return {
      ...base,
      variantName,
      tier,
      nextTier: product.tiers[idx + 1] ?? null,
      unitPrice: tier.unitPrice,
      lineTotal: tier.unitPrice * line.quantity,
      bespoke: product.bespokeFrom !== undefined && line.quantity >= product.bespokeFrom,
      issue,
    };
  });

  const valid = priced.filter((l) => !l.issue);
  const subtotal = valid.reduce((sum, l) => sum + l.lineTotal, 0);

  let discount = 0;
  let couponCode: string | null = null;
  let couponRejection: CouponRejection | null = null;
  if (options.coupon) {
    const check = checkCoupon(options.coupon, subtotal, options.now);
    if (check.ok) {
      discount = check.discount;
      couponCode = options.coupon.code;
    } else {
      couponRejection = check.reason;
    }
  }

  const setting = options.shippingSetting ?? DEFAULT_SHIPPING;
  const merchandise = subtotal - discount;
  const shipping = valid.length ? shippingFor(setting, merchandise) : 0;
  const shippingSeparate = setting.mode === "separate";

  return {
    lines: priced,
    itemCount: valid.reduce((n, l) => n + l.quantity, 0),
    subtotal,
    discount,
    couponCode,
    couponRejection,
    shipping,
    shippingMode: setting.mode,
    shippingSeparate,
    shippingNote: setting.note?.trim() || DEFAULT_SHIPPING.note!,
    total: merchandise + shipping,
    hasIssues: priced.some((l) => l.issue),
    hasBespoke: priced.some((l) => l.bespoke),
  };
}

export const issueLabel: Record<LineIssue, string> = {
  unavailable: "No longer available",
  variant_required: "Please choose an option",
  invalid_variant: "This option is no longer available",
  out_of_stock: "Not enough in stock",
  invalid_quantity: "Invalid quantity",
};
