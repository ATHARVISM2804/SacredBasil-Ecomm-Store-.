import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/catalog/repository";
import { formatINR, lowestPrice, startingPrice } from "@/lib/catalog/pricing";
import { orderTerms } from "@/data/site";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { PriceTiers } from "@/components/shop/PriceTiers";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCart } from "@/components/cart/AddToCart";
import { WishlistButton } from "@/components/cart/WishlistButton";
import { Lotus } from "@/components/ui/Ornament";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

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

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();

  const others = (await getProducts()).filter((o) => o.id !== p.id).slice(0, 3);
  const from = startingPrice(p);

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd).replace(/</g, "\\u003c") }}
      />
      <section className="bg-ivory pb-[var(--section-y)] pt-32 md:pt-40">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="eyebrow mb-8 flex items-center gap-3 text-cocoa/55">
            <Link href="/collections" className="link-underline pb-0.5">
              Shop
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-chocolate">
              {p.name.replace(/^The /, "")}
            </span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-7">
              <div className="lg:sticky lg:top-28">
                <ProductGallery images={p.images} name={p.name} />
              </div>
            </div>

            <div className="min-w-0 lg:col-span-5">
              <p className="eyebrow text-gold">{p.tagline}</p>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,4vw,3.6rem)] font-light leading-[1.05] text-chocolate">
                {p.name}
              </h1>
              <p className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-3xl text-chocolate">{formatINR(from)}</span>
                <span className="text-[0.85rem] text-cocoa/60">per set, exclusive of shipping</span>
              </p>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-cocoa/80">{p.description}</p>

              <div className="mt-8">
                <AddToCart product={p} />
                <div className="mt-4">
                  <WishlistButton productId={p.id} productName={p.name} withLabel />
                </div>
              </div>

              <div className="mt-10">
                <p className="eyebrow mb-4 text-cocoa/60">What&apos;s inside</p>
                <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                  {p.contents.map((c) => (
                    <li key={c.name} className="flex items-start gap-4 py-3.5">
                      <Lotus className="mt-1 h-3 w-5 shrink-0 text-gold" />
                      <div className="flex-1">
                        <p className="text-chocolate">
                          {c.quantity > 1 && `${c.quantity} × `}
                          {c.name}
                        </p>
                        {c.note && <p className="text-[0.85rem] text-cocoa/60">{c.note}</p>}
                      </div>
                      {c.size && <span className="shrink-0 text-[0.88rem] text-cocoa/65">{c.size}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <PriceTiers product={p} className="mt-10" />

              <div className="mt-10 border-t border-[var(--line)]">
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
                      className="link-underline mt-3 inline-block pb-0.5 text-chocolate"
                    >
                      Request a corporate quote
                    </Link>
                  </Detail>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section aria-labelledby="more-title" className="section-y border-t border-[var(--line)] bg-cream/50">
          <div className="shell">
            <h2 id="more-title" className="display-sub mb-12 text-chocolate md:mb-16">
              More from the collection
            </h2>
            <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <li key={o.id}>
                  <ProductCard product={o} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-[var(--line)]">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
        <span className="eyebrow text-chocolate">{title}</span>
        <Plus aria-hidden className="size-4 transition-transform duration-500 group-open:rotate-45" strokeWidth={1.25} />
      </summary>
      <div className="pb-6 text-[0.95rem] leading-relaxed text-cocoa/75">{children}</div>
    </details>
  );
}
