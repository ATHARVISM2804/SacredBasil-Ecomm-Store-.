"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, initReveals, prefersReducedMotion } from "@/lib/animations";

export const lenisStore: { current: Lenis | null } = { current: null };

/**
 * Lenis smooth scrolling synced to GSAP's ticker, plus the declarative
 * reveal system. Both stand down entirely under reduced motion.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) {
      document.documentElement.classList.remove("motion");
      return;
    }
    const lenis = new Lenis({ duration: 1.25, anchors: { offset: -72 }, autoRaf: false });
    lenisStore.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisStore.current = null;
    };
  }, []);

  useEffect(() => {
    lenisStore.current?.scrollTo(0, { immediate: true, force: true });
    const mm = initReveals();
    // Pinned and parallax sections measure layout: re-measure once it settles.
    const refresh = () => ScrollTrigger.refresh();
    const id = window.setTimeout(refresh, 300);
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
