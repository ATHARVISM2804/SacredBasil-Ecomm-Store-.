import Image from "next/image";
import type { Product } from "@/lib/catalog/types";
import { formatINR, tierLabel } from "@/lib/catalog/pricing";
import { ButtonLink } from "@/components/ui/Button";
import { Lotus, Ornament } from "@/components/ui/Ornament";

/** The signature kit, presented like the open magnetic box itself. */
export function LuxeSpotlight({ product: p }: { product: Product }) {
  const [first, ...bulk] = p.tiers;

  return (
    <section aria-labelledby="luxe-title" className="relative overflow-hidden bg-chocolate text-ivory">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_30%_40%,rgb(220_194_151/0.12),transparent_70%)]"
      />
      <div className="shell section-y relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <div className="relative mx-auto aspect-[3/4] max-w-lg overflow-hidden rounded-[3px]" data-reveal="image">
            <div data-reveal-media className="absolute inset-0">
              <Image
                src="/images/site/luxe-spotlight.webp"
                alt="The Luxe Bath & Body Care Kit standing open on a travertine plinth: body scrub, face scrub, body oil, scented candle and artisanal soap in the cream insert"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <Ornament tone="champagne" className="justify-start" />
          <p className="eyebrow mt-6 text-champagne">Our signature kit</p>
          <h2 id="luxe-title" className="display-section mt-4">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
              <span className="block">{p.name.replace(/^The /, "")}</span>
            </span>
          </h2>
          <p className="mt-3 font-display text-xl italic text-champagne/90">{p.tagline}</p>
          <p className="lede mt-6 text-ivory/75" data-reveal="fade">
            {p.description}
          </p>

          <p className="eyebrow mt-10 text-champagne/80">Contains</p>
          <ul className="mt-4 divide-y divide-[var(--line-light)] border-y border-[var(--line-light)]">
            {p.contents.map((c) => (
              <li key={c.name} className="flex items-start gap-4 py-3.5" data-reveal="fade">
                <Lotus className="mt-1 h-3 w-5 shrink-0 text-champagne" />
                <div className="flex-1">
                  <p className="text-ivory">
                    {c.size && <span className="text-champagne">{c.size} </span>}
                    {c.name}
                  </p>
                  {c.note && <p className="text-[0.85rem] text-ivory/60">{c.note}</p>}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <p className="font-display text-4xl text-ivory">{formatINR(first.unitPrice)}</p>
            <p className="text-[0.9rem] text-ivory/65">
              {bulk.map((t) => `${formatINR(t.unitPrice)} each for ${tierLabel(t)}`).join(" · ")}
            </p>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
            <ButtonLink href={`/collections/${p.slug}`} variant="light">
              Shop the kit
            </ButtonLink>
            <ButtonLink href="/corporate-gifting" variant="text" className="text-ivory">
              Gift in bulk
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
