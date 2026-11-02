import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/catalog/repository";
import { formatINR, tierLabel } from "@/lib/catalog/pricing";
import { corporateCustomisation, orderTerms, whatsappLink } from "@/data/site";
import { SocialIcon } from "@/components/footer/SocialLinks";
import { previousWork } from "@/data/catalog";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { CollectionHero } from "@/components/sections/Blocks";

export const metadata: Metadata = {
  title: "Corporate Wellness Gifting",
  description:
    "Handcrafted Ayurvedic-inspired Diwali gifts for clients, teams and business associates. Bulk pricing from 10 kits, bespoke branding from 100 kits, delivered across India.",
  alternates: { canonical: "/corporate-gifting" },
};

const audiences = [
  "IT companies and corporate offices",
  "Real estate firms and business houses",
  "Client and employee gifting",
  "Festive appreciation",
];

const terms = [
  { title: "Commercial terms", text: orderTerms.bulkPayment },
  { title: "Production timeline", text: orderTerms.productionTime },
  { title: "All-India delivery", text: orderTerms.shipping },
  { title: "Delivery arrangements", text: orderTerms.delivery },
];

/** Real corporate orders for the gallery (indexes into previousWork). */
const WORK = [1, 3, 8, 11];

/** Corporate Gifting, v4. */
export default async function CorporateGiftingPage() {
  const products = await getProducts();

  return (
    <>
      <CollectionHero
        image="/images/v6/corporate-hero.webp"
        alt="Rows of Sacred Basil Luxe gift boxes on a long table, prepared for a corporate order"
        title="Corporate gifting"
        line="Handcrafted wellness gifts for clients, teams and business associates."
      />

      <section aria-labelledby="intro-title" className="px-[var(--gutter)] py-20 text-center md:py-28">
        <h2 id="intro-title" className="mx-auto max-w-3xl font-serif text-[clamp(1.6rem,2.7vw,2.4rem)] font-medium leading-snug text-chocolate">
          Thoughtfully curated Ayurvedic-inspired self-care, presented in premium, eco-conscious packaging and
          personalised for your brand.
        </h2>
        <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-3 text-[0.8rem] uppercase tracking-[0.14em] text-cocoa/60">
          {audiences.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="#enquire" className="btn btn-primary">
            Request a quote
          </Link>
          <Link href="#pricing" className="btn border border-chocolate text-chocolate hover:bg-chocolate hover:text-ivory">
            See bulk pricing
          </Link>
          <a
            href={whatsappLink("Hello Sacred Basil, I’d like to discuss a corporate gifting order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn gap-2.5 border border-chocolate text-chocolate hover:bg-chocolate hover:text-ivory"
          >
            <SocialIcon network="whatsapp" className="size-4" />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-28">
        <h2 id="pricing-title" className="display-section px-[var(--gutter)] pb-3 text-center text-chocolate">
          Bulk pricing
        </h2>
        <p className="pb-10 text-center text-cocoa/65">Prices per set, exclusive of shipping.</p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <li key={p.id} data-reveal="fade" data-reveal-delay={i * 0.08} className="pb-10">
              <Link href={`/collections/${p.slug}`} className="relative block aspect-[4/5] bg-cream">
                <Image src={p.images[0]} alt={p.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </Link>
              <div className="px-6 pt-5">
                <h3 className="text-center text-[1.05rem] text-chocolate">{p.name.replace(/^The /, "")}</h3>
                <table className="mx-auto mt-4 w-full max-w-[16rem] text-[0.9rem]">
                  <caption className="sr-only">Bulk prices for {p.name}</caption>
                  <tbody>
                    {p.tiers.map((t) => (
                      <tr key={t.min} className="border-t border-[var(--line)]">
                        <th scope="row" className="py-2 text-left font-normal text-cocoa/65">
                          {tierLabel(t)} sets
                        </th>
                        <td className="py-2 text-right tabular-nums text-chocolate">{formatINR(t.unitPrice)}</td>
                      </tr>
                    ))}
                    {p.bespokeFrom && (
                      <tr className="border-t border-[var(--line)]">
                        <th scope="row" className="py-2 text-left font-normal text-cocoa/65">
                          {p.bespokeFrom}+ sets
                        </th>
                        <td className="py-2 text-right text-[0.85rem] text-cocoa/60">On request</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="bespoke-title" className="grid bg-chocolate-deep text-ivory md:grid-cols-2">
        <div className="relative min-h-[24rem] md:min-h-[36rem]">
          <Image
            src={previousWork[6].src}
            alt={previousWork[6].alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div data-reveal="fade" className="flex flex-col justify-center px-[var(--gutter)] py-16 md:px-14 lg:px-20">
          <p className="text-[0.8rem] uppercase tracking-[0.18em] text-champagne">100+ kits</p>
          <h2 id="bespoke-title" className="display-section mt-4">
            Bespoke corporate gifting
          </h2>
          <ul className="mt-8 space-y-3 text-[1rem] text-ivory/80">
            {corporateCustomisation.map((c) => (
              <li key={c} className="flex items-center gap-3">
                <span aria-hidden className="size-1 rounded-full bg-champagne" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.95rem] text-ivory/60">
            Pricing for customised orders varies with requirements and quantity, and is open for direct discussion.
          </p>
        </div>
      </section>

      <section aria-labelledby="terms-title" className="px-[var(--gutter)] py-20 md:py-28">
        <h2 id="terms-title" className="display-section text-center text-chocolate">
          How it works
        </h2>
        <dl className="mx-auto mt-14 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {terms.map((t, i) => (
            <div key={t.title} data-reveal="fade" data-reveal-delay={i * 0.08} className="border-t border-gold/40 pt-6">
              <dt className="text-[1.05rem] text-chocolate">{t.title}</dt>
              <dd className="mt-2 text-[0.92rem] leading-relaxed text-cocoa/70">{t.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="work-title">
        <h2 id="work-title" className="display-section px-[var(--gutter)] pb-10 text-center text-chocolate">
          Previous orders
        </h2>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {WORK.map((i, n) => (
            <li key={previousWork[i].src} data-reveal="fade" data-reveal-delay={n * 0.08} className="relative aspect-[4/5]">
              <Image src={previousWork[i].src} alt={previousWork[i].alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </section>

      <section id="enquire" aria-labelledby="enquire-title" className="scroll-mt-28 bg-cream px-[var(--gutter)] py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="text-[0.8rem] uppercase tracking-[0.18em] text-gold">Reserve your festive slot</p>
            <h2 id="enquire-title" className="display-section mt-4 text-chocolate">
              Request a quote
            </h2>
            <p className="mt-6 text-[1rem] leading-relaxed text-cocoa/75">
              Handcrafted boxes are limited each festive season. Tell us the occasion and quantity and we will come back
              to you with a quote.
            </p>
          </div>
          <EnquiryForm kind="corporate" className="lg:col-span-7 lg:col-start-6" />
        </div>
      </section>
    </>
  );
}
