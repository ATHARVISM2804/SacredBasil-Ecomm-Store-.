import { getProducts } from "@/lib/catalog/repository";
import { loadShippingSetting } from "@/lib/payments/settings";
import type { CatalogResponse } from "@/lib/cart/types";

/** Active products (cart fields only) and the shipping policy, for the cart UI. */
export const revalidate = 60;

export async function GET() {
  try {
    const [products, shipping] = await Promise.all([getProducts(), loadShippingSetting()]);
    const body: CatalogResponse = {
      products: products.map(({ id, slug, name, images, variants, tiers, bespokeFrom, stock }) => ({
        id,
        slug,
        name,
        images: images.slice(0, 1),
        variants,
        tiers,
        bespokeFrom,
        stock,
      })),
      shipping,
    };
    return Response.json(body);
  } catch (error) {
    console.error("[api/catalog]", error);
    return Response.json({ reason: "failed" }, { status: 500 });
  }
}
