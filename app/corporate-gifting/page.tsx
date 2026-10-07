import type { Metadata } from "next";
import Image from "next/image";
import { Building2, ClipboardList, Gift, Handshake, MapPin, Package, Sparkles, Truck } from "lucide-react";
import { getProducts } from "@/lib/catalog/repository";
import { formatINR, tierLabel } from "@/lib/catalog/pricing";
import { corporateCustomisation, orderTerms } from "@/data/site";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { ImageHero } from "@/components/sections/ImageHero";

export const metadata: Metadata = {
  title: "Corporate Wellness Gifting",
  description:
    "Handcrafted Ayurvedic-inspired Diwali gifts for clients, teams and business associates. Bulk pricing from 10 kits, bespoke branding from 100 kits, delivered across India.",
  alternates: { canonical: "/corporate-gifting" },
};

const audiences = [
  { icon: Building2, label: "IT companies and corporate offices" },
  { icon: Building2, label: "Real estate firms and business houses" },
  { icon: Handshake, label: "Client and employee gifting" },
  { icon: Gift, label: "Festive appreciation with a personal touch" },
  { icon: Sparkles, label: "Premium Ayurvedic self-care with lasting impact" },
];

const terms = [
  { icon: ClipboardList, title: "Commercial terms", text: orderTerms.bulkPayment },
  { icon: Package, title: "Production timeline", text: orderTerms.productionTime },
  { icon: Truck, title: "All-India delivery", text: orderTerms.shipping },
  { icon: MapPin, title: "Delivery arrangements", text: orderTerms.delivery },
];

export default async function CorporateGiftingPage() {
  const products = await getProducts();

  return (
    <>
      <ImageHero
        tone="dark"
        label="Corporate wellness gifting"
        title="Thoughtful gifting, made for teams."
        intro="Thoughtfully curated Diwali wellness gifts for clients, teams and business associates. Handcrafted Ayurvedic-inspired self-care with premium, eco-conscious presentation."
        image="/images/site/hero-corporate.webp"
        alt="Rows of chocolate Sacred Basil Luxe gift boxes tied with gold ribbon on a walnut table, prepared for a corporate order"
      >
        <ButtonLink href="#enquire" variant="light">
          Request a quote
        </ButtonLink>
        <ButtonLink href="#pricing" variant="text" className="text-ivory">
          See bulk pricing
        </ButtonLink>
      </ImageHero>

      <section aria-labelledby="made-personal" className="section-y bg-ivory">
        <div className="shell text-center">
          <Ornament />
          <h2 id="made-personal" className="display-section mt-6 text-chocolate">
            Corporate gifting, made personal.
          </h2>
          <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
            {audiences.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-4 rounded-[3px] border border-[var(--line)] bg-cream/40 px-4 py-7 text-[0.9rem] leading-snug text-cocoa/80"
                data-reveal="fade"
              >
                <Icon aria-hidden className="size-7 text-gold" strokeWidth={1} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pricing" aria-labelledby="pricing-title" className="section-y scroll-mt-16 bg-cream/60">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold">Bulk pricing</p>
            <h2 id="pricing-title" className="display-section mt-4 text-chocolate">
              The more you gift, the less each costs.
            </h2>
            <p className="lede mx-auto mt-6 text-cocoa/70">Prices per set, exclusive of shipping.</p>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex gap-5 rounded-[3px] border border-[var(--line)] bg-ivory p-5 sm:p-6"
                data-reveal="fade"
              >
                <div className="relative hidden aspect-square w-32 shrink-0 overflow-hidden rounded-[2px] sm:block">
                  <Image src={p.images[0]} alt="" fill sizes="128px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl text-chocolate">{p.name}</h3>
                  <p className="mt-1 text-[0.85rem] text-cocoa/60">{p.contents.map((c) => c.name).join(", ")}</p>
                  <table className="mt-4 w-full text-[0.9rem]">
                    <caption className="sr-only">Bulk prices for {p.name}</caption>
                    <tbody>
                      {p.tiers.map((t) => (
                        <tr key={t.min} className="border-t border-[var(--line)]">
                          <th scope="row" className="py-2 text-left font-normal text-cocoa/70">
                            {tierLabel(t)} sets
                          </th>
                          <td className="py-2 text-right font-display text-lg text-chocolate">
                            {formatINR(t.unitPrice)}
                          </td>
                        </tr>
                      ))}
                      {p.bespokeFrom && (
                        <tr className="border-t border-[var(--line)]">
                          <th scope="row" className="py-2 text-left font-normal text-cocoa/70">
                            {p.bespokeFrom}+ sets
                          </th>
                          <td className="py-2 text-right text-[0.85rem] text-cocoa/65">Open for discussion</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="bespoke-title" className="section-y bg-chocolate text-ivory">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-champagne">100+ kits</p>
            <h2 id="bespoke-title" className="display-section mt-4">
              Bespoke corporate gifting.
            </h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {corporateCustomisation.map((c) => (
                <li
                  key={c}
                  className="rounded-[2px] border border-[var(--line-light)] px-3.5 py-2 text-[0.88rem] text-ivory/85"
                >
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.95rem] italic text-ivory/65">
              Pricing for customised orders varies with requirements and quantity, and is open for direct discussion.
            </p>
          </div>
          <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {terms.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <dt className="flex items-center gap-3">
                  <Icon aria-hidden className="size-5 text-champagne" strokeWidth={1.25} />
                  <span className="eyebrow text-champagne">{title}</span>
                </dt>
                <dd className="mt-3 text-[0.92rem] leading-relaxed text-ivory/75">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="enquire" aria-labelledby="enquire-title" className="section-y scroll-mt-16 bg-ivory">
        <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Ornament className="justify-start" />
            <p className="eyebrow mt-6 text-gold">Reserve your festive production slot</p>
            <h2 id="enquire-title" className="display-section mt-4 text-chocolate">
              Request a quote.
            </h2>
            <p className="lede mt-6 text-cocoa/72">
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
