"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatINR } from "@/lib/catalog/pricing";
import { cart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";
import { site, whatsappOrderLink } from "@/data/site";

/**
 * Bar that follows the page once the main "Add to bag" (#buy) has scrolled
 * away, as at Skandinavisk. Adds one of the first option, or orders one on
 * WhatsApp when site.orderOnWhatsApp is on.
 */
export function StickyBuy({
  productId,
  slug,
  variantId,
  variantName,
  name,
  image,
  price,
  soldOut,
}: {
  productId: string;
  slug: string;
  variantId?: string;
  variantName?: string;
  name: string;
  image: string;
  price: number;
  soldOut: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById("buy");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div
      inert={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-ivory transition-[transform,visibility] duration-500",
        show ? "visible translate-y-0" : "invisible translate-y-full",
      )}
    >
      <div className="flex items-center gap-4 px-[var(--gutter)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <span className="relative hidden size-14 shrink-0 bg-[#f3f1ee] sm:block">
          <Image src={image} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[0.95rem]">{name}</p>
        <p className="hidden text-[0.95rem] tabular-nums sm:block">{formatINR(price)}</p>
        {site.orderOnWhatsApp ? (
          <a
            href={soldOut ? undefined : whatsappOrderLink({ name, slug, variant: variantName, quantity: 1, unitPrice: price })}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={soldOut}
            className="btn btn-primary min-w-[9rem] justify-center aria-disabled:opacity-50 sm:min-w-[14rem]"
          >
            {soldOut ? "Unavailable" : "Order on WhatsApp"}
          </a>
        ) : (
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            cart.add(productId, 1, variantId);
            cart.open();
          }}
          className="btn btn-primary min-w-[9rem] justify-center disabled:opacity-50 sm:min-w-[14rem]"
        >
          {soldOut ? "Unavailable" : "Add to bag"}
        </button>
        )}
      </div>
    </div>
  );
}
