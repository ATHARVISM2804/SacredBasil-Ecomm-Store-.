import Image from "next/image";
import { FlaskConicalOff, Leaf, Rabbit, Sprout } from "lucide-react";
import { brandValues, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";

const icons = [Leaf, Rabbit, FlaskConicalOff, Sprout];

export function StoryValues() {
  return (
    <section aria-labelledby="story-title" className="section-y bg-cream/60">
      <div className="shell grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[3px]" data-reveal="image">
            <div data-reveal-media className="absolute inset-0">
              <Image
                src="/images/products/founders.webp"
                alt="Sacred Basil founders Parita and Ananya"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_15%]"
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <Ornament className="justify-start" />
          <p className="eyebrow mt-6 text-gold">About us</p>
          <h2 id="story-title" className="display-section mt-4 text-chocolate">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
              <span className="block">Rooted in purpose. Driven by care.</span>
            </span>
          </h2>
          <p className="lede mt-6 text-cocoa/75" data-reveal="fade">
            Sacred Basil is a doctor-led brand where authenticity, quality and intention come first. Led by Ayurveda
            practitioner Parita and dentist Ananya, we bring together our knowledge and passion to create
            Ayurvedic-based products that truly care for your well-being.
          </p>
          <blockquote className="mt-8 border-l border-gold pl-5 font-display text-[1.45rem] italic leading-snug text-chocolate" data-reveal="fade">
            {site.aim}
          </blockquote>
          <ButtonLink href="/our-story" variant="text" className="mt-8 text-chocolate">
            Read our story
          </ButtonLink>
        </div>
      </div>

      <ul className="shell mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-[var(--line)] pt-14 md:grid-cols-4">
        {brandValues.map((v, i) => {
          const Icon = icons[i];
          return (
            <li key={v.title} className="text-center" data-reveal="fade" data-reveal-delay={String(i * 0.08)}>
              <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold/50 text-gold">
                <Icon aria-hidden className="size-6" strokeWidth={1.1} />
              </span>
              <h3 className="eyebrow mt-5 text-chocolate">{v.title}</h3>
              <p className="mx-auto mt-2 max-w-[15rem] text-[0.88rem] leading-relaxed text-cocoa/65">{v.text}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
