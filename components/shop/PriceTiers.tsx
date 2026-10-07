import type { Product } from "@/lib/catalog/types";
import { formatINR, tierLabel } from "@/lib/catalog/pricing";
import { cn } from "@/lib/utils";

/** Quantity pricing table, as in the brochure. */
export function PriceTiers({ product, className }: { product: Product; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-[3px] border border-[var(--line)]", className)}>
      <table className="w-full text-left text-[0.9rem]">
        <caption className="sr-only">Price per {product.name} by quantity</caption>
        <thead className="bg-chocolate text-ivory">
          <tr>
            <th scope="col" className="eyebrow px-4 py-3 font-medium">
              Quantity
            </th>
            <th scope="col" className="eyebrow px-4 py-3 text-right font-medium">
              Price each
            </th>
          </tr>
        </thead>
        <tbody>
          {product.tiers.map((t) => (
            <tr key={t.min} className="border-t border-[var(--line)] bg-ivory/60">
              <td className="px-4 py-3 text-cocoa/80">{tierLabel(t)} {t.min === 1 && t.max === 1 ? "piece" : "pieces"}</td>
              <td className="px-4 py-3 text-right font-display text-lg text-chocolate">{formatINR(t.unitPrice)}</td>
            </tr>
          ))}
          {product.bespokeFrom && (
            <tr className="border-t border-[var(--line)] bg-cream/60">
              <td className="px-4 py-3 text-cocoa/80">{product.bespokeFrom}+ pieces</td>
              <td className="px-4 py-3 text-right text-[0.85rem] text-cocoa/70">Bespoke, open for discussion</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
