import type { Metadata } from "next";
import Image from "next/image";
import { FlaskConicalOff, Leaf, Rabbit, Sprout } from "lucide-react";
import { previousWork } from "@/data/catalog";
import { brandValues, founders, site } from "@/data/site";
import { ButtonLink } from "@/components/ui/Button";
import { Lotus, Ornament } from "@/components/ui/Ornament";
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
      {/* Opening: the full founders photograph, never cropped, so the SB
          monogram, the Luxe box and the candle stay in view. */}
      <section aria-labelledby="story-title" className="bg-ivory pb-[var(--section-y)] pt-36 md:pt-44 lg:pb-24">
        <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <p className="eyebrow flex items-center gap-3 text-gold" data-reveal="fade">
              <Lotus className="h-3.5 w-6" />
              About us
            </p>
            <h1
              id="story-title"
              className="mt-5 text-balance font-display text-[clamp(2.75rem,4.4vw,4.6rem)] font-light leading-[1.02] tracking-[-0.015em] text-chocolate"
            >
              <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask" data-reveal-delay="0.15">
                <span className="block">Rooted in purpose. Driven by care.</span>
              </span>
            </h1>
            <p className="lede mt-6 max-w-md text-cocoa/78" data-reveal="fade" data-reveal-delay="0.45">
              Sacred Basil is a doctor-led brand where authenticity, quality and intention come first.
            </p>
            <p className="eyebrow mt-9 text-cocoa/55" data-reveal="fade" data-reveal-delay="0.6">
              Parita &amp; Ananya, founders
            </p>
          </div>

          <figure className="-mx-[var(--gutter)] sm:mx-0 lg:col-span-8">
            <div className="hero-emerge relative aspect-[4/3] overflow-hidden bg-cream sm:aspect-[3/2] sm:rounded-[3px]">
              <Image
                src="/images/site/founders-wide.webp"
                alt="Sacred Basil founders Parita and Ananya in the Sacred Basil studio, beneath the gold SB monogram, beside the Luxe Bath & Body Care Kit and a lit candle"
                fill
                priority
                quality={85}
                sizes="(min-width: 1024px) 64vw, 100vw"
                className="object-cover object-[30%_50%] sm:object-center"
              />
            </div>
          </figure>
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

      <section aria-labelledby="craft-title" className="section-y relative overflow-hidden bg-chocolate text-ivory">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(55%_70%_at_75%_40%,rgb(220_194_151/0.12),transparent_70%)]"
        />
        <div className="shell relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Ornament tone="champagne" className="justify-start" />
            <p className="eyebrow mt-6 text-champagne">Made by hand</p>
            <h2 id="craft-title" className="display-section mt-4">
              <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
                <span className="block">Poured, labelled and packed by us.</span>
              </span>
            </h2>
            <p className="lede mt-6 text-ivory/75" data-reveal="fade">
              Every bottle of our Aromatic Body Oil is filled by hand in small batches in Pune, and every kit is
              handcrafted and individually assembled.
            </p>
            <ul className="mt-8 space-y-3 border-t border-[var(--line-light)] pt-6 text-[0.95rem] text-ivory/75">
              {brandValues.slice(0, 3).map((v) => (
                <li key={v.title} className="flex items-center gap-3">
                  <span aria-hidden className="size-1.5 rounded-full bg-champagne" />
                  {v.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1.25fr_1fr] md:gap-5 lg:col-span-8">
            {[
              { src: "/video/craft/oil-1.mp4", poster: "/video/craft/oil-1.jpg", label: "Filling Aromatic Body Oil by hand" },
              { src: "/video/craft/oil-3.mp4", poster: "/video/craft/oil-3.jpg", label: "A freshly labelled bottle of Aromatic Body Oil" },
            ].map((v, i) => (
              <div
                key={v.src}
                className={cn("relative aspect-[9/16] overflow-hidden rounded-[3px]", i === 1 && "md:order-3")}
                data-reveal="fade"
                data-reveal-delay={String(i * 0.12)}
              >
                <video
                  className="absolute inset-0 size-full object-cover"
                  src={v.src}
                  poster={v.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={v.label}
                />
              </div>
            ))}
            <div
              className="relative col-span-2 aspect-[4/5] overflow-hidden rounded-[3px] md:order-2 md:col-span-1 md:aspect-auto"
              data-reveal="image"
            >
              <div data-reveal-media className="absolute inset-0">
                <Image
                  src="/images/site/aromatic-body-oil.webp"
                  alt="Sacred Basil Aromatic Body Oil bottles on travertine with a brass bowl of oil and tulsi"
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
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
