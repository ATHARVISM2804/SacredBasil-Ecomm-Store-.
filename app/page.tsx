import { getProducts } from "@/lib/catalog/repository";
import { formatINR, startingPrice } from "@/lib/catalog/pricing";
import { studioRange } from "@/data/studio";
import { HeroFilm } from "@/components/home/HeroFilm";
import { FilmBanner } from "@/components/sections/FilmBanner";
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
      <HeroFilm />

      <GridHeading
        title="The Diwali Gifting Collection"
        text="Handcrafted gift sets, finished by hand in Pune."
        href="/collections#gift-sets"
        cta="Shop all gift sets"
      />
      <TileGrid tiles={giftSets} priority />

      <FilmBanner
        name="luxe"
        label="The Sacred Basil Luxe Bath & Body Care Kit: body scrub, face scrub, body oil and candle"
        title="The Luxe Bath & Body Care Kit"
        text="Five handcrafted pieces in a chocolate and gold-foil box."
        cta="Discover the kit"
        href="/collections/luxe-bath-body-care-kit"
      />

      <SplitTiles
        tiles={[
          {
            href: "/collections#studio",
            label: "Bath & body",
            image: "/images/products/bath-salt-rose-valley.webp",
            alt: "Sacred Basil Relaxing Bath Salt, Rose Valley, on travertine with rose buds",
          },
          {
            href: "/collections#studio",
            label: "Candles & home",
            image: "/images/products/unwind-candle-tin-oudh-tabac-lit.webp",
            alt: "The Sacred Basil Unwind candle in Oudh Tabac, lit, in a rose-gold tin",
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

      <FilmBanner
        name="gifts"
        label="Sacred Basil gift boxes"
        title="Gifting, elevated"
        text="Premium gift boxes for Diwali, celebrations and corporate gifting. The more you gift, the less each one costs."
        cta="Discover gift sets"
        href="/collections#gift-sets"
      />

      <WideBanner
        image="/images/products/festive-orders-production-table.webp"
        alt="A Sacred Basil corporate Diwali order: artisanal soaps, body oils, ubtan and festive boxes ready to pack"
        title="Corporate gifting"
        text="Curated sets for teams and clients, with bulk pricing and bespoke options from 100 kits."
        cta="Request a quote"
        href="/corporate-gifting#enquire"
        position="60% 50%"
      />
    </>
  );
}
