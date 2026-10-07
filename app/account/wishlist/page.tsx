import type { Metadata } from "next";
import Link from "next/link";
import { getProductsByIds } from "@/lib/catalog/repository";
import { formatINR, startingPrice } from "@/lib/catalog/pricing";
import { ProductThumb } from "@/components/cart/ProductThumb";
import { AccountUnavailable } from "../AccountUnavailable";
import { removeFromWishlist } from "../actions";
import { requireUser } from "../session";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await requireUser("/account/wishlist");
  if (!session) return <AccountUnavailable />;

  const { data } = await session.supabase
    .from("wishlist_items")
    .select("product_id, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  const ids = (data ?? []).map((r: { product_id: string }) => r.product_id);
  const products = ids.length ? await getProductsByIds(ids) : [];
  const ordered = ids.map((id) => products.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <div>
      <h1 className="display-section mb-14 text-chocolate">Wishlist</h1>
      {ordered.length === 0 ? (
        <p className="text-cocoa/70">
          Nothing saved yet. Tap the heart on any kit to keep it here.{" "}
          <Link href="/collections" className="underline underline-offset-4">
            Explore the collections
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((p) => (
            <li key={p.id}>
              <Link href={`/collections/${p.slug}`} className="group block">
                <ProductThumb src={p.images[0]} alt={p.name} className="aspect-[4/5] w-full" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                <p className="mt-5 font-display text-2xl text-chocolate group-hover:underline">{p.name}</p>
                <p className="mt-1 text-sm text-cocoa/65">From {formatINR(startingPrice(p))}</p>
              </Link>
              <form action={removeFromWishlist} className="mt-3">
                <input type="hidden" name="product_id" value={p.id} />
                <button type="submit" className="eyebrow text-cocoa/60 hover:text-chocolate" aria-label={`Remove ${p.name} from wishlist`}>
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
