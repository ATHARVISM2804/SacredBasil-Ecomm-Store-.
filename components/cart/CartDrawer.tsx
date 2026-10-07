"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { formatINR } from "@/lib/catalog/pricing";
import { usePricedCart } from "@/lib/cart/usePricedCart";
import { lenisStore } from "@/components/ui/MotionProvider";
import { CartLineItem } from "./CartLineItem";
import { cn } from "@/lib/utils";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Slide-in bag. Mount once in the root layout; open it with useCart().open()
 * (CartButton and AddToCart do). Focus is trapped while open, Esc closes and
 * focus returns to whatever opened it.
 */
export function CartDrawer() {
  const { totals, status, cart } = usePricedCart();
  const { isOpen, close, lines } = cart;
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    lenisStore.current?.stop();
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenisStore.current?.start();
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [isOpen, close]);

  const empty = lines.length === 0;
  const canCheckout = totals !== null && !totals.hasIssues && !empty;

  return (
    <div className={cn("fixed inset-0 z-[60]", !isOpen && "pointer-events-none")} aria-hidden={!isOpen} inert={!isOpen}>
      <div
        className={cn(
          "absolute inset-0 bg-chocolate-deep/45 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col bg-ivory text-cocoa transition-[transform,box-shadow] duration-700 ease-[var(--ease-editorial)]",
          isOpen ? "translate-x-0 shadow-[-24px_0_60px_rgb(42_26_18/0.18)]" : "translate-x-full shadow-none",
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
          <h2 id="cart-drawer-title" className="font-display text-2xl font-light text-chocolate">
            Your bag{!empty && <span className="ml-2 text-base text-cocoa/55">({cart.count})</span>}
          </h2>
          <button
            type="button"
            onClick={close}
            data-autofocus
            className="-mr-2 grid size-10 place-items-center text-cocoa/70 hover:text-chocolate"
            aria-label="Close bag"
          >
            <X aria-hidden className="size-5" strokeWidth={1.25} />
          </button>
        </header>

        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-3xl font-light text-chocolate">Your bag is empty</p>
            <p className="mt-3 max-w-xs text-sm text-cocoa/65">
              Handcrafted Ayurvedic rituals, gift-boxed and ready to give.
            </p>
            <Link href="/collections" onClick={close} className="btn btn-primary mt-8">
              Explore the collections
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6" data-lenis-prevent>
              {status === "loading" && <p className="py-10 text-center text-sm text-cocoa/60">Loading your bag…</p>}
              {status === "error" && (
                <p className="py-10 text-center text-sm text-terracotta">
                  We couldn’t load your bag just now. Please refresh the page.
                </p>
              )}
              {totals && (
                <ul className="divide-y divide-[var(--line)]">
                  {totals.lines.map((line) => (
                    <CartLineItem key={line.key} line={line} onNavigate={close} />
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-[var(--line)] bg-cream/40 px-6 py-6">
              {totals && (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="eyebrow text-cocoa/70">Subtotal</span>
                    <span className="font-display text-2xl text-chocolate tabular-nums">{formatINR(totals.subtotal)}</span>
                  </div>
                  <p className="mt-2 text-[0.8rem] leading-relaxed text-cocoa/60">
                    {totals.shippingSeparate
                      ? totals.shippingNote
                      : totals.shipping
                        ? `Shipping ${formatINR(totals.shipping)}, added at checkout.`
                        : "Shipping is complimentary on this order."}
                  </p>
                  {totals.hasIssues && (
                    <p className="mt-2 text-[0.8rem] text-terracotta">Please review the highlighted items before checkout.</p>
                  )}
                </>
              )}
              <div className="mt-5 grid gap-2">
                {canCheckout ? (
                  <Link href="/checkout" onClick={close} className="btn btn-primary w-full justify-center">
                    Checkout
                  </Link>
                ) : (
                  <button type="button" disabled className="btn btn-primary w-full justify-center opacity-50">
                    Checkout
                  </button>
                )}
                <Link href="/cart" onClick={close} className="btn btn-text justify-center text-cocoa/70 hover:text-chocolate">
                  View full bag
                </Link>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
