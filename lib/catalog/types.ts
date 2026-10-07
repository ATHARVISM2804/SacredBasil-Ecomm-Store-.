/** Prices are whole Indian rupees. Razorpay amounts are derived as rupees × 100. */
export type PriceTier = {
  /** Inclusive minimum quantity for this price. */
  min: number;
  /** Inclusive maximum, or null for "and above". */
  max: number | null;
  unitPrice: number;
};

export type ProductItem = {
  name: string;
  quantity: number;
  /** e.g. "75 g approx", "35 ml" — exactly as stated by Sacred Basil. */
  size?: string;
  note?: string;
};

export type ProductVariant = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  /** Public image paths, first is the primary. */
  images: string[];
  contents: ProductItem[];
  packaging: string;
  dimensions?: string;
  variants?: ProductVariant[];
  /** Quantity-based pricing, ascending by `min`. */
  tiers: PriceTier[];
  /** Quantity from which orders become bespoke and are quoted directly. */
  bespokeFrom?: number;
  customisation?: string;
  /** Units available; null means made to order. */
  stock: number | null;
  status: "active" | "draft";
  featured: boolean;
  sortOrder: number;
};

export type CartLine = {
  productId: string;
  variantId?: string;
  quantity: number;
};
