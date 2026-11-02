"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Packshot slider on the studio white, as at Skandinavisk: swipe on phones
 * (native scroll snap), arrows and dots everywhere.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const show = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = (i + images.length) % images.length;
    el.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      className="relative aspect-[4/5] bg-[#f3f1ee] lg:aspect-auto lg:h-[calc(100svh-7rem)] lg:min-h-[34rem]"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${name} images`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") show(active - 1);
        if (e.key === "ArrowRight") show(active + 1);
      }}
    >
      <div
        ref={track}
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {images.map((src, i) => (
          <div key={src} className="relative size-full shrink-0 snap-center" aria-hidden={i !== active}>
            <Image
              src={src}
              alt={i === 0 ? name : `${name}, view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => show(active - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center text-chocolate transition-opacity hover:opacity-60 md:grid"
          >
            <ChevronLeft aria-hidden className="size-6" strokeWidth={1} />
          </button>
          <button
            type="button"
            onClick={() => show(active + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center text-chocolate transition-opacity hover:opacity-60 md:grid"
          >
            <ChevronRight aria-hidden className="size-6" strokeWidth={1} />
          </button>
          <ul className="absolute inset-x-0 bottom-1 flex justify-center" aria-label="Choose image">
            {images.map((src, i) => (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => show(i)}
                  aria-label={`Show image ${i + 1} of ${images.length}`}
                  aria-current={i === active}
                  className="grid size-11 place-items-center"
                >
                  <span
                    className={cn(
                      "h-[3px] rounded-full transition-all duration-500",
                      i === active ? "w-5 bg-chocolate" : "w-[7px] bg-chocolate/25",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
