"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { brandMenu, shopMenu, site } from "@/data/site";
import { lenisStore } from "@/components/ui/MotionProvider";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

/** Full-screen phone menu: the same groups as the desktop header. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenisStore.current?.stop();
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("nav a")?.focus();
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
        "fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ivory text-chocolate transition-[opacity,visibility] duration-300 lg:hidden",
        open ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--line)] px-[var(--gutter)]">
        <Link href="/" onClick={onClose} aria-label="Sacred Basil, home" className="flex items-center gap-3">
          <Logo variant="monogram" className="h-8" />
          <Logo variant="wordmark" className="h-[0.78rem]" />
        </Link>
        <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center">
          <X aria-hidden className="size-5" strokeWidth={1.25} />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex-1 px-[var(--gutter)] py-6">
        <ul className="divide-y divide-[var(--line)]">
          {shopMenu.map((g) => (
            <li key={g.label} className="py-4">
              <Link href={g.href} onClick={onClose} className="text-[1.15rem]">
                {g.label}
              </Link>
              {g.links && (
                <ul className="mt-3 space-y-2.5 text-[0.95rem] text-cocoa/70">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} onClick={onClose}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <ul className="mt-6 space-y-3 border-t border-[var(--line)] pt-6 text-[1rem]">
          {brandMenu.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={onClose}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/account" onClick={onClose}>
              Your account
            </Link>
          </li>
        </ul>
      </nav>

      <p className="px-[var(--gutter)] pb-8 text-[0.85rem] text-cocoa/60">{site.statement}</p>
    </div>
  );
}
