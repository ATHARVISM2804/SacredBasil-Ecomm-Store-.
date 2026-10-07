import Image from "next/image";
import { Building2, Gift, Handshake, Sparkles } from "lucide-react";
import type { Product } from "@/lib/catalog/types";
import { corporateCustomisation, orderTerms } from "@/data/site";
import { formatINR, tierLabel } from "@/lib/catalog/pricing";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";

const audiences = [
  { icon: Building2, label: "IT companies and corporate offices" },
  { icon: Handshake, label: "Client and employee gifting" },
  { icon: Gift, label: "Festive appreciation with a personal touch" },
  { icon: Sparkles, label: "Ayurvedic self-care with lasting impact" },
];

const tierNames = ["Individual", "Boutique order", "Corporate order"];

export function CorporateBand({ product }: { product: Product }) {
  return (
    <section aria-labelledby="corporate-title" className="section-y bg-ivory">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Ornament className="justify-start" />
          <p className="eyebrow mt-6 text-gold">Corporate wellness gifting</p>
          <h2 id="corporate-title" className="display-section mt-4 text-chocolate">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
              <span className="block">Thoughtful. Meaningful. Memorable.</span>
            </span>
          </h2>
          <p className="lede mt-6 text-cocoa/75" data-reveal="fade">
            Thoughtfully curated Diwali wellness gifts for clients, teams and business associates: handcrafted
            Ayurvedic-inspired self-care with premium, eco-conscious presentation.
          </p>

          <ul className="mt-10 grid grid-cols-2 gap-3">
            {audiences.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-[3px] border border-[var(--line)] bg-cream/40 p-4 text-[0.88rem] leading-snug text-cocoa/80"
                data-reveal="fade"
              >
                <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.25} />
                {label}
              </li>
            ))}
          </ul>

          <div className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-[3px] lg:block" data-reveal="image">
            <div data-reveal-media className="absolute inset-0">
              <Image
                src="/images/products/festive-orders-production-table.webp"
                alt="Sacred Basil soaps, body oils, ubtan sachets and festive boxes laid out by hand for a corporate order"
                fill
                sizes="40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-[3px] border border-[var(--line)] bg-cream/50 p-6 sm:p-9" data-reveal="fade">
            <p className="eyebrow text-center text-gold">Bulk pricing matrix</p>
            <p className="mt-2 text-center font-display text-2xl text-chocolate">{product.name}</p>
            <div className="mt-7 overflow-hidden rounded-[3px] border border-[var(--line)]">
              <table className="w-full text-left text-[0.92rem]">
                <caption className="sr-only">Bulk pricing for {product.name}</caption>
                <thead className="bg-chocolate text-ivory">
                  <tr>
                    <th scope="col" className="eyebrow px-4 py-3.5 font-medium">Order</th>
                    <th scope="col" className="eyebrow px-4 py-3.5 font-medium">Quantity</th>
                    <th scope="col" className="eyebrow px-4 py-3.5 text-right font-medium">Price / kit</th>
                  </tr>
                </thead>
                <tbody>
                  {product.tiers.map((t, i) => (
                    <tr key={t.min} className="border-t border-[var(--line)] bg-ivory/70">
                      <td className="px-4 py-4 text-cocoa/85">{tierNames[i] ?? "Bulk"}</td>
                      <td className="px-4 py-4 text-cocoa/70">{tierLabel(t)} kits</td>
                      <td className="px-4 py-4 text-right font-display text-xl text-chocolate">
                        {formatINR(t.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 rounded-[3px] bg-chocolate p-6 text-ivory">
              <p className="font-display text-xl">100+ kits: bespoke corporate gifting</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {corporateCustomisation.map((c) => (
                  <li key={c} className="rounded-[2px] border border-[var(--line-light)] px-3 py-1.5 text-[0.82rem] text-ivory/85">
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.85rem] italic text-ivory/65">
                Pricing for customised orders varies with requirements and quantity, and is open for direct discussion.
              </p>
            </div>

            <dl className="mt-8 grid gap-5 text-[0.88rem] sm:grid-cols-3">
              <div>
                <dt className="eyebrow text-gold">Payment</dt>
                <dd className="mt-1.5 text-cocoa/75">50% advance, 50% before dispatch</dd>
              </div>
              <div>
                <dt className="eyebrow text-gold">Production</dt>
                <dd className="mt-1.5 text-cocoa/75">7–8 business days minimum</dd>
              </div>
              <div>
                <dt className="eyebrow text-gold">Delivery</dt>
                <dd className="mt-1.5 text-cocoa/75">Across India, shipping extra</dd>
              </div>
            </dl>
            <p className="sr-only">{orderTerms.delivery}</p>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
              <ButtonLink href="/corporate-gifting#enquire">Request a corporate quote</ButtonLink>
              <ButtonLink href="/corporate-gifting" variant="text" className="text-chocolate">
                All corporate sets
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
