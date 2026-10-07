"use client";

import Link from "next/link";
import { formatINR, tierLabel } from "@/lib/catalog/pricing";
import { issueLabel, type PricedLine } from "@/lib/cart/pricing";
import { cart } from "@/lib/cart/store";
import { QuantityStepper } from "./QuantityStepper";
import { ProductThumb } from "./ProductThumb";
import { cn } from "@/lib/utils";

/** One bag line: image, name, option, tier hint, quantity and remove. */
export function CartLineItem({
  line,
  onNavigate,
  size = "sm",
}: {
  line: PricedLine;
  onNavigate?: () => void;
  size?: "sm" | "lg";
}) {
  const p = line.product;
  const name = p?.name ?? "Unavailable item";
  const nextTier = line.nextTier;
  const toNext = nextTier ? nextTier.min - line.quantity : 0;

  return (
    <li className={cn("flex gap-4 py-5", size === "lg" && "gap-6 py-8")}>
      <ProductThumb
        src={p?.images[0]}
        alt=""
        className={size === "lg" ? "aspect-[4/5] w-24 md:w-32" : "aspect-[4/5] w-20"}
        sizes={size === "lg" ? "128px" : "80px"}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {p ? (
              <Link
                href={`/collections/${p.slug}`}
                onClick={onNavigate}
                className={cn("font-display leading-tight text-chocolate hover:underline", size === "lg" ? "text-2xl" : "text-lg")}
              >
                {name}
              </Link>
            ) : (
              <p className="font-display text-lg text-cocoa/60">{name}</p>
            )}
            {line.variantName && <p className="mt-0.5 text-sm text-cocoa/65">{line.variantName}</p>}
          </div>
          <p className="shrink-0 tabular-nums text-cocoa">{line.issue ? "—" : formatINR(line.lineTotal)}</p>
        </div>

        {line.tier && !line.issue && (
          <p className="mt-1 text-[0.8rem] text-cocoa/60">
            {formatINR(line.tier.unitPrice)} each for {tierLabel(line.tier)}
            {nextTier && toNext > 0 && toNext <= 10 && (
              <span className="text-gold">
                {" "}
                · add {toNext} more for {formatINR(nextTier.unitPrice)} each
              </span>
            )}
          </p>
        )}
        {line.issue && (
          <p className="mt-1 text-[0.8rem] text-terracotta" role="status">
            {issueLabel[line.issue]}
            {line.issue === "out_of_stock" && p?.stock ? ` — ${p.stock} available` : ""}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {p && line.issue !== "unavailable" ? (
            <QuantityStepper
              size="sm"
              value={line.quantity}
              max={p.stock ?? undefined}
              label={`Quantity of ${name}`}
              onChange={(n) => cart.setQuantity(line.productId, n, line.variantId)}
            />
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => cart.remove(line.productId, line.variantId)}
            className="eyebrow text-cocoa/60 underline-offset-4 hover:text-chocolate hover:underline"
            aria-label={`Remove ${name}${line.variantName ? `, ${line.variantName}` : ""} from bag`}
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
