import type { Metadata } from "next";
import Image from "next/image";
import { getProducts } from "@/lib/catalog/repository";
import { lowestPrice, startingPrice } from "@/lib/catalog/pricing";
import { previousWork } from "@/data/catalog";
import { orderTerms } from "@/data/site";
import { ProductCard } from "@/components/shop/ProductCard";
import { StudioRange } from "@/components/shop/StudioRange";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop the Diwali Gifting Collection",
  description:
    "Handcrafted Ayurvedic-inspired gift sets from Sacred Basil: the Luxe Bath & Body Care Kit, Tranquil Box, Serenity Box and Festive Ritual Box. Bulk pricing for corporate gifting.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsPage() {
  const products = await getProducts();

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sacred Basil Diwali Gifting Collection",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/collections/${p.slug}`),
      item: {
        "@type": "Product",
        name: p.name,
        image: absoluteUrl(p.images[0]),
        brand: { "@type": "Brand", name: "Sacred Basil" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "INR",
          lowPrice: lowestPrice(p),
          highPrice: startingPrice(p),
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd).replace(/</g, "\\u003c") }}
      />
      <section className="bg-ivory pb-14 pt-40 text-center md:pt-48">
        <div className="shell">
          <Ornament />
          <p className="eyebrow mt-6 text-gold">The Diwali Gifting Collection</p>
          <h1 className="display-hero mx-auto mt-5 max-w-[16ch] text-chocolate">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
              <span className="block">Shop the collection</span>
            </span>
          </h1>
          <p className="lede mx-auto mt-6 text-cocoa/70" data-reveal="fade">
            Four handcrafted gift sets. The more you gift, the less each one costs. Prices are exclusive of shipping.
          </p>
        </div>
      </section>

      <section aria-label="Gift sets" className="bg-ivory pb-[var(--section-y)]">
        <ul className="shell grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:gap-x-10">
          {products.map((p, i) => (
            <li key={p.id} data-reveal="fade" data-reveal-delay={String((i % 2) * 0.08)}>
              <ProductCard product={p} headingLevel="h2" priority={i < 2} sizes="(min-width: 640px) 45vw, 100vw" />
            </li>
          ))}
        </ul>
      </section>

      <StudioRange />

      <section aria-labelledby="bulk-title" className="section-y bg-chocolate text-ivory">
        <div className="shell grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-champagne">Gifting in quantity</p>
            <h2 id="bulk-title" className="display-section mt-4">
              Bespoke sets for 100+ kits.
            </h2>
            <p className="lede mt-6 text-ivory/75">{orderTerms.bespoke}</p>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
              <ButtonLink href="/corporate-gifting#enquire" variant="light">
                Request a quote
              </ButtonLink>
              <ButtonLink href="/corporate-gifting" variant="text" className="text-ivory">
                Corporate gifting
              </ButtonLink>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-3 lg:col-span-5 lg:col-start-8">
            {[0, 6, 11].map((i) => (
              <li key={i} className="relative aspect-[3/4] overflow-hidden rounded-[3px]">
                <Image
                  src={previousWork[i].src}
                  alt={previousWork[i].alt}
                  fill
                  sizes="(min-width: 1024px) 14vw, 30vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
