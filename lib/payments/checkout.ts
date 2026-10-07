import "server-only";
import { getProductsByIds } from "@/lib/catalog/repository";
import { couponMessage, isValidQuantity, lineKey, priceCart, type CartTotals } from "@/lib/cart/pricing";
import type { CartLine } from "@/lib/catalog/types";
import type { CheckoutFailure, Coupon } from "@/lib/cart/types";
import { loadCoupon, loadShippingSetting, normaliseCouponCode } from "./settings";

export const MAX_LINES = 30;

/** Validates the shape of client-sent cart lines. Returns null when malformed. */
export function parseLines(input: unknown): CartLine[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return null;
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") return null;
    const { productId, variantId, quantity } = raw as Record<string, unknown>;
    if (typeof productId !== "string" || productId.length > 100 || !isValidQuantity(quantity)) return null;
    if (variantId !== undefined && variantId !== null && (typeof variantId !== "string" || variantId.length > 100))
      return null;
    const v = typeof variantId === "string" && variantId ? variantId : undefined;
    const key = lineKey(productId, v);
    if (seen.has(key)) return null;
    seen.add(key);
    lines.push({ productId, variantId: v, quantity });
  }
  return lines;
}

export type ServerPricing =
  | { ok: true; totals: CartTotals; coupon: Coupon | null }
  | { ok: false; status: number; reason: CheckoutFailure; message: string; lines?: string[] };

/**
 * Authoritative pricing: products, shipping policy and coupon are loaded on
 * the server and run through the same priceCart the storefront displays.
 */
export async function priceOnServer(lines: CartLine[], rawCouponCode?: unknown): Promise<ServerPricing> {
  const code = normaliseCouponCode(rawCouponCode);
  const [products, shippingSetting, coupon] = await Promise.all([
    getProductsByIds([...new Set(lines.map((l) => l.productId))]),
    loadShippingSetting(),
    code ? loadCoupon(code) : Promise.resolve(null),
  ]);

  const totals = priceCart(lines, products, { coupon, shippingSetting });

  if (totals.hasIssues) {
    return {
      ok: false,
      status: 409,
      reason: "cart_invalid",
      message: "Some items in your bag have changed. Please review your bag.",
      lines: totals.lines.filter((l) => l.issue).map((l) => l.key),
    };
  }
  if (code && !coupon) {
    return { ok: false, status: 422, reason: "coupon_invalid", message: couponMessage("not_found") };
  }
  if (coupon && totals.couponRejection) {
    return { ok: false, status: 422, reason: "coupon_invalid", message: couponMessage(totals.couponRejection, coupon) };
  }
  return { ok: true, totals, coupon };
}
