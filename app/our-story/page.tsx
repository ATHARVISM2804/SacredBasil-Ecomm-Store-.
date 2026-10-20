import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { previousWork } from "@/data/catalog";
import { brandValues, founders, site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Sacred Basil is a doctor-led brand from Pune, founded by Ayurveda practitioner Parita and dentist Ananya, making handcrafted Ayurvedic-inspired wellness gifts.",
  alternates: { canonical: "/our-story" },
};

/** Real previous-work photographs for the gallery (indexes into previousWork). */
const GALLERY = [0, 1, 3, 6, 8, 11, 4, 9];

/** Our Story, v4: Skandinavisk "About" layout (text beside photograph, quiet sections). */
export default function OurStoryPage() {
  return (
    <>
      <section aria-labelledby="story-title" className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-[var(--gutter)] py-16 lg:px-16 lg:py-24 xl:px-24">
          <p className="text-[0.8rem] uppercase tracking-[0.18em] text-gold">About us</p>
          <h1 id="story-title" className="display-hero mt-5 text-chocolate">
            Rooted in purpose. Driven by care.
          </h1>
          <p className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-cocoa/80">
            Sacred Basil is a doctor-led brand where authenticity, quality and intention come first. Led by Ayurveda
            practitioner Parita and dentist Ananya, we bring together our knowledge and passion to create Ayurvedic-based
            products that truly care for your well-being.
          </p>
          <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-cocoa/80">
            We are committed to handcrafted, effective and safe formulations that blend the wisdom of Ayurveda with
            modern lifestyle needs.
          </p>
          <p className="mt-10 text-[0.8rem] uppercase tracking-[0.16em] text-cocoa/55">Parita &amp; Ananya, founders</p>
        </div>
        <div className="relative min-h-[26rem] bg-cream lg:min-h-[44rem]">
          <Image
            src="/images/site/founders-wide.webp"
            alt="Sacred Basil founders Parita and Ananya in their studio beside the Luxe gift box"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[65%_50%]"
          />
        </div>
      </section>

      <section aria-labelledby="aim-title" className="bg-chocolate-deep px-[var(--gutter)] py-24 text-center text-ivory md:py-32">
        <Logo variant="monogram" className="mx-auto h-12 text-champagne" />
        <h2 id="aim-title" className="mt-8 text-[0.8rem] uppercase tracking-[0.18em] text-champagne">
          Our aim
        </h2>
        <p data-reveal="fade" className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(1.6rem,2.8vw,2.5rem)] font-medium leading-snug">{site.aim}</p>
      </section>

      <section aria-labelledby="founders-title" className="px-[var(--gutter)] py-20 md:py-28">
        <h2 id="founders-title" className="display-section text-center text-chocolate">
          The founders
        </h2>
        <ul className="mx-auto mt-14 grid max-w-4xl gap-12 md:grid-cols-2 md:gap-20">
          {founders.map((f, i) => (
            <li key={f.name} data-reveal="fade" data-reveal-delay={i * 0.12} className="border-t border-[var(--line)] pt-8 text-center">
              <p className="text-[1.6rem] text-chocolate">{f.name}</p>
              <p className="mt-1 text-[0.8rem] uppercase tracking-[0.16em] text-gold">{f.role}</p>
              <p className="mx-auto mt-5 max-w-sm text-cocoa/75">{f.bio}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="craft-title" className="grid bg-cream md:grid-cols-2">
        <div className="grid grid-cols-2">
          {[
            { src: "/video/craft/oil-1.mp4", poster: "/video/craft/oil-1.jpg", label: "Filling Aromatic Body Oil by hand" },
            { src: "/video/craft/oil-3.mp4", poster: "/video/craft/oil-3.jpg", label: "A freshly labelled bottle of Aromatic Body Oil" },
          ].map((v) => (
            <div key={v.src} className="relative aspect-[9/16]">
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
        </div>
        <div data-reveal="fade" className="flex flex-col justify-center px-[var(--gutter)] py-16 md:px-14 lg:px-20">
          <p className="text-[0.8rem] uppercase tracking-[0.18em] text-gold">Made by hand</p>
          <h2 id="craft-title" className="display-section mt-4 text-chocolate">
            Poured, labelled and packed by us.
          </h2>
          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-cocoa/80">
            Every bottle of our Aromatic Body Oil is filled by hand in small batches in Pune, and every kit is
            handcrafted and individually assembled.
          </p>
        </div>
      </section>

      <section aria-labelledby="values-title" className="px-[var(--gutter)] py-20 md:py-28">
        <h2 id="values-title" className="display-section text-center text-chocolate">
          Thoughtfully made, gently on the planet.
        </h2>
        <ul className="mx-auto mt-14 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {brandValues.map((v, i) => (
            <li key={v.title} data-reveal="fade" data-reveal-delay={i * 0.08} className="border-t border-gold/40 pt-6">
              <h3 className="text-[1.05rem] text-chocolate">{v.title}</h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-cocoa/70">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="journey-title">
        <div className="bg-cream px-[var(--gutter)] py-20 text-center md:py-24">
          <p className="text-[0.8rem] uppercase tracking-[0.18em] text-gold">Our beginning</p>
          <h2 id="journey-title" className="display-section mt-4 text-chocolate">
            Crafted with care. Loved by many.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-cocoa/75">
            Diwali 2025 marked the beginning of our journey. We created our first handcrafted wellness kits and
            thoughtful returns as a pilot, and sold 60 Diwali kits along with customised favours for birthdays, baby
            showers, naming ceremonies and other special occasions.
          </p>
        </div>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {GALLERY.map((i, n) => (
            <li key={previousWork[i].src} data-reveal="fade" data-reveal-delay={(n % 4) * 0.08} className="relative aspect-[4/5]">
              <Image src={previousWork[i].src} alt={previousWork[i].alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap justify-center gap-4 px-[var(--gutter)] py-16">
          <Link href="/collections" className="btn btn-primary">
            Shop the collection
          </Link>
          <Link href="/corporate-gifting" className="btn border border-chocolate text-chocolate hover:bg-chocolate hover:text-ivory">
            Corporate gifting
          </Link>
        </div>
      </section>
    </>
  );
}
