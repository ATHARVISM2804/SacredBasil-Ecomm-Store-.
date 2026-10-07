import type { PriceTier, Product } from "./types";

export const formatINR = (rupees: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rupees);

/** The tier that applies to a quantity (falls back to the first tier). */
export function tierFor(tiers: PriceTier[], quantity: number): PriceTier {
  return (
    tiers.find((t) => quantity >= t.min && (t.max === null || quantity <= t.max)) ??
    (quantity < tiers[0].min ? tiers[0] : tiers[tiers.length - 1])
  );
}

export const unitPriceFor = (product: Pick<Product, "tiers">, quantity: number) =>
  tierFor(product.tiers, quantity).unitPrice;

export const startingPrice = (product: Pick<Product, "tiers">) => product.tiers[0].unitPrice;

export const lowestPrice = (product: Pick<Product, "tiers">) => Math.min(...product.tiers.map((t) => t.unitPrice));

export function tierLabel(t: PriceTier) {
  if (t.max === null) return `${t.min}+`;
  if (t.min === t.max) return `${t.min}`;
  return `${t.min}–${t.max}`;
}
