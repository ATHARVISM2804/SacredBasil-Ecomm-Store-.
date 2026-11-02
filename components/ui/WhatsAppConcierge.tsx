"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/data/site";
import { SocialIcon } from "@/components/footer/SocialLinks";
import { cn } from "@/lib/utils";

/** Pages where the chat button would get in the way. */
const QUIET = ["/admin", "/checkout"];

/**
 * Floating "Chat with us" button, bottom right. Hidden on product pages on
 * phones, where the sticky order bar already opens WhatsApp.
 */
export function WhatsAppConcierge() {
  const pathname = usePathname();
  if (QUIET.some((p) => pathname.startsWith(p))) return null;
  const product = pathname.startsWith("/collections/");

  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "group fixed right-4 z-40 flex h-13 items-center gap-0 rounded-full bg-chocolate-deep pl-[0.9rem] pr-[0.9rem] text-champagne shadow-[0_12px_32px_-12px_rgb(20_12_8/0.7)] transition-[gap,padding,background-color] duration-500 ease-[var(--ease-editorial)] hover:gap-3 hover:bg-chocolate hover:pr-5 md:right-6",
        // Product pages on phones already have the WhatsApp order bar at the bottom.
        product ? "bottom-6 max-md:hidden" : "bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-6",
      )}
    >
      <SocialIcon network="whatsapp" className="size-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.78rem] uppercase tracking-[0.12em] text-ivory transition-[max-width] duration-500 ease-[var(--ease-editorial)] group-hover:max-w-[8rem]">
        Chat with us
      </span>
    </a>
  );
}
