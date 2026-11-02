"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Home hero: studio photographs of the gift sets, cross-fading with a slow
 * push-in, and copy that changes with each one. Same frame as the old film:
 * 8:3 on desktop with the copy over the empty paper on the left, 4:5 on
 * phones with the copy underneath. Held on the first slide under reduced
 * motion. Images: docs/regen3 (built from the brochure, see README there).
 */
const SLIDES = [
  {
    image: "hero-luxe-closed",
    alt: "The Sacred Basil Luxe Bath & Body Care Kit, a chocolate-brown box with gold foil",
    eyebrow: "The Luxe Bath & Body Care Kit",
    title: "Crafted for your Diwali Dawn",
    text: "Five handcrafted pieces in a chocolate and gold-foil magnetic box.",
    cta: "Shop the Luxe Kit",
    href: "/collections/luxe-bath-body-care-kit",
  },
  {
    image: "hero-luxe-open",
    alt: "The Luxe kit open: body scrub, face scrub, scented candle, artisanal soap and body oil in a cream tray",
    eyebrow: "Inside the Luxe Kit",
    title: "Five rituals, one box",
    text: "Body scrub, face scrub, body oil, handmade soap and a soy wax candle.",
    cta: "See what’s inside",
    href: "/collections/luxe-bath-body-care-kit",
  },
  {
    image: "hero-tranquil",
    alt: "The Tranquil Box: a floral gift box and an open box with soap, ubtan, body oil and a scented candle",
    eyebrow: "The Tranquil Box",
    title: "Simple. Soothing. Thoughtful.",
    text: "Soap, ubtan, body oil and a scented candle in our floral magnet box.",
    cta: "Shop the Tranquil Box",
    href: "/collections/tranquil-box",
  },
  {
    image: "hero-serenity",
    alt: "The Serenity Box: a square floral gift box and an open box with soap, bath powder and body oil",
    eyebrow: "The Serenity Box",
    title: "Three calming essentials",
    text: "Artisanal soap, aromatic body oil and bath powder, with a Diwali card.",
    cta: "Shop the Serenity Box",
    href: "/collections/serenity-box",
  },
  {
    image: "hero-festive",
    alt: "The Festive Ritual box with Deepawali lettering beside an organza pouch of soap, ubtan and body oil",
    eyebrow: "The Festive Ritual Box / Pouch",
    title: "A little Diwali, beautifully wrapped",
    text: "Soap, ubtan and body oil in a festive box or an organza pouch.",
    cta: "Shop the Festive Ritual",
    href: "/collections/festive-ritual-box-pouch",
  },
];

const HOLD = 6500;

export function HeroSlides() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const running = !reduced && !paused;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), HOLD);
    return () => clearTimeout(t);
  }, [index, running]);

  const slide = SLIDES[index];

  return (
    <section aria-roledescription="carousel" aria-label="The Diwali Gifting Collection" className="relative bg-[#efe9e1]">
      <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[8/3]">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-editorial)]",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            <picture>
              <source media="(max-width: 767px)" srcSet={`/images/v6/${s.image}-m.webp`} />
              <Image
                src={`/images/v6/${s.image}.webp`}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className={cn(
                  "object-cover object-right transition-transform ease-linear motion-reduce:transition-none",
                  i === index && running ? "scale-[1.04] duration-[8000ms]" : "scale-100 duration-[1400ms]",
                )}
              />
            </picture>
          </div>
        ))}
      </div>

      <div className="px-[var(--gutter)] pb-10 pt-7 md:absolute md:inset-y-0 md:left-0 md:flex md:w-[36%] md:flex-col md:justify-center md:py-0">
        <div key={index} className="hero-copy text-chocolate">
          <p className="eyebrow text-cocoa/70">{slide.eyebrow}</p>
          <h2 className="mt-3 font-serif text-[clamp(2rem,3.1vw,3.05rem)] font-normal leading-[1.06]">{slide.title}</h2>
          <p className="mt-4 max-w-[26rem] text-[1rem] leading-relaxed text-cocoa/80">{slide.text}</p>
          <Link href={slide.href} className="btn btn-primary mt-7">
            {slide.cta}
            <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />
          </Link>
        </div>

        <div className="mt-8 flex items-center gap-3 md:mt-10">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.eyebrow}`}
              aria-current={i === index}
              className="group flex h-11 w-9 items-center"
            >
              <span className="relative block h-px w-full overflow-hidden bg-chocolate/20">
                <span
                  key={i === index ? `on-${index}-${running}` : "off"}
                  className={cn(
                    "absolute inset-y-0 left-0 bg-chocolate",
                    i === index ? (running ? "hero-progress w-full" : "w-full") : "w-0",
                  )}
                  style={{ animationDuration: `${HOLD}ms` }}
                />
              </span>
            </button>
          ))}
          {!reduced && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="ml-1 grid size-11 place-items-center text-chocolate/70 transition-opacity hover:opacity-60"
            >
              {paused ? <Play aria-hidden className="size-3.5" strokeWidth={1.25} /> : <Pause aria-hidden className="size-3.5" strokeWidth={1.25} />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
