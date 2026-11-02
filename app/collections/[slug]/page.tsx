import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Plus } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/catalog/repository";
import { formatINR, lowestPrice, startingPrice } from "@/lib/catalog/pricing";
import { orderTerms, site, whatsappLink } from "@/data/site";
import { SocialIcon } from "@/components/footer/SocialLinks";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { StickyBuy } from "@/components/shop/StickyBuy";
import { FestiveCutoff } from "@/components/shop/FestiveCutoff";
import { AddToCart } from "@/components/cart/AddToCart";
import { WishlistButton } from "@/components/cart/WishlistButton";
import { TileGrid } from "@/components/sections/Blocks";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

/** Dark studio photograph for the feature band under each product. */
const mood: Record<string, { image: string; alt: string }> = {
  "luxe-bath-body-care-kit": { image: "/images/v6/luxe-dark-45.webp", alt: "The Luxe kit open in the studio" },
  "tranquil-box": { image: "/images/v6/tranquil-wide.webp", alt: "The Tranquil Box, closed and open, in the studio" },
  "serenity-box": { image: "/images/v6/serenity-wide.webp", alt: "The Serenity Box, closed and open, in the studio" },
  "festive-ritual": { image: "/images/v6/festive-wide.webp", alt: "The Festive Ritual box and organza pouch in the studio" },
};

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.shortDescription} ${p.description}`.slice(0, 300),
    alternates: { canonical: `/collections/${p.slug}` },
    openGraph: {
      title: `${p.name} — Sacred Basil`,
      description: p.shortDescription,
      url: `/collections/${p.slug}`,
      images: [{ url: p.images[0], alt: p.name }],
    },
  };
}

/** Product page, v4: Skandinavisk layout (docs/REVAMP-PLAN.md §8.3). */
export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();

  const all = await getProducts();
  const others = all.filter((o) => o.id !== p.id);
  const from = startingPrice(p);
  const soldOut = p.stock !== null && p.stock <= 0;
  const feature = mood[p.id] ?? mood["luxe-bath-body-care-kit"];
  const pieces = p.contents.reduce((n, c) => n + c.quantity, 0);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map((i) => absoluteUrl(i)),
    brand: { "@type": "Brand", name: "Sacred Basil" },
    url: absoluteUrl(`/collections/${p.slug}`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: lowestPrice(p),
      highPrice: from,
      availability: "https://schema.org/InStock",
    },
  };

  const bullets = [
    p.shortDescription,
    `${pieces} handcrafted pieces: ${p.contents.map((c) => c.name).join(", ")}`,
    p.packaging,
    "Handmade in small batches in Pune",
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd).replace(/</g, "\\u003c") }}
      />

      <section className="grid lg:grid-cols-2">
        <div className="min-w-0">
          <div className="lg:sticky lg:top-[6.5rem]">
            <ProductGallery images={p.images} name={p.name} />
          </div>
        </div>

        <div className="min-w-0 px-[var(--gutter)] py-10 lg:px-14 lg:py-14 xl:px-20">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[0.82rem] text-cocoa/55">
            <Link href="/collections" className="py-2.5 hover:underline">
              Shop
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{p.name.replace(/^The /, "")}</span>
          </nav>

          <p className="mt-8 text-[1rem] text-cocoa/60">{p.tagline}</p>
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,3vw,2.9rem)] font-medium leading-[1.05] text-chocolate">{p.name}</h1>

          <ul className="mt-7 space-y-2.5 text-[0.98rem] leading-relaxed text-cocoa/85">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-chocolate" />
                {b}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[1.35rem] tabular-nums text-chocolate">{formatINR(from)}</p>
          <p className="mt-1 text-[0.85rem] text-cocoa/60">Per set, exclusive of shipping.</p>
          <FestiveCutoff className="mt-5" />

          <div id="buy" className="mt-8">
            <AddToCart product={p} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <WishlistButton productId={p.id} productName={p.name} withLabel />
              <a
                href={whatsappLink(`Hello Sacred Basil, I have a question about ${p.name}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 text-[0.9rem] text-chocolate underline-offset-4 hover:underline"
              >
                <SocialIcon network="whatsapp" className="size-[1.1rem]" />
                {site.orderOnWhatsApp ? "Ask a question" : "Ask us on WhatsApp"}
              </a>
            </div>
          </div>

          <ul className="mt-8 space-y-2.5 text-[0.92rem]">
            {["Handcrafted to order, ready in 7–8 business days", "Premium gift-ready packaging", site.orderOnWhatsApp ? "Order and pay directly on WhatsApp" : "Secure payments"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check aria-hidden className="size-4 text-chocolate" strokeWidth={1.5} />
                  {t}
                </li>
              ),
            )}
          </ul>

          <div className="mt-10 border-t border-[var(--line)]">
            <Detail title="What's inside" open>
              <ul className="space-y-2">
                {p.contents.map((c) => (
                  <li key={c.name} className="flex justify-between gap-4">
                    <span>
                      {c.quantity > 1 && `${c.quantity} × `}
                      {c.name}
                      {c.note && <span className="text-cocoa/55">: {c.note}</span>}
                    </span>
                    {c.size && <span className="shrink-0 text-cocoa/60">{c.size}</span>}
                  </li>
                ))}
              </ul>
            </Detail>
            <Detail title="Packaging">
              <p>{p.packaging}</p>
              {p.dimensions && <p className="mt-2">Box size: {p.dimensions}</p>}
            </Detail>
            <Detail title="Production & delivery">
              <p>{orderTerms.productionTime}</p>
              <p className="mt-2">{orderTerms.shipping}</p>
              <p className="mt-2">{orderTerms.delivery}</p>
            </Detail>
            {p.customisation && (
              <Detail title="Corporate & bulk orders">
                <p>
                  {p.bespokeFrom ? `For ${p.bespokeFrom}+ sets: ` : ""}
                  {p.customisation}
                </p>
                <p className="mt-2">{orderTerms.bulkPayment}</p>
                <Link
                  href={`/corporate-gifting?collection=${p.slug}#enquire`}
                  className="mt-1 inline-block py-2 text-chocolate underline underline-offset-4"
                >
                  Request a corporate quote
                </Link>
              </Detail>
            )}
          </div>
        </div>
      </section>

      {/* Feature band: dark studio photograph, the story, a packshot */}
      <section className="grid bg-chocolate text-ivory md:grid-cols-3">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[28rem]">
          <Image src={feature.image} alt={feature.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center px-[var(--gutter)] py-14 md:px-10 lg:px-14">
          <p className="text-[0.85rem] uppercase tracking-[0.12em] text-champagne">The details</p>
          <p className="mt-4 text-[1.25rem] leading-snug">{p.description}</p>
          <p className="mt-6 text-[0.95rem] text-ivory/70">
            Ayurvedic-inspired, free from harsh chemicals, and finished by hand by our doctor-led team.
          </p>
        </div>
        <div className="relative hidden aspect-auto min-h-[28rem] bg-[#f3f1ee] md:block">
          <Image
            src={p.images[1] ?? p.images[0]}
            alt=""
            fill
            sizes="33vw"
            className="object-cover"
          />
        </div>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="more-title">
          <h2 id="more-title" className="display-section px-[var(--gutter)] pb-10 pt-16 text-center md:pt-20">
            You may also like
          </h2>
          <TileGrid
            cols={others.length === 3 ? 3 : 4}
            tiles={others.map((o) => ({
              href: `/collections/${o.slug}`,
              name: o.name.replace(/^The /, ""),
              image: o.images[0],
              hoverImage: o.images[1],
              alt: o.name,
              meta: `From ${formatINR(startingPrice(o))}`,
            }))}
          />
        </section>
      )}

      <StickyBuy
        productId={p.id}
        slug={p.slug}
        variantId={p.variants?.[0]?.id}
        variantName={p.variants?.[0]?.name}
        name={p.name}
        image={p.images[0]}
        price={from}
        soldOut={soldOut}
      />
    </>
  );
}

function Detail({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="group border-b border-[var(--line)]" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[0.98rem] text-chocolate">{title}</span>
        <Plus aria-hidden className="size-4 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.25} />
      </summary>
      <div className="pb-6 text-[0.93rem] leading-relaxed text-cocoa/80">{children}</div>
    </details>
  );
}
