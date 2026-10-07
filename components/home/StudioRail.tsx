"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { studioRange } from "@/data/studio";
import { ButtonLink } from "@/components/ui/Button";

/** Home: a scrolling rail of the handmade studio range (enquire-only). */
export function StudioRail() {
  const rail = useRef<HTMLUListElement>(null);

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 24) * 2, behavior: "smooth" });
  };

  return (
    <section aria-labelledby="studio-rail-title" className="section-y overflow-hidden bg-ivory">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow text-gold">From our studio</p>
            <h2 id="studio-rail-title" className="display-section mt-4 text-chocolate">
              <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
                <span className="block">Small-batch, made by hand.</span>
              </span>
            </h2>
            <p className="lede mt-5 text-cocoa/70" data-reveal="fade">
              Candles, bath salts, ubtan, soaps and favours. Available on enquiry, in any quantity.
            </p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous products"
              className="grid size-12 place-items-center rounded-full border border-[var(--line)] text-chocolate transition-colors hover:bg-chocolate hover:text-ivory"
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next products"
              className="grid size-12 place-items-center rounded-full border border-[var(--line)] text-chocolate transition-colors hover:bg-chocolate hover:text-ivory"
            >
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <ul
          ref={rail}
          className="no-scrollbar -mx-[var(--gutter)] mt-12 flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-6 overflow-x-auto px-[var(--gutter)] pb-2 md:mt-16"
        >
          {studioRange.map((item) => (
            <li key={item.id} className="w-[64vw] max-w-[19rem] shrink-0 snap-start md:w-[24vw] md:max-w-[21rem]">
              <article className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-cream">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 24vw, 64vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
                  />
                  {item.images[1] && (
                    <Image
                      src={item.images[1]}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 24vw, 64vw"
                      className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    />
                  )}
                </div>
                <h3 className="mt-5 font-display text-[1.35rem] leading-tight text-chocolate">
                  <Link
                    href={`/contact?product=${encodeURIComponent(item.name)}`}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[0.86rem] leading-relaxed text-cocoa/65">{item.detail}</p>
                <p className="eyebrow mt-3 flex items-center gap-2 text-gold">
                  Enquire
                  <ArrowRight className="size-3 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
                </p>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <ButtonLink href="/collections#studio" variant="text" className="text-chocolate">
            Explore the studio range
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
