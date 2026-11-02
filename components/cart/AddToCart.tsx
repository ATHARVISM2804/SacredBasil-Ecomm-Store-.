"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import { formatINR, tierFor, tierLabel } from "@/lib/catalog/pricing";
import { MAX_QUANTITY } from "@/lib/cart/pricing";
import { cart } from "@/lib/cart/store";
import { QuantityStepper } from "./QuantityStepper";
import { cn } from "@/lib/utils";
import { site, whatsappOrderLink } from "@/data/site";
import { SocialIcon } from "@/components/footer/SocialLinks";

type AddToCartProduct = Pick<Product, "id" | "slug" | "name" | "variants" | "tiers" | "bespokeFrom" | "stock">;

/**
 * Product purchase block: option, quantity, live tier price and "Add to bag".
 * Pass a plain (serialisable) Product from a Server Component.
 */
export function AddToCart({ product, className }: { product: AddToCartProduct; className?: string }) {
  const id = useId();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [quantity, setQuantity] = useState(product.tiers[0]?.min ?? 1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock !== null && product.stock <= 0;
  const max = product.stock === null ? MAX_QUANTITY : Math.max(1, Math.min(MAX_QUANTITY, product.stock));
  const tier = product.tiers.length ? tierFor(product.tiers, quantity) : null;
  const bespoke = product.bespokeFrom !== undefined && quantity >= product.bespokeFrom;

  const update = (n: number) => {
    setQuantity(n);
    setAdded(false);
  };

  const add = () => {
    if (soldOut || !tier) return;
    cart.add(product.id, quantity, variantId);
    setAdded(true);
    cart.open();
  };

  return (
    <div className={cn("space-y-8", className)}>
      {product.variants && product.variants.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-cocoa/70">Choose</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const checked = v.id === variantId;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "cursor-pointer border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-gold",
                    checked ? "border-chocolate bg-chocolate text-ivory" : "border-[var(--line)] text-cocoa hover:border-cocoa/40",
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-variant`}
                    value={v.id}
                    checked={checked}
                    onChange={() => {
                      setVariantId(v.id);
                      setAdded(false);
                    }}
                    className="sr-only"
                  />
                  {v.name}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {product.tiers.length > 1 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-cocoa/70">Price per kit</legend>
          <div className={cn("grid gap-2", product.tiers.length > 2 ? "grid-cols-3" : "grid-cols-2")}>
            {product.tiers.map((t) => {
              const active = t === tier;
              return (
                <button
                  key={t.min}
                  type="button"
                  aria-pressed={active}
                  onClick={() => !active && update(Math.min(max, t.min))}
                  className={cn(
                    "border px-2 py-3 text-center transition-colors",
                    active ? "border-chocolate bg-chocolate text-ivory" : "border-[var(--line)] text-cocoa hover:border-cocoa/40",
                  )}
                >
                  <span className="block text-[0.95rem] tabular-nums">{formatINR(t.unitPrice)}</span>
                  <span className={cn("mt-0.5 block text-[0.75rem]", active ? "text-ivory/70" : "text-cocoa/60")}>
                    {tierLabel(t)} {t.max === t.min ? "kit" : "kits"}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="eyebrow mb-3 text-cocoa/70" aria-hidden>
            Quantity
          </p>
          <QuantityStepper value={quantity} onChange={update} max={max} label={`Quantity of ${product.name}`} />
        </div>
        {tier && (
          <div aria-live="polite" className="text-right">
            <p className="eyebrow mb-3 text-cocoa/70">Total</p>
            <p className="text-[1.35rem] leading-[2.75rem] text-chocolate tabular-nums">{formatINR(quantity * tier.unitPrice)}</p>
          </div>
        )}
      </div>

      {product.stock !== null && !soldOut && product.stock <= 10 && (
        <p className="text-sm text-cocoa/65">Only {product.stock} available.</p>
      )}

      {bespoke && (
        <p className="border-l border-gold pl-4 text-sm text-cocoa/75">
          For {product.bespokeFrom}+ kits we customise with your logo, packaging and message.{" "}
          <Link
            href={`/corporate-gifting?collection=${encodeURIComponent(product.slug)}#enquire`}
            className="text-chocolate underline underline-offset-4"
          >
            Enquire for bespoke pricing
          </Link>
        </p>
      )}

      {site.orderOnWhatsApp ? (
        <a
          href={
            soldOut || !tier
              ? undefined
              : whatsappOrderLink({
                  name: product.name,
                  slug: product.slug,
                  variant: product.variants?.find((v) => v.id === variantId)?.name,
                  quantity,
                  unitPrice: tier.unitPrice,
                })
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={soldOut || !tier}
          className="btn btn-primary w-full justify-center aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <SocialIcon network="whatsapp" className="size-[1.1rem]" />
          <span>{soldOut ? "Currently unavailable" : "Order on WhatsApp"}</span>
        </a>
      ) : (
        <div>
          <button
            type="button"
            onClick={add}
            disabled={soldOut || !tier}
            className="btn btn-primary w-full justify-center disabled:pointer-events-none disabled:opacity-50"
          >
            <span>{soldOut ? "Currently unavailable" : "Add to bag"}</span>
            {!soldOut && <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />}
          </button>
          <p className="mt-2 text-sm text-cocoa/65" role="status">
            {added ? "Added to your bag." : ""}
          </p>
        </div>
      )}
    </div>
  );
}
