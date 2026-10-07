"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/animations";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * Desktop-only companion cursor. The native cursor stays; a small dot
 * follows it and becomes a label over images ("View") and CTAs ("Open").
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const enabled = useMediaQuery("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
      el.style.opacity = "1";
    };
    const leave = () => (el.style.opacity = "0");

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const text = label === "view" ? "View" : label === "open" ? "Open" : null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] opacity-0 transition-opacity duration-300"
    >
      <div
        className={
          "-translate-x-1/2 -translate-y-1/2 rounded-full bg-cocoa text-ivory transition-[width,height] duration-500 ease-[var(--ease-editorial)] flex items-center justify-center " +
          (text ? "size-16" : "size-1.5")
        }
      >
        {text && <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em]">{text}</span>}
      </div>
    </div>
  );
}
