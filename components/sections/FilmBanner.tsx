"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Full-bleed looping film with an optional headline and button bottom left,
 * like Skandinavisk's "Bundles and duos" banner. Plays only while on screen;
 * paused for reduced motion; has a pause control (WCAG 2.2.2).
 */
export function FilmBanner({
  name,
  label,
  title,
  text,
  cta,
  href,
}: {
  /** Files: /video/v4/<name>-desktop.mp4, -mobile.mp4 and matching .jpg posters. */
  name: string;
  label: string;
  title?: string;
  text?: string;
  cta?: string;
  href?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const kind = isMobile ? "mobile" : "desktop";

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px" });
    io.observe(v);
    return () => io.disconnect();
  }, [kind]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (visible && !reduced && !paused) v.play().catch(() => undefined);
    else v.pause();
  }, [visible, reduced, paused, kind]);

  return (
    <section aria-label={label} className="relative aspect-[4/5] w-full overflow-hidden bg-chocolate md:aspect-[2/1]">
      <video
        key={kind}
        ref={ref}
        className="absolute inset-0 size-full object-cover"
        poster={`/video/v4/${name}-${kind}.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
      >
        <source src={`/video/v4/${name}-${kind}.mp4?v=9`} type="video/mp4" />
      </video>
      {title && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,rgb(20_12_8/0.6)_0%,rgb(20_12_8/0.15)_45%,rgb(20_12_8/0)_70%)] md:bg-[linear-gradient(90deg,rgb(20_12_8/0.55)_0%,rgb(20_12_8/0.15)_40%,rgb(20_12_8/0)_65%)]"
          />
          <div data-reveal="fade" className="absolute inset-x-0 bottom-0 max-w-xl px-[var(--gutter)] pb-12 text-white md:pb-16">
            <h2 className="display-section">{title}</h2>
            {text && <p className="mt-3 text-[1rem] leading-relaxed text-white/85">{text}</p>}
            {cta && href && (
              <Link href={href} className="btn btn-light mt-7">
                {cta}
                <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />
              </Link>
            )}
          </div>
        </>
      )}
      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play film" : "Pause film"}
          className={cn(
            "absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55",
          )}
        >
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </button>
      )}
    </section>
  );
}
