"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "Overview" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  if (!enabled || pathname === "/account/login") return null;
  return (
    <nav aria-label="Account" className="mb-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-[var(--line)] pb-5">
      {items.map((i) => {
        const active = i.href === "/account" ? pathname === "/account" || pathname.startsWith("/account/orders") : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn("eyebrow pb-1", active ? "border-b border-chocolate text-chocolate" : "text-cocoa/60 hover:text-chocolate")}
          >
            {i.label}
          </Link>
        );
      })}
      <form action="/auth/signout" method="post" className="ml-auto">
        <button type="submit" className="eyebrow text-cocoa/60 hover:text-chocolate">
          Sign out
        </button>
      </form>
    </nav>
  );
}
