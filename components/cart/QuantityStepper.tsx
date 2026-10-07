"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { MAX_QUANTITY } from "@/lib/cart/pricing";
import { cn } from "@/lib/utils";

/** − [ n ] + with a typeable field. Commits whole numbers within 1..max. */
export function QuantityStepper({
  value,
  onChange,
  max = MAX_QUANTITY,
  label,
  size = "md",
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  /** Accessible name, e.g. "Quantity of The Tranquil Box". */
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const limit = Math.max(1, Math.min(MAX_QUANTITY, max));

  const commit = (raw: string) => {
    setDraft(null);
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) onChange(Math.min(limit, Math.max(1, n)));
  };

  const btn = cn(
    "grid place-items-center text-cocoa/70 transition-colors hover:text-chocolate disabled:opacity-30 disabled:hover:text-cocoa/70",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div
      className={cn("inline-flex items-center border border-[var(--line)] bg-ivory/60", className)}
      role="group"
      aria-label={label}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus aria-hidden className="size-3.5" strokeWidth={1.25} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Quantity"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(e.currentTarget.value);
          }
        }}
        className={cn(
          "bg-transparent text-center tabular-nums text-cocoa outline-none focus-visible:bg-cream/60",
          size === "sm" ? "h-8 w-10 text-sm" : "h-11 w-14",
        )}
      />
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= limit} aria-label="Increase quantity">
        <Plus aria-hidden className="size-3.5" strokeWidth={1.25} />
      </button>
    </div>
  );
}
