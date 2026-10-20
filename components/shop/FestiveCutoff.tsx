"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const { festival, orderBy } = site.festiveCutoff;
const deadline = new Date(`${orderBy}T23:59:59+05:30`).getTime();
const label = new Date(`${orderBy}T12:00:00+05:30`).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  timeZone: "Asia/Kolkata",
});

const noop = () => () => {};

/** "Order by 23 October for delivery before Diwali", until that day ends. */
export function FestiveCutoff({ className }: { className?: string }) {
  // Checked on the client: pages are static, so the server can't know today.
  const open = useSyncExternalStore(
    noop,
    () => Date.now() <= deadline,
    () => false,
  );
  if (!open) return null;
  return (
    <p className={cn("flex items-center gap-3 text-[0.9rem] text-chocolate", className)}>
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-gold" />
      <span>
        Order by <strong className="font-medium">{label}</strong> for delivery before {festival}.
      </span>
    </p>
  );
}
