import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog/repository";
import { formatINR, lowestPrice, startingPrice } from "@/lib/catalog/pricing";
import { studioRange } from "@/data/studio";
import { CollectionHero, GridHeading, TileGrid, WideBanner } from "@/components/sections/Blocks";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop the Diwali Gifting Collection",
  description:
    "Handcrafted Ayurvedic-inspired gift sets from Sacred Basil: the Luxe Bath & Body Care Kit, Tranquil Box, Serenity Box and Festive Ritual Box. Bulk pricing for corporate gifting.",
  alternates: { canonical: "/collections" },
};

/** Shop listing, v4: packshot grids on white, as at Skandinavisk. */
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

  const giftSets = products.map((p) => ({
    href: `/collections/${p.slug}`,
    name: p.name.replace(/^The /, ""),
    image: p.images[0],
    hoverImage: p.images[1],
    alt: p.name,
    meta: `From ${formatINR(startingPrice(p))}`,
  }));

  const studio = studioRange.map((s) => ({
    href: `/contact?product=${encodeURIComponent(s.name)}`,
    name: s.name,
    image: s.images[0],
    hoverImage: s.images[1],
    alt: s.name,
    meta: "Enquire",
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd).replace(/</g, "\\u003c") }}
      />
      <CollectionHero
        image="/images/v5/lux-group.webp"
        alt="The Sacred Basil Luxe kit and its five pieces on a travertine plinth"
        title="The Diwali Gifting Collection"
        line="Handcrafted gift sets. The more you gift, the less each one costs."
      />

      <section id="gift-sets" aria-labelledby="sets-title" className="scroll-mt-28">
        <div className="px-[var(--gutter)] pb-10 pt-16 text-center md:pt-20">
          <h2 id="sets-title" className="display-section">
            Gift sets
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[1rem] text-cocoa/70">
            Finished by hand in Pune. Prices are per set, exclusive of shipping.
          </p>
        </div>
        <TileGrid tiles={giftSets} priority />
      </section>

      <section id="studio" aria-label="From our studio" className="scroll-mt-28">
        <GridHeading
          title="From our studio"
          text="Candles, bath salts, soaps and favours, made in small batches. Ask us about availability and custom orders."
        />
        <TileGrid tiles={studio} />
      </section>

      <WideBanner
        image="/images/v5/lux-box.webp"
        alt="The Sacred Basil Luxe gift box in chocolate and gold foil on travertine"
        title="Bespoke sets for 100+ kits"
        text="Custom logo, branding, packaging and labels for corporate and celebration orders."
        cta="Request a quote"
        href="/corporate-gifting#enquire"
        position="70% 50%"
      />
    </>
  );
}
