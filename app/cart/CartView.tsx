"use client";

import Link from "next/link";
import { formatINR } from "@/lib/catalog/pricing";
import { usePricedCart } from "@/lib/cart/usePricedCart";
import { CartLineItem } from "@/components/cart/CartLineItem";

export function CartView() {
  const { totals, status, cart } = usePricedCart();

  if (!cart.hydrated) return <p className="mt-16 text-cocoa/60">Loading your bag…</p>;

  if (cart.lines.length === 0) {
    return (
      <div className="mt-16 max-w-lg">
        <p className="lede text-cocoa/72">Your bag is empty. Each kit is handcrafted in small batches and gift-boxed by hand.</p>
        <Link href="/collections" className="btn btn-primary mt-10">
          Explore the collections
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-20">
      <div>
        {status === "loading" && <p className="py-10 text-cocoa/60">Loading your bag…</p>}
        {status === "error" && <p className="py-10 text-terracotta">We couldn’t load your bag just now. Please refresh the page.</p>}
        {totals && (
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {totals.lines.map((line) => (
              <CartLineItem key={line.key} line={line} size="lg" />
            ))}
          </ul>
        )}
        <Link href="/collections" className="btn btn-text mt-6 text-cocoa/70 hover:text-chocolate">
          ← Continue shopping
        </Link>
      </div>

      {totals && (
        <aside aria-label="Bag summary" className="h-fit border border-[var(--line)] bg-cream/40 p-8 lg:sticky lg:top-32">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-cocoa/70">Items</dt>
              <dd className="tabular-nums">{totals.itemCount}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="eyebrow text-cocoa/70">Subtotal</dt>
              <dd className="font-display text-2xl text-chocolate tabular-nums">{formatINR(totals.subtotal)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8rem] leading-relaxed text-cocoa/60">
            {totals.shippingSeparate
              ? totals.shippingNote
              : totals.shipping
                ? `Shipping ${formatINR(totals.shipping)}, added at checkout.`
                : "Shipping is complimentary on this order."}{" "}
            Gift codes can be applied at checkout.
          </p>
          {totals.hasBespoke && (
            <p className="mt-4 border-l border-gold pl-3 text-[0.8rem] text-cocoa/75">
              Ordering 100 or more? We can customise with your logo and message.{" "}
              <Link href="/corporate-gifting#enquire" className="underline underline-offset-4">
                Enquire
              </Link>
            </p>
          )}
          {totals.hasIssues ? (
            <>
              <p className="mt-6 text-[0.8rem] text-terracotta">Please review the highlighted items.</p>
              <button type="button" disabled className="btn btn-primary mt-3 w-full justify-center opacity-50">
                Checkout
              </button>
            </>
          ) : (
            <Link href="/checkout" className="btn btn-primary mt-6 w-full justify-center">
              Checkout
            </Link>
          )}
        </aside>
      )}
    </div>
  );
}
