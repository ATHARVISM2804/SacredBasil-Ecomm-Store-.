"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Hero film, after Skandinavisk: a cinematic strip below the header with no
 * copy over it. Ultra-wide 8:3 on desktop, 4:5 portrait on phones. Silent
 * autoplay loop with a pause control (WCAG 2.2.2).
 *
 * Product film, built by scripts/brandfix/build_film.py from generated stills
 * whose labels carry the official logo (scripts/brandfix/luxshots.json); the
 * gold pattern and end card are drawn from the official vectors.
 */
const FILM = {
  desktop: { src: "/video/v4/hero-desktop.mp4?v=9", poster: "/video/v4/hero-desktop.jpg" },
  mobile: { src: "/video/v4/hero-mobile.mp4?v=9", poster: "/video/v4/hero-mobile.jpg" },
};

export function HeroFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [paused, setPaused] = useState(false);
  const film = isMobile ? FILM.mobile : FILM.desktop;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (reduced || paused) v.pause();
    else v.play().catch(() => undefined);
  }, [reduced, paused, isMobile]);

  return (
    <section aria-label="Sacred Basil film" className="relative aspect-[4/5] w-full overflow-hidden bg-chocolate md:aspect-[8/3]">
      <video
        key={film.src}
        ref={video}
        className="absolute inset-0 size-full object-cover"
        poster={film.poster}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="auto"
        aria-label="The Sacred Basil collection on travertine: the Luxe gift box, body and face scrubs, body oil, artisanal soap, a scented candle and floral gift boxes"
      >
        <source src={film.src} type="video/mp4" />
      </video>
      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play film" : "Pause film"}
          className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
        >
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </button>
      )}
    </section>
  );
}
