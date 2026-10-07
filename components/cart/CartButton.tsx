"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

/** Header bag icon with a count badge. Inherits text colour from the header. */
export function CartButton({ className }: { className?: string }) {
  const { count, open, isOpen } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={cn("relative grid size-10 place-items-center transition-opacity hover:opacity-80", className)}
    >
      <ShoppingBag aria-hidden className="size-5" strokeWidth={1.25} />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute right-0.5 top-0.5 grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-medium leading-none text-ivory tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
