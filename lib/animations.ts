"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Default easing from the design system. */
export const EASE = "power3.out";
export const DURATION = { cinematic: 1.5, reveal: 1.2, micro: 0.5 } as const;
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Declarative scroll reveals. Server components opt in with attributes:
 *
 *   data-reveal="fade"   soft opacity + 24px rise
 *   data-reveal="mask"   text mask: the first child slides up inside a clip
 *   data-reveal="image"  curtain reveal + slow 1.02 → 1 settle
 *   data-reveal-delay="0.2"
 *   data-parallax="8"    gentle scrubbed drift, in percent
 */
/**
 * Reveals are checked against live element positions on scroll/resize
 * rather than ScrollTrigger's cached ones, so nothing can go stale
 * (viewport resizes, late fonts, pinned sections, jumps, capture tools).
 * Content is never left hidden: until an element is bound here, a CSS
 * failsafe (globals.css) fades it in on its own after a moment.
 */
export function initReveals(root: ParentNode = document) {
  const mm = gsap.matchMedia();

  mm.add(MOTION_OK, (context) => {
    const bound: HTMLElement[] = [];
    let pending: HTMLElement[] = [];

    // Play anything whose top has crossed 92% of the viewport, including
    // elements jumped past entirely (anchors, End key, capture tools).
    let frame = 0;
    const check = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > limit) return true;
        context.add(() => play(el));
        return false;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const bind = (el: HTMLElement) => {
      if (el.dataset.bound !== undefined) return;
      // Already shown by the failsafe (slow hydration): leave it be.
      // Must be checked before binding, which lifts the CSS pre-hide.
      const shown = isVisible(el);
      el.dataset.bound = "";
      bound.push(el);
      if (shown) return;
      context.add(() => prepare(el));
      pending.push(el);
      schedule();
    };

    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(bind);

    // Bind anything rendered later (client-only content, hot reload).
    const mo = new MutationObserver(() => root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(bind));
    mo.observe(root instanceof Document ? root.body : (root as Node), { childList: true, subtree: true });

    root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const amount = parseFloat(el.dataset.parallax || "8");
      gsap.fromTo(
        el,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mo.disconnect();
      bound.forEach((el) => delete el.dataset.bound);
    };
  });

  return mm;
}

const maskLines = (el: HTMLElement) => Array.from(el.children) as HTMLElement[];

function isVisible(el: HTMLElement) {
  if (el.dataset.reveal === "mask") {
    const t = getComputedStyle(maskLines(el)[0] ?? el).transform;
    return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
  }
  return getComputedStyle(el).opacity === "1";
}

/** Set the start state inline, matching the CSS pre-hide exactly. */
function prepare(el: HTMLElement) {
  const type = el.dataset.reveal;
  if (type === "mask") {
    gsap.set(maskLines(el), { yPercent: 105 });
  } else if (type === "image") {
    gsap.set(el, { opacity: 1, clipPath: "inset(100% 0% 0% 0%)" });
    const media = el.querySelector("[data-reveal-media]");
    if (media) gsap.set(media, { scale: 1.12 });
  } else {
    gsap.set(el, { opacity: 0, y: 24 });
  }
}

function play(el: HTMLElement) {
  const type = el.dataset.reveal;
  const delay = parseFloat(el.dataset.revealDelay ?? "0");
  if (type === "mask") {
    gsap.to(maskLines(el), { yPercent: 0, duration: DURATION.reveal, ease: EASE, delay, stagger: 0.12 });
  } else if (type === "image") {
    gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: DURATION.cinematic, ease: "power3.inOut", delay });
    const media = el.querySelector("[data-reveal-media]");
    if (media) gsap.to(media, { scale: 1, duration: 2.2, ease: EASE, delay });
  } else {
    gsap.to(el, { opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE, delay });
  }
}

export { gsap, ScrollTrigger, useGSAP };
