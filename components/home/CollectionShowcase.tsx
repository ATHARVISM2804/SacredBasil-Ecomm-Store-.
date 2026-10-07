import type { Product } from "@/lib/catalog/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";

export function CollectionShowcase({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="collection-title" className="section-y bg-cream/60">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <Ornament />
          <p className="eyebrow mt-6 text-gold">The Diwali Gifting Collection</p>
          <h2 id="collection-title" className="display-section mt-4 text-chocolate">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
              <span className="block">Thoughtfully handcrafted. Elegantly gifted.</span>
            </span>
          </h2>
          <p className="lede mx-auto mt-6 text-cocoa/70" data-reveal="fade">
            Luxury bath, body and home fragrance, made by hand and boxed to be given.
          </p>
        </div>

        <ul className="no-scrollbar -mx-[var(--gutter)] mt-14 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-5 overflow-x-auto px-[var(--gutter)] pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-14 sm:overflow-visible sm:px-0 lg:grid-cols-4 md:mt-20">
          {products.map((p, i) => (
            <li
              key={p.id}
              data-reveal="fade"
              data-reveal-delay={String((i % 4) * 0.08)}
              className="w-[78vw] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <ProductCard product={p} />
            </li>
          ))}
        </ul>

        <div className="mt-14 text-center">
          <ButtonLink href="/collections" variant="text" className="text-chocolate">
            View the full collection
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
