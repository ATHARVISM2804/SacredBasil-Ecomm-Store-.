import type { AssetKey } from "@/data/assets";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { cn } from "@/lib/utils";

/**
 * Inner-page opening.
 *   "image": full-bleed photograph with the title laid over it (dark header).
 *   "plain": ivory, typographic.
 */
export function PageHero({
  label,
  title,
  intro,
  image,
  variant = image ? "image" : "plain",
  children,
}: {
  label: string;
  title: string;
  intro?: string;
  image?: AssetKey;
  variant?: "image" | "plain";
  children?: React.ReactNode;
}) {
  const dark = variant === "image";

  return (
    <section
      className={cn(
        "relative flex flex-col justify-end overflow-hidden",
        dark ? "min-h-[88svh] bg-chocolate text-ivory" : "bg-ivory pt-44 md:pt-52",
      )}
    >
      {dark && image && (
        <>
          <EditorialImage asset={image} priority reveal={false} quiet fill sizes="100vw" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(0deg,rgb(42_26_18/0.75),rgb(42_26_18/0.15)_55%,rgb(42_26_18/0.35))]"
          />
        </>
      )}
      <div className={cn("shell relative", dark ? "pb-[clamp(3.5rem,9vh,6rem)] pt-40" : "pb-16 md:pb-24")}>
        <p className={cn("eyebrow mb-8", dark ? "text-ivory/70" : "text-cocoa/65")} data-reveal="fade">
          {label}
        </p>
        <h1 className="display-hero max-w-[14ch] text-balance">
          <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask" data-reveal-delay="0.15">
            <span className="block">{title}</span>
          </span>
        </h1>
        {intro && (
          <p
            className={cn("lede mt-8", dark ? "text-ivory/78" : "text-cocoa/72")}
            data-reveal="fade"
            data-reveal-delay="0.45"
          >
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
