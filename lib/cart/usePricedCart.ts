"use client";

import { useMemo } from "react";
import { useCatalog } from "./catalog";
import { priceCart, type CartTotals } from "./pricing";
import { useCart } from "./store";
import type { Coupon } from "./types";

/** The bag priced against the live catalogue (display only; the server re-prices). */
export function usePricedCart(coupon?: Coupon | null): {
  status: "loading" | "ready" | "error";
  totals: CartTotals | null;
  cart: ReturnType<typeof useCart>;
} {
  const cart = useCart();
  const catalog = useCatalog();
  const totals = useMemo(
    () =>
      catalog.status === "ready"
        ? priceCart(cart.lines, catalog.data.products, { coupon, shippingSetting: catalog.data.shipping })
        : null,
    [cart.lines, catalog, coupon],
  );
  return { status: catalog.status, totals, cart };
}
