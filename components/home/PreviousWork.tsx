import Image from "next/image";
import { previousWork } from "@/data/catalog";
import { site } from "@/data/site";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Ornament } from "@/components/ui/Ornament";
import { cn } from "@/lib/utils";

/** Real photographs from past orders, closing with the invitation to order. */
export function PreviousWork() {
  const picks = [0, 2, 3, 6, 8, 11].map((i) => previousWork[i]);

  return (
    <section aria-labelledby="work-title" className="section-y bg-ivory">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <Ornament />
          <p className="eyebrow mt-6 text-gold">Our previous work</p>
          <h2 id="work-title" className="display-section mt-4 text-chocolate">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
              <span className="block">Crafted with care. Loved by many.</span>
            </span>
          </h2>
          <p className="lede mx-auto mt-6 text-cocoa/70" data-reveal="fade">
            Diwali 2025 marked the beginning of our journey: 60 kits as a pilot, along with customised favours for
            birthdays, baby showers and naming ceremonies.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-3 md:gap-5">
          {picks.map((w, i) => (
            <li
              key={w.src}
              className={cn("relative overflow-hidden rounded-[3px]", i === 0 || i === 4 ? "aspect-[4/5] md:row-span-2 md:aspect-auto" : "aspect-[4/3]")}
              data-reveal="image"
              data-reveal-delay={String((i % 3) * 0.08)}
            >
              <div data-reveal-media className="absolute inset-0">
                <Image src={w.src} alt={w.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-20 flex flex-col items-center text-center">
          <Logo variant="monogram" className="h-12 text-chocolate" />
          <p className="mt-6 font-display text-[clamp(1.6rem,3vw,2.4rem)] italic text-chocolate">{site.statement}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <ButtonLink href="/collections">Shop the collection</ButtonLink>
            <ButtonLink href="/contact" variant="text" className="text-chocolate">
              Talk to us
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
