"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { navigation, site } from "@/data/site";
import { lenisStore } from "@/components/ui/MotionProvider";
import { cn } from "@/lib/utils";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenisStore.current?.stop();
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenisStore.current?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      className={cn(
        "fixed inset-0 z-40 flex flex-col bg-chocolate text-ivory transition-[clip-path] duration-[900ms] ease-[var(--ease-editorial)] lg:hidden",
        open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
      )}
    >
      <nav aria-label="Mobile" className="shell relative flex flex-1 flex-col justify-center pt-24">
        <ul className="space-y-2">
          {[{ label: "Home", href: "/" }, ...navigation].map((item, i) => (
            <li
              key={item.href}
              className={cn(
                "transition-[opacity,transform] duration-700 ease-[var(--ease-editorial)]",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
              style={{ transitionDelay: open ? `${180 + i * 70}ms` : "0ms" }}
            >
              <Link href={item.href} onClick={onClose} className="font-display text-[2.7rem] font-light leading-[1.2]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="shell relative pb-10">
        <Link href="/corporate-gifting#enquire" onClick={onClose} className="btn btn-light w-full justify-between">
          Enquire
          <span aria-hidden>→</span>
        </Link>
        <p className="mt-6 font-display text-lg italic text-champagne/80">{site.statement}</p>
      </div>
    </div>
  );
}
