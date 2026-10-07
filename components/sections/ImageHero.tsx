import Image from "next/image";
import { Lotus } from "@/components/ui/Ornament";
import { cn } from "@/lib/utils";

/**
 * Cinematic page opening: a full-bleed campaign photograph with the title
 * laid over its calm side. The photographs are composed with the subject on
 * the right and open space on the left for the copy.
 *
 *   tone "light": ivory photograph, chocolate type, clear header with dark text
 *   tone "dark":  deep photograph, ivory type, clear header with light text
 *
 *   layout "split": on large screens the copy sits on an ivory panel at left
 *   and the photograph fills the right, for portraits that must not be covered.
 */
export function ImageHero({
  label,
  title,
  intro,
  image,
  alt,
  tone = "light",
  position = "50% 50%",
  mobilePosition = "72% 50%",
  layout = "overlay",
  children,
}: {
  label: string;
  title: string;
  intro?: string;
  image: string;
  alt: string;
  tone?: "light" | "dark";
  /** object-position on desktop */
  position?: string;
  /** object-position on phones, where the frame is tall and narrow */
  mobilePosition?: string;
  layout?: "overlay" | "split";
  children?: React.ReactNode;
}) {
  const dark = tone === "dark";
  const split = layout === "split";

  return (
    <section
      data-header={dark ? "light" : "clear"}
      className={cn(
        "relative flex h-[92svh] min-h-[36rem] flex-col justify-end overflow-hidden md:h-[100svh] md:max-h-[62rem]",
        dark ? "bg-chocolate-deep text-ivory" : "bg-cream text-chocolate",
      )}
    >
      <div className={cn("absolute inset-0 overflow-hidden", split && "lg:left-[42%]")}>
        <Image
          src={image}
          alt={alt}
          fill
          priority
          sizes={split ? "(min-width: 1024px) 58vw, 100vw" : "100vw"}
          quality={85}
          className="hero-drift object-cover object-[var(--pos-m)] md:object-[var(--pos)]"
          style={{ "--pos": position, "--pos-m": mobilePosition } as React.CSSProperties}
        />
      </div>

      {/* Grading: a veil behind the copy (left on desktop, foot on phones) and a soft top for the header */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 hidden md:block",
          split && "lg:hidden",
          dark
            ? "bg-[linear-gradient(90deg,rgb(30_18_12/0.86)_0%,rgb(30_18_12/0.55)_32%,rgb(30_18_12/0)_62%),linear-gradient(180deg,rgb(30_18_12/0.45)_0%,rgb(30_18_12/0)_22%)]"
            : "bg-[linear-gradient(90deg,rgb(246_240_232/0.88)_0%,rgb(246_240_232/0.6)_30%,rgb(246_240_232/0)_58%),linear-gradient(180deg,rgb(246_240_232/0.55)_0%,rgb(246_240_232/0)_20%)]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 md:hidden",
          dark
            ? "bg-[linear-gradient(0deg,rgb(30_18_12/0.92)_0%,rgb(30_18_12/0.55)_38%,rgb(30_18_12/0)_65%),linear-gradient(180deg,rgb(30_18_12/0.5)_0%,rgb(30_18_12/0)_20%)]"
            : "bg-[linear-gradient(0deg,rgb(246_240_232/0.96)_0%,rgb(246_240_232/0.75)_36%,rgb(246_240_232/0)_62%),linear-gradient(180deg,rgb(246_240_232/0.7)_0%,rgb(246_240_232/0)_22%)]",
        )}
      />

      {split && (
        <div
          aria-hidden
          className="absolute inset-y-0 left-[42%] hidden w-40 bg-[linear-gradient(90deg,var(--color-cream),transparent)] lg:block"
        />
      )}

      <div
        className={cn(
          "shell relative pb-[clamp(3rem,9vh,6.5rem)]",
          split && "lg:mx-0 lg:flex lg:h-full lg:w-[42%] lg:max-w-none lg:flex-col lg:justify-center lg:pb-0 lg:pl-[max(var(--gutter),calc((100vw-1400px)/2+var(--gutter)))] lg:pr-12 lg:pt-28",
        )}
      >
        <div className="max-w-[31rem]">
          <p
            className={cn("eyebrow flex items-center gap-3", dark ? "text-champagne" : "text-gold")}
            data-reveal="fade"
          >
            <Lotus className="h-3.5 w-6" />
            {label}
          </p>
          <h1 className="mt-5 text-balance font-display text-[clamp(2.75rem,4.9vw,4.9rem)] font-light leading-[1.02] tracking-[-0.015em]">
            <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask" data-reveal-delay="0.15">
              <span className="block">{title}</span>
            </span>
          </h1>
          {intro && (
            <p
              className={cn("lede mt-6 max-w-md", dark ? "text-ivory/78" : "text-cocoa/78")}
              data-reveal="fade"
              data-reveal-delay="0.45"
            >
              {intro}
            </p>
          )}
          {children && (
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3" data-reveal="fade" data-reveal-delay="0.6">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Scroll cue */}
      <div aria-hidden className="absolute bottom-8 right-[var(--gutter)] hidden items-center gap-3 md:flex">
        <span className={cn("eyebrow text-[0.62rem]", dark ? "text-ivory/60" : "text-cocoa/55")}>Scroll</span>
        <span className={cn("scroll-cue relative block h-10 w-px overflow-hidden", dark ? "bg-ivory/40" : "bg-cocoa/35")} />
      </div>
    </section>
  );
}
