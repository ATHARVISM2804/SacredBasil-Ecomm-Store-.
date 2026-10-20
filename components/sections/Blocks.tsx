import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

/**
 * v4 page blocks (docs/REVAMP-PLAN.md): edge-to-edge tiles, wide banners and
 * the word panel. Square corners, no gutters between images.
 */

export type Tile = {
  href: string;
  name: string;
  image: string;
  alt: string;
  /** Second line under the name: a price, or "Enquire". */
  meta?: string;
  /** Shown on hover, as Skandinavisk swaps the packshot for a mood photo. */
  hoverImage?: string;
};

/** Edge-to-edge grid: 4 across on desktop, 2 on phones. */
export function TileGrid({
  tiles,
  className,
  priority,
  cols = 4,
}: {
  tiles: Tile[];
  className?: string;
  priority?: boolean;
  /** Columns on desktop. */
  cols?: 3 | 4;
}) {
  return (
    <ul className={cn("grid grid-cols-2", cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4", className)}>
      {tiles.map((t, i) => (
        <li key={t.href + t.name} data-reveal="fade" data-reveal-delay={(i % 4) * 0.08}>
          <Link href={t.href} className="group block pb-8">
            <span className="relative block aspect-[4/5] overflow-hidden bg-[#f3f1ee]">
              <Image
                src={t.image}
                alt={t.alt}
                fill
                priority={priority && i < 4}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
              {t.hoverImage && (
                <Image
                  src={t.hoverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </span>
            <span className="mt-4 block px-3 text-center text-[0.9rem] leading-snug">{t.name}</span>
            {t.meta && <span className="mt-1 block px-3 text-center text-[0.9rem] text-cocoa/70">{t.meta}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Two full-bleed photographs side by side, each with a pale label box. */
export function SplitTiles({ tiles }: { tiles: { href: string; label: string; image: string; alt: string }[] }) {
  return (
    <ul className="grid md:grid-cols-2">
      {tiles.map((t, i) => (
        <li key={t.href + t.label} data-reveal="fade" data-reveal-delay={i * 0.1}>
          <Link href={t.href} className="group relative grid aspect-[4/3] items-end justify-items-center overflow-hidden bg-cream pb-8 md:aspect-square md:pb-12 lg:aspect-[4/3]">
            <Image
              src={t.image}
              alt={t.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.03]"
            />
            <span className="tile-label relative group-hover:bg-white">{t.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Full-width photograph with a headline and one button, bottom left. */
export function WideBanner({
  image,
  alt,
  title,
  text,
  cta,
  href,
  tone = "light",
  position = "50% 50%",
}: {
  image: string;
  alt: string;
  title: string;
  text?: string;
  cta: string;
  href: string;
  /** "light" = light photo, dark text; "dark" = dark photo, white text. */
  tone?: "light" | "dark";
  position?: string;
}) {
  const dark = tone === "dark";
  return (
    <section className="relative flex min-h-[28rem] items-end overflow-hidden md:min-h-[34rem]">
      <Image src={image} alt={alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: dark
            ? "linear-gradient(90deg, rgb(20 12 8 / 0.62) 0%, rgb(20 12 8 / 0.2) 45%, rgb(20 12 8 / 0) 70%)"
            : "linear-gradient(90deg, rgb(255 255 255 / 0.78) 0%, rgb(255 255 255 / 0.35) 40%, rgb(255 255 255 / 0) 65%)",
        }}
      />
      <div data-reveal="fade" className={cn("relative max-w-xl px-[var(--gutter)] pb-12 md:pb-16", dark ? "text-ivory" : "text-chocolate")}>
        <h2 className="display-section">{title}</h2>
        {text && <p className={cn("mt-3 text-[1rem] leading-relaxed", dark ? "text-ivory/85" : "text-cocoa/80")}>{text}</p>}
        <Link href={href} className={cn("btn mt-7", dark ? "btn-light" : "btn-primary")}>
          {cta}
          <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />
        </Link>
      </div>
    </section>
  );
}

/** Collections strip: landscape photographs, four across, name and line underneath. */
export function WorldStrip({
  worlds,
}: {
  worlds: { href: string; name: string; devanagari?: string; line: string; image: string; alt: string }[];
}) {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
      {worlds.map((w) => (
        <li key={w.name}>
          <Link href={w.href} className="group block pb-10">
            <span className="relative block aspect-[4/3] overflow-hidden bg-cream">
              <Image
                src={w.image}
                alt={w.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
              />
            </span>
            <span className="mt-5 flex items-baseline justify-center gap-2 px-4 text-center">
              <span className="text-[1.05rem] uppercase tracking-[0.08em]">{w.name}</span>
              {w.devanagari && (
                <span lang="hi" className="text-[1rem] text-cocoa/60">
                  {w.devanagari}
                </span>
              )}
            </span>
            <span className="mt-1 block px-4 text-center text-[0.9rem] text-cocoa/70">{w.line}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Centred section heading with an optional link, as above a product grid. */
export function GridHeading({ title, text, href, cta }: { title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div data-reveal="fade" className="px-[var(--gutter)] pb-10 pt-16 text-center md:pt-24">
      <h2 className="display-section">{title}</h2>
      {text && <p className="mx-auto mt-3 max-w-xl text-[1rem] text-cocoa/70">{text}</p>}
      {href && cta && (
        <Link href={href} className="mt-4 inline-block text-[0.9rem] uppercase tracking-[0.08em] underline underline-offset-4">
          {cta}
        </Link>
      )}
    </div>
  );
}

/**
 * A word and its meaning, like Skandinavisk's "SKOG ['skuːg]": Devanagari,
 * transliteration, and what it means. Only true meanings.
 */
export function WordPanel({
  word,
  latin,
  meaning,
  text,
  image,
  alt,
}: {
  word: string;
  latin: string;
  meaning: string;
  text: string;
  image: string;
  alt: string;
}) {
  return (
    <section className="grid bg-cream md:grid-cols-2">
      <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[30rem]">
        <Image src={image} alt={alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center px-[var(--gutter)] py-16 md:px-16 lg:px-24">
        <p lang="hi" className="text-[2.6rem] leading-none text-chocolate md:text-[3.4rem]">
          {word}
        </p>
        <p className="mt-4 text-[1.05rem] text-chocolate">
          {latin} <span className="text-cocoa/60">· {meaning}</span>
        </p>
        <p className="mt-6 max-w-md text-[1rem] leading-relaxed text-cocoa/80">{text}</p>
      </div>
    </section>
  );
}

/** Full-bleed landscape hero with a centred title, as on a Skandinavisk collection page. */
export function CollectionHero({ image, alt, title, line }: { image: string; alt: string; title: string; line?: string }) {
  return (
    <section className="relative grid min-h-[22rem] place-items-center overflow-hidden md:min-h-[30rem]">
      <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-black/25" />
      <div className="relative px-[var(--gutter)] text-center text-white">
        <h1 className="display-hero">{title}</h1>
        {line && <p className="mt-3 text-[1.05rem] text-white/90">{line}</p>}
      </div>
    </section>
  );
}

/** Quiet centred brand statement on cream, after Skandinavisk's "Our vision". */
export function BrandStatement() {
  return (
    <section aria-label="About Sacred Basil" className="bg-cream px-[var(--gutter)] py-24 text-center md:py-32">
      <Logo variant="monogram" className="mx-auto h-12 text-gold" />
      <p data-reveal="fade" data-reveal-delay="0.1" className="mx-auto mt-10 max-w-3xl font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] font-medium leading-snug text-chocolate">
        Named after tulsi, the holy basil revered in Ayurveda, Sacred Basil brings that heritage into modern luxury:
        honest formulations, handcrafted in small batches and finished with care.
      </p>
      <p className="mt-8 text-[0.85rem] uppercase tracking-[0.16em] text-cocoa/60">Doctor-led · Handmade in Pune</p>
      <Link
        href="/our-story"
        className="mt-8 inline-block text-[0.9rem] uppercase tracking-[0.08em] text-chocolate underline underline-offset-4"
      >
        Our story
      </Link>
    </section>
  );
}
