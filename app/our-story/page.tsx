import type { Metadata } from "next";
import Image from "next/image";
import { FlaskConicalOff, Leaf, Rabbit, Sprout } from "lucide-react";
import { previousWork } from "@/data/catalog";
import { brandValues, founders, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Sacred Basil is a doctor-led brand from Pune, founded by Ayurveda practitioner Parita and dentist Ananya, making handcrafted Ayurvedic-inspired wellness gifts.",
  alternates: { canonical: "/our-story" },
};

const icons = [Leaf, Rabbit, FlaskConicalOff, Sprout];

export default function OurStoryPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ivory">
        <div className="grid min-h-[92svh] lg:grid-cols-[1.15fr_1fr]">
          <div className="shell order-2 flex flex-col justify-center pb-16 pt-10 lg:order-1 lg:max-w-none lg:pl-[max(var(--gutter),calc((100vw-1400px)/2+var(--gutter)))] lg:pr-16 lg:pt-40">
            <Ornament className="justify-start" />
            <p className="eyebrow mt-6 text-gold">About us</p>
            <h1 className="display-hero mt-5 text-chocolate">
              <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
                <span className="block">Rooted in purpose. Driven by care.</span>
              </span>
            </h1>
            <p className="lede mt-7 max-w-md text-cocoa/75" data-reveal="fade" data-reveal-delay="0.3">
              Sacred Basil is a doctor-led brand where authenticity, quality and intention come first.
            </p>
          </div>
          <div className="relative order-1 h-[58svh] lg:order-2 lg:h-auto">
            <Image
              src="/images/products/founders.webp"
              alt="Sacred Basil founders Parita and Ananya"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_15%]"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="aim-title" className="section-y bg-chocolate text-center text-ivory">
        <div className="shell">
          <Ornament tone="champagne" />
          <h2 id="aim-title" className="eyebrow mt-6 text-champagne">
            Our aim
          </h2>
          <p className="mx-auto mt-8 max-w-3xl font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-light italic leading-[1.25]">
            {site.aim}
          </p>
        </div>
      </section>

      <section aria-labelledby="founders-title" className="section-y bg-ivory">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-gold">The founders</p>
            <h2 id="founders-title" className="display-section mt-4 text-chocolate">
              Knowledge and passion, brought together.
            </h2>
            <p className="lede mt-6 text-cocoa/75">
              Led by Ayurveda practitioner Parita and dentist Ananya, we bring together our knowledge and passion to create
              Ayurvedic-based products that truly care for your well-being. We are committed to handcrafted, effective
              and safe formulations that blend the wisdom of Ayurveda with modern lifestyle needs.
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {founders.map((f) => (
              <li key={f.name} className="rounded-[3px] border border-[var(--line)] bg-cream/40 p-7" data-reveal="fade">
                <p className="font-display text-4xl text-chocolate">{f.name}</p>
                <p className="eyebrow mt-2 text-gold">{f.role}</p>
                <p className="mt-5 text-cocoa/75">{f.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="values-title" className="section-y bg-cream/60">
        <div className="shell">
          <h2 id="values-title" className="display-section text-center text-chocolate">
            Sustainable, earth-friendly and thoughtfully designed.
          </h2>
          <p className="lede mx-auto mt-6 text-center text-cocoa/70">
            Our products are as gentle on the planet as they are on you.
          </p>
          <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
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
        </div>
      </section>

      <section aria-labelledby="journey-title" className="section-y bg-ivory">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <Ornament />
            <p className="eyebrow mt-6 text-gold">Our beautiful beginning</p>
            <h2 id="journey-title" className="display-section mt-4 text-chocolate">
              Crafted with care. Loved by many.
            </h2>
            <p className="lede mx-auto mt-6 text-cocoa/72">
              Diwali 2025 marked the beginning of our journey. We created our first handcrafted wellness kits and
              thoughtful returns as a pilot, to understand what truly matters: quality, authenticity and the joy of
              giving. We sold 60 Diwali kits along with customised favours for birthdays, baby showers, naming
              ceremonies and other special occasions.
            </p>
          </div>
          <ul className="mt-14 columns-2 gap-3 md:columns-3 md:gap-5">
            {previousWork.map((w, i) => (
              <li key={w.src} className={cn("relative mb-3 break-inside-avoid overflow-hidden rounded-[3px] md:mb-5")}>
                <Image
                  src={w.src}
                  alt={w.alt}
                  width={800}
                  height={i < 6 ? 560 : 1000}
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="h-auto w-full"
                />
              </li>
            ))}
          </ul>
          <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3">
            <ButtonLink href="/collections">Shop the collection</ButtonLink>
            <ButtonLink href="/corporate-gifting" variant="text" className="text-chocolate">
              Corporate gifting
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
