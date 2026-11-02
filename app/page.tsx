import { getProducts } from "@/lib/catalog/repository";
import { formatINR, startingPrice } from "@/lib/catalog/pricing";
import { studioRange } from "@/data/studio";
import { HeroSlides } from "@/components/home/HeroSlides";
import { BrandStatement, GridHeading, SplitTiles, TileGrid, WideBanner } from "@/components/sections/Blocks";

/** Studio pieces shown on the home page (the rest live on /collections). */
const HOME_STUDIO = ["aromatic-ubtan", "scented-candle-lavender", "rose-candle-tin", "scented-candle-mahogany"];

/**
 * Home, v4. Every photograph is of a real Sacred Basil product and appears
 * once on the page (docs/REVAMP-PLAN.md).
 */
export default async function HomePage() {
  const products = await getProducts();

  const giftSets = products.map((p) => ({
    href: `/collections/${p.slug}`,
    name: p.name.replace(/^The /, ""),
    image: p.images[0],
    alt: p.name,
    meta: `From ${formatINR(startingPrice(p))}`,
  }));

  const studio = HOME_STUDIO.flatMap((id) => studioRange.filter((s) => s.id === id)).map((s) => ({
    href: `/contact?product=${encodeURIComponent(s.name)}`,
    name: s.name,
    image: s.images[0],
    alt: s.name,
    meta: "Enquire",
  }));

  return (
    <>
      <h1 className="sr-only">Sacred Basil: handcrafted Ayurvedic wellness gifts</h1>
      <HeroSlides />

      <GridHeading
        title="The Diwali Gifting Collection"
        text="Handcrafted gift sets, finished by hand in Pune."
        href="/collections#gift-sets"
        cta="Shop all gift sets"
      />
      <TileGrid tiles={giftSets} priority />

      <WideBanner
        image="/images/v6/luxe-dark-wide.webp"
        alt="The Sacred Basil Luxe Bath & Body Care Kit open: body scrub, face scrub, scented candle, artisanal soap and body oil"
        title="The Luxe Bath & Body Care Kit"
        text="Five handcrafted pieces in a chocolate and gold-foil box."
        cta="Discover the kit"
        href="/collections/luxe-bath-body-care-kit"
        tone="dark"
        align="right"
        position="25% 50%"
      />

      <SplitTiles
        tiles={[
          {
            href: "/collections#studio",
            label: "Bath & body",
            image: "/images/v6/st-bath-salt.webp",
            alt: "Sacred Basil Relaxing Bath Salt, Rose Valley",
          },
          {
            href: "/collections#studio",
            label: "Candles & home",
            image: "/images/v6/st-unwind.webp",
            alt: "The Sacred Basil Unwind candle in Oudh Tabac, in a rose-gold tin",
          },
        ]}
      />

      <GridHeading
        title="From our studio"
        text="Made by hand in small batches. Available on enquiry."
        href="/collections#studio"
        cta="See the studio range"
      />
      <TileGrid tiles={studio} />

      <BrandStatement />

      <WideBanner
        image="/images/v6/group-wide.webp"
        alt="The four Sacred Basil gift boxes: the Luxe kit, the Tranquil and Serenity boxes and the Festive Ritual box"
        title="Gifting, elevated"
        text="Premium gift boxes for Diwali, celebrations and corporate gifting. The more you gift, the less each one costs."
        cta="Discover gift sets"
        href="/collections#gift-sets"
        position="80% 50%"
        scrim={false}
      />

      <WideBanner
        image="/images/v6/corporate-hero.webp"
        alt="Rows of Sacred Basil Luxe gift boxes on a long table, prepared for a corporate order"
        title="Corporate gifting"
        text="Curated sets for teams and clients, with bulk pricing and bespoke options from 100 kits."
        cta="Request a quote"
        href="/corporate-gifting#enquire"
        position="60% 50%"
        tone="dark"
      />
    </>
  );
}
