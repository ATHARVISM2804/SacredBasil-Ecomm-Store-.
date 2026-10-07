"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CartButton } from "@/components/cart/CartButton";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

/** Routes that open on a dark hero: the header starts with light text over them. */
const darkHeroRoutes = ["/corporate-gifting"];

const left = [
  { label: "Shop", href: "/collections" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
];
const right = [
  { label: "Our Story", href: "/our-story" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overFilm, setOverFilm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Over a full-bleed film section (data-header="light"), stay transparent with light text.
      const film = document.querySelector<HTMLElement>('[data-header="light"]');
      const bottom = film?.getBoundingClientRect().bottom ?? 0;
      setOverFilm(desktop.matches && bottom > 90);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  if (pathname.startsWith("/admin")) return null;

  const light = (darkHeroRoutes.includes(pathname) && !scrolled) || overFilm || menuOpen;
  // Light pages get a soft cream bar from the start so the nav never sits on photography.
  const solid = !light;

  const navLink = (item: { label: string; href: string }) => {
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "eyebrow link-underline pb-1 transition-opacity duration-500",
            active ? "opacity-100" : "opacity-80 hover:opacity-100",
          )}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      <a href="#main" className="btn btn-primary fixed left-4 top-4 z-[70] -translate-y-24 focus:translate-y-0">
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-700 ease-[var(--ease-editorial)]",
          light ? "text-ivory" : "text-chocolate",
          solid && "bg-ivory/95 shadow-[0_1px_0_var(--line)] backdrop-blur-md",
        )}
      >
        {/* Announcement bar: folds away once the page scrolls */}
        <div
          className={cn(
            "grid overflow-hidden bg-chocolate text-champagne transition-[grid-template-rows] duration-700 ease-[var(--ease-editorial)]",
            scrolled || menuOpen ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
          )}
        >
          <div className="min-h-0">
            <p className="shell flex h-9 items-center justify-center gap-3 text-center text-[0.72rem] tracking-[0.08em]">
              <span className="hidden sm:inline">Diwali gifting: reserve your festive production slot early.</span>
              <Link href="/corporate-gifting#enquire" className="link-underline pb-px [background-size:100%_1px]">
                Enquire now
              </Link>
            </p>
          </div>
        </div>

        <div
          className={cn(
            "shell grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-700 ease-[var(--ease-editorial)]",
            scrolled ? "h-16" : "h-[5.25rem]",
          )}
        >
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-9">{left.map(navLink)}</ul>
          </nav>
          <button
            type="button"
            className="eyebrow relative z-[60] flex h-11 items-center gap-3 justify-self-start lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden className="relative block h-2.5 w-6">
              <span
                className={cn(
                  "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500",
                  menuOpen && "translate-y-[5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500",
                  menuOpen && "-translate-y-[4px] -rotate-45",
                )}
              />
            </span>
            <span className="hidden xs:inline">{menuOpen ? "Close" : "Menu"}</span>
          </button>

          <Link href="/" aria-label="Sacred Basil, home" className="relative z-[60] flex items-center gap-3.5 py-2">
            <Logo variant="monogram" className={cn("transition-[height] duration-700", scrolled ? "h-7" : "h-9")} />
            <span aria-hidden className="hidden h-6 w-px bg-current opacity-30 sm:block" />
            <Logo variant="wordmark" className="hidden h-[0.8rem] sm:block" />
          </Link>

          <div className={cn("flex items-center justify-end gap-6 lg:gap-9", menuOpen && "invisible")}>
            <nav aria-label="Secondary" className="hidden lg:block">
              <ul className="flex items-center gap-9">{right.map(navLink)}</ul>
            </nav>
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/account"
                aria-label="Your account"
                className="flex size-11 items-center justify-center opacity-85 transition-opacity hover:opacity-100"
              >
                <UserRound aria-hidden className="size-[1.15rem]" strokeWidth={1.25} />
              </Link>
              <CartButton />
            </div>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
