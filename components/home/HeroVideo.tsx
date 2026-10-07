"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Lotus } from "@/components/ui/Ornament";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Hero film: the Luxe Bath & Body Care Kit unboxing as a silent, seamless
 * loop (the final second dissolves back into the first frame), with copy
 * that changes in time with the film.
 *
 * Sources (public/video/), cut from docs/hero-film/luxe/exports/luxe-hero-final.mp4:
 *   hero-desktop.mp4  1600×900, full-bleed
 *   hero-mobile.mp4   720×1280 vertical cut (exports/luxe-hero-mobile-v2.mp4),
 *                     from the 9:16 Veo clips in docs/hero-film/luxe/mobile-clips;
 *                     natural speed, long dissolves, top third left clear for the copy
 */

/**
 * Chapters, timed to each film's shot changes (seconds). `at` is the desktop
 * film (40.5 s loop); `atMobile` the vertical film (28.5 s loop).
 */
const chapters = [
  {
    at: 0,
    atMobile: 0,
    eyebrow: "The Diwali Gifting Collection",
    title: ["Wellness,", "thoughtfully gifted."],
    text: "Handcrafted, Ayurvedic-inspired rituals from a doctor-led brand in Pune.",
  },
  {
    at: 3.8,
    atMobile: 2.6,
    eyebrow: "The Luxe Bath & Body Care Kit",
    title: ["Crafted for your", "Diwali dawn."],
    text: "Our signature kit, finished in deep chocolate and gold foil.",
  },
  {
    at: 10.1,
    atMobile: 7.9,
    eyebrow: "Five handcrafted pieces",
    title: ["Open to a", "ritual of care."],
    text: "Made to nourish the body, calm the mind and uplift the spirit.",
  },
  {
    at: 15.8,
    atMobile: 11.5,
    eyebrow: "Body Scrub & Face Scrub",
    title: ["Exfoliate.", "Nourish. Glow."],
    text: "Gentle care for a natural glow.",
  },
  {
    at: 22,
    atMobile: 14,
    eyebrow: "Body Oil & Artisanal Soap",
    title: ["Deeply hydrating,", "gently cleansing."],
    text: "Handmade in small batches, free from harsh chemicals.",
  },
  {
    at: 27.2,
    atMobile: 17.3,
    eyebrow: "Soy Wax Scented Candle",
    title: ["A calm,", "cozy evening."],
    text: "Long-lasting fragrance to close the day softly.",
  },
  {
    at: 32.1,
    atMobile: 21.4,
    eyebrow: "₹1,100, or ₹899 each in bulk",
    title: ["Thoughtful gifts.", "Lasting impressions."],
    text: "The Luxe Bath & Body Care Kit, beautifully boxed for the people who matter.",
  },
] as const;

const chapterAt = (t: number, mobile: boolean) => {
  let i = 0;
  chapters.forEach((c, k) => {
    if (t >= (mobile ? c.atMobile : c.at)) i = k;
  });
  return i;
};

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [chapter, setChapter] = useState(0);

  // Follow playback; React only re-renders when the chapter changes.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      const c = chapterAt(v.currentTime, isMobile);
      if (c !== last) {
        last = c;
        setChapter(c);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isMobile]);

  // Reduced motion: no autoplay; rest on the opening frame.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduced) v.pause();
    else v.play().catch(() => undefined);
  }, [reduced, isMobile]);

  const active = reduced ? 0 : chapter;

  return (
    <section
      aria-labelledby="hero-title"
      data-header="light"
      className="relative h-[100svh] min-h-[36rem] bg-ivory md:bg-chocolate-deep"
    >
      {/* Film */}
      <div className="hero-emerge absolute inset-0 overflow-hidden max-md:[@media(max-height:720px)]:top-12">
        <video
          key={isMobile ? "m" : "d"}
          ref={video}
          className="absolute inset-0 size-full object-cover object-[50%_70%] md:object-[35%_50%]"
          poster={isMobile ? "/video/hero-poster-mobile.jpg" : "/video/hero-poster.jpg"}
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="auto"
          aria-label="The Sacred Basil Luxe Bath & Body Care Kit: a chocolate gift box with gold foil opens to body scrub, face scrub, body oil, artisanal soap and a scented candle"
        >
          <source src={isMobile ? "/video/hero-mobile.mp4" : "/video/hero-desktop.mp4"} type="video/mp4" />
        </video>

        {/* Desktop grading: soft top for the header, a deep warm corner behind the copy */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(180deg, rgb(42 26 18 / 0.42) 0%, rgb(42 26 18 / 0) 18%), radial-gradient(70% 80% at 0% 100%, rgb(30 18 12 / 0.9) 0%, rgb(30 18 12 / 0.6) 34%, rgb(30 18 12 / 0) 66%)",
          }}
        />
        {/* Mobile grading: a soft ivory veil behind the copy and the buttons */}
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgb(246 240 232 / 0.82) 0%, rgb(246 240 232 / 0.5) 22%, rgb(246 240 232 / 0) 40%), linear-gradient(0deg, rgb(246 240 232 / 0.9) 0%, rgb(246 240 232 / 0) 22%)",
          }}
        />
      </div>

      {/* Copy. Mobile: headline in the clear top third, buttons at the foot.
          Desktop: one aligned column, bottom left, clear of the products. */}
      <div className="shell absolute inset-0 pb-7 pt-[8.75rem] max-md:[@media(max-height:720px)]:pt-[8.25rem] md:inset-x-0 md:bottom-0 md:top-auto md:pb-[clamp(3.5rem,9vh,6rem)] md:pt-0">
        <div className="flex h-full flex-col justify-between md:block md:h-auto md:w-[min(30rem,36vw)]">
          <div className="relative min-h-[11.5rem] md:min-h-[13.5rem]">
            {chapters.map((c, i) => {
              const on = i === active;
              const Heading = i === 0 ? "h1" : "p";
              return (
                <div
                  key={c.eyebrow}
                  aria-hidden={!on}
                  className={cn(
                    "absolute inset-x-0 top-0 md:bottom-0 md:top-auto transition-[opacity,filter] duration-[1000ms] ease-[var(--ease-editorial)]",
                    on ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-[4px]",
                  )}
                >
                  <p
                    className={cn(
                      "eyebrow flex items-center gap-3 text-gold transition-transform duration-[1000ms] ease-[var(--ease-editorial)] md:text-champagne",
                      on ? "translate-y-0" : "translate-y-3",
                    )}
                  >
                    <Lotus className="h-3.5 w-6" />
                    {c.eyebrow}
                  </p>
                  <Heading
                    id={i === 0 ? "hero-title" : undefined}
                    className="mt-4 font-display text-[clamp(2.3rem,3.3vw,3.7rem)] max-md:[@media(max-height:720px)]:mt-3 max-md:[@media(max-height:720px)]:text-[2rem] font-light leading-[1.04] tracking-[-0.01em] text-chocolate md:text-ivory"
                  >
                    {c.title.map((line, l) => (
                      <span key={line} className="block overflow-hidden pb-[0.1em]">
                        <span
                          className={cn(
                            "block transition-transform duration-[1200ms] ease-[var(--ease-editorial)]",
                            on ? "translate-y-0" : "translate-y-[108%]",
                          )}
                          style={{ transitionDelay: on ? `${140 + l * 120}ms` : "0ms" }}
                        >
                          {line}
                        </span>
                        {l < c.title.length - 1 && " "}
                      </span>
                    ))}
                  </Heading>
                  <p
                    className={cn(
                      "mt-3 max-w-sm text-[0.98rem] max-md:[@media(max-height:720px)]:hidden leading-relaxed text-cocoa/75 transition-[opacity,transform] duration-[1000ms] ease-[var(--ease-editorial)] md:text-ivory/78",
                      on ? "translate-y-0 opacity-100 delay-300" : "translate-y-2 opacity-0",
                    )}
                  >
                    {c.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 md:mt-7 md:border-t md:border-[var(--line-light)] md:pt-7">
            <ButtonLink href="/collections" className="md:bg-ivory md:text-chocolate md:hover:bg-cream">
              Shop the collection
            </ButtonLink>
            <ButtonLink href="/corporate-gifting" variant="text" className="text-chocolate md:text-ivory">
              Corporate gifting
            </ButtonLink>
          </div>
        </div>
      </div>

    </section>
  );
}
