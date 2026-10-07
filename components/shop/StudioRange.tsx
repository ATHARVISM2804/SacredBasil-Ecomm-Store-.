import Image from "next/image";
import Link from "next/link";
import { studioRange } from "@/data/studio";
import { Ornament } from "@/components/ui/Ornament";

/** The wider handmade range, available on enquiry. */
export function StudioRange() {
  return (
    <section id="studio" aria-labelledby="studio-title" className="section-y scroll-mt-24 bg-cream/60">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <Ornament />
          <p className="eyebrow mt-6 text-gold">From our studio</p>
          <h2 id="studio-title" className="display-section mt-4 text-chocolate">
            Made by hand, available on enquiry.
          </h2>
          <p className="lede mx-auto mt-6 text-cocoa/70">
            Candles, bath salts, soaps and favours, made in small batches. Ask us about availability, quantities and
            custom orders.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:mt-20 md:grid-cols-3 lg:gap-x-8">
          {studioRange.map((item, i) => (
            <li key={item.id} data-reveal="fade" data-reveal-delay={String((i % 3) * 0.06)}>
              <article className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-cream">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-4 font-display text-[1.3rem] leading-tight text-chocolate">
                  <Link
                    href={`/contact?product=${encodeURIComponent(item.name)}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-1.5 text-[0.86rem] leading-relaxed text-cocoa/65">{item.detail}</p>
                <p className="eyebrow mt-3 text-gold">Enquire</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
