"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[3px] bg-cream">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === 0 ? name : `${name}, view ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className={cn(
              "object-cover transition-opacity duration-700 ease-[var(--ease-editorial)]",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
      </div>
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-[2px] border transition-colors duration-500",
                  i === active ? "border-chocolate" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
