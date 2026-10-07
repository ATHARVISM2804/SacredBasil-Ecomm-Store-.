import "server-only";
import { seedProducts } from "@/data/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { Product } from "./types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  short_description: string;
  description: string;
  images: string[];
  contents: Product["contents"];
  packaging: string;
  dimensions: string | null;
  variants: Product["variants"] | null;
  tiers: Product["tiers"];
  bespoke_from: number | null;
  customisation: string | null;
  stock: number | null;
  status: Product["status"];
  featured: boolean;
  sort_order: number;
};

export const productFromRow = (r: ProductRow): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  tagline: r.tagline,
  shortDescription: r.short_description,
  description: r.description,
  images: r.images,
  contents: r.contents,
  packaging: r.packaging,
  dimensions: r.dimensions ?? undefined,
  variants: r.variants ?? undefined,
  tiers: [...r.tiers].sort((a, b) => a.min - b.min),
  bespokeFrom: r.bespoke_from ?? undefined,
  customisation: r.customisation ?? undefined,
  stock: r.stock,
  status: r.status,
  featured: r.featured,
  sortOrder: r.sort_order,
});

/**
 * Active products, ordered for display. Reads Supabase when configured,
 * otherwise the brochure seed so the storefront always renders.
 */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return seedProducts.filter((p) => p.status === "active");
  const { data, error } = await createSupabasePublicClient()
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("sort_order");
  if (error) throw new Error(`Could not load products: ${error.message}`);
  return (data as ProductRow[]).map(productFromRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => ids.includes(p.id));
}
