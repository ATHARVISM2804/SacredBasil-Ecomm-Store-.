import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog/repository";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["/", "/collections", "/corporate-gifting", "/our-story", "/contact", "/shipping", "/returns", "/privacy", "/terms"];
  const products = await getProducts();
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...products.map((p) => ({
      url: absoluteUrl(`/collections/${p.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
