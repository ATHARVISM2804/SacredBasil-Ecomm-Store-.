"use client";

import { useEffect, useRef, useState } from "react";
import { useHydrated, useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Hero film, after Skandinavisk: a cinematic strip below the header with no
 * copy over it. Ultra-wide 8:3 on desktop, 4:5 portrait on phones. Silent
 * autoplay loop; held still under reduced motion.
 *
 * Product film, built by scripts/brandfix/build_film.py from generated stills
 * whose labels carry the official logo (scripts/brandfix/luxshots.json); the
 * gold pattern and end card are drawn from the official vectors.
 */
const FILM = {
  desktop: { src: "/video/v4/hero-desktop.mp4?v=9", poster: "/video/v4/hero-desktop.webp" },
  mobile: { src: "/video/v4/hero-mobile.mp4?v=9", poster: "/video/v4/hero-mobile.webp" },
};

export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const hydrated = useHydrated();
  const [playing, setPlaying] = useState(false);
  const film = isMobile ? FILM.mobile : FILM.desktop;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduced) v.pause();
    else v.play().catch(() => undefined);
  }, [reduced, isMobile, hydrated]);

  return (
    <section aria-label="Sacred Basil film" className="relative aspect-[4/5] w-full overflow-hidden bg-chocolate md:aspect-[8/3]">
      {/* The still paints first, picked by screen size in the HTML itself; the
          film is chosen after hydration so phones never fetch the desktop cut. */}
      <picture>
        <source media="(max-width: 767px)" srcSet={FILM.mobile.poster} />
        <img
          src={FILM.desktop.poster}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      {hydrated && (
        <video
          key={film.src}
          ref={video}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          aria-label="The Sacred Basil collection on travertine: the Luxe gift box, body and face scrubs, body oil, artisanal soap, a scented candle and floral gift boxes"
        >
          <source src={film.src} type="video/mp4" />
        </video>
      )}
    </section>
  );
}
