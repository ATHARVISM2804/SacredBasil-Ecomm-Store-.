"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/admin/actions/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile drawer after navigating.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-chocolate px-4 text-ivory lg:hidden print:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Logo variant="monogram" className="h-7 w-auto text-champagne" />
          <span className="eyebrow text-ivory/85">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          className="inline-flex size-10 items-center justify-center rounded-[2px] hover:bg-white/10"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      {open && (
        <div aria-hidden className="fixed inset-0 z-30 bg-espresso/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        id="admin-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-chocolate text-ivory transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 print:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--line-light)] px-6 py-6">
          <Logo variant="monogram" className="h-9 w-auto text-champagne" />
          <div className="leading-tight">
            <Logo variant="wordmark" className="h-3 w-auto text-ivory" />
            <p className="eyebrow mt-1.5 text-champagne/80">Studio admin</p>
          </div>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-0.5">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm tracking-wide transition-colors",
                      active ? "bg-ivory/12 text-ivory" : "text-ivory/70 hover:bg-ivory/8 hover:text-ivory",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-champagne" : "text-ivory/50")} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 border-t border-[var(--line-light)] pt-5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm text-ivory/70 hover:bg-ivory/8 hover:text-ivory"
            >
              <ExternalLink className="size-4 text-ivory/50" aria-hidden />
              View store
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </div>
        </nav>

        <div className="border-t border-[var(--line-light)] px-6 py-5">
          <p className="truncate text-xs text-ivory/60" title={email}>
            {email}
          </p>
          <form action={signOut} className="mt-2">
            <button type="submit" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-champagne hover:text-ivory">
              <LogOut className="size-3.5" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <div id="admin-main" className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 lg:px-10 lg:py-12 print:max-w-none print:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}
