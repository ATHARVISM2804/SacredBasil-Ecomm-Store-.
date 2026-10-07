import { cn } from "@/lib/utils";

/** The brochure's lotus mark, drawn as a fine gold line. */
export function Lotus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden className={className}>
      <path d="M20 21c-2.6-3-3.4-7.6 0-13 3.4 5.4 2.6 10 0 13Z" />
      <path d="M19.4 21c-4.4-.8-8-4.2-8.6-9.4 4.6 1 7.6 4.4 8.6 9.4Z" />
      <path d="M20.6 21c4.4-.8 8-4.2 8.6-9.4-4.6 1-7.6 4.4-8.6 9.4Z" />
      <path d="M18.6 21.2c-5.6.8-10.6-1.4-14-5.6 5.2-.8 10.2 1 14 5.6Z" />
      <path d="M21.4 21.2c5.6.8 10.6-1.4 14-5.6-5.2-.8-10.2 1-14 5.6Z" />
    </svg>
  );
}

/** Hairline, lotus, hairline: the divider used across the brochure. */
export function Ornament({ className, tone = "gold" }: { className?: string; tone?: "gold" | "champagne" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center gap-3",
        tone === "gold" ? "text-gold" : "text-champagne",
        className,
      )}
    >
      <span className="h-px w-14 bg-current opacity-60" />
      <Lotus className="h-4 w-7" />
      <span className="h-px w-14 bg-current opacity-60" />
    </div>
  );
}
