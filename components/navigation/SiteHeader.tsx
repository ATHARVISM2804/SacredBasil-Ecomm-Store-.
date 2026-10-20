"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { CartButton } from "@/components/cart/CartButton";
import { MobileMenu } from "./MobileMenu";
import { brandMenu, shopMenu, type MenuGroup } from "@/data/site";
import { cn } from "@/lib/utils";
import type { AnnouncementSetting } from "@/lib/admin/settings";

/**
 * Two-row header after Skandinavisk: wordmark and icons, then the shop menu
 * left and the brand menu right. Solid white and sticky (tucks away while
 * scrolling down, returns on the way up); the announcement
 * bar above it scrolls away with the page.
 */
export function SiteHeader({ announcement }: { announcement: AnnouncementSetting | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Close menus whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setOpenGroup(null);
  }

  // Tuck the header away while scrolling down; bring it back on the way up.
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setTucked(y > last && y > 160);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenGroup(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openGroup]);

  if (pathname.startsWith("/admin")) return null;

  const hover = (label: string | null) => {
    clearTimeout(closeTimer.current);
    if (label) setOpenGroup(label);
    else closeTimer.current = setTimeout(() => setOpenGroup(null), 120);
  };
  const isActive = (href: string) => {
    const path = href.split("#")[0];
    return path !== "/collections" && (pathname === path || pathname.startsWith(`${path}/`));
  };

  return (
    <>
      <a href="#main" className="btn btn-primary fixed left-4 top-4 z-[70] -translate-y-24 focus:translate-y-0">
        Skip to content
      </a>

      {announcement && (
        <div className="bg-chocolate text-ivory">
          <p className="shell flex h-9 items-center justify-center gap-3 text-center text-[0.78rem]">
            {/* With a link, phones show just the link; without one, the text shows everywhere. */}
            <span className={cn("truncate", announcement.link && "hidden sm:inline")}>{announcement.text}</span>
            {announcement.link && (
              <Link href={announcement.link} className="shrink-0 py-2 underline underline-offset-4">
                {announcement.linkLabel}
              </Link>
            )}
          </p>
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-50 border-b border-[var(--line)] bg-ivory text-chocolate transition-transform duration-500 ease-[var(--ease-editorial)]",
          tucked && !menuOpen && !openGroup && "-translate-y-full",
        )}
        onMouseLeave={() => hover(null)}
      >
        <div className="flex h-16 items-center justify-between px-[var(--gutter)] lg:h-[3.75rem] lg:pt-2">
          <Link href="/" aria-label="Sacred Basil, home" className="flex min-w-0 items-center gap-2.5 py-2 min-[380px]:gap-3">
            <Logo variant="monogram" className="h-7 shrink-0 min-[380px]:h-8 lg:h-7" />
            <Logo variant="wordmark" className="h-[0.68rem] shrink-0 min-[380px]:h-[0.78rem] lg:h-[0.85rem]" />
          </Link>

          <div className="flex items-center gap-1">
            {/* Below 380px the account link lives in the menu only, to keep the row on one line. */}
            <Link
              href="/account"
              aria-label="Your account"
              className="hidden size-10 place-items-center transition-opacity hover:opacity-70 min-[380px]:grid"
            >
              <UserRound aria-hidden className="size-5" strokeWidth={1.25} />
            </Link>
            <CartButton />
            <button
              type="button"
              className="grid size-10 place-items-center lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <X aria-hidden className="size-5" strokeWidth={1.25} />
              ) : (
                <Menu aria-hidden className="size-5" strokeWidth={1.25} />
              )}
            </button>
          </div>
        </div>

        <div className="hidden h-11 items-center justify-between px-[var(--gutter)] lg:flex">
          <nav aria-label="Shop">
            <ul className="flex items-center gap-8 text-[0.95rem]">
              {shopMenu.map((g) => (
                <li key={g.label} onMouseEnter={() => hover(g.links ? g.label : null)}>
                  <Link
                    href={g.href}
                    aria-expanded={g.links ? openGroup === g.label : undefined}
                    aria-controls={g.links ? `menu-${slug(g.label)}` : undefined}
                    onFocus={() => hover(g.links ? g.label : null)}
                    className={cn(
                      "border-b py-2.5 transition-colors",
                      openGroup === g.label || isActive(g.href) ? "border-chocolate" : "border-transparent hover:border-chocolate/40",
                    )}
                  >
                    {g.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About">
            <ul className="flex items-center gap-8 text-[0.95rem]" onMouseEnter={() => hover(null)}>
              {brandMenu.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "border-b py-2.5 transition-colors",
                      isActive(l.href) ? "border-chocolate" : "border-transparent hover:border-chocolate/40",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {shopMenu
          .filter((g) => g.links)
          .map((g) => (
            <MegaMenu key={g.label} group={g} open={openGroup === g.label} onEnter={() => hover(g.label)} />
          ))}
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, "-");

function MegaMenu({ group, open, onEnter }: { group: MenuGroup; open: boolean; onEnter: () => void }) {
  return (
    <div
      id={`menu-${slug(group.label)}`}
      onMouseEnter={onEnter}
      inert={!open}
      className={cn(
        "absolute inset-x-0 top-full hidden border-b border-[var(--line)] bg-ivory transition-[opacity,visibility] duration-300 lg:block",
        open ? "visible opacity-100" : "pointer-events-none invisible opacity-0",
      )}
    >
      <div className="grid grid-cols-12 gap-8 px-[var(--gutter)] py-10">
        <ul className="col-span-4 space-y-3 text-[0.95rem]">
          {group.links?.map((l) => (
            <li key={l.label}>
              <Link href={l.href} className="hover:underline hover:underline-offset-4">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className="col-span-8 grid grid-cols-2 gap-6">
          {group.tiles?.map((t) => (
            <li key={t.label}>
              <Link href={t.href} className="group block">
                <span className="relative block aspect-[16/10] overflow-hidden bg-cream">
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes="30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="mt-3 block text-[0.9rem] uppercase tracking-[0.08em]">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
