import Image from "next/image";
import { assets, type Asset, type AssetKey } from "@/data/assets";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

type Props = {
  asset: AssetKey | Asset;
  className?: string;
  /** Fill the nearest positioned parent instead of sizing itself. */
  fill?: boolean;
  /** next/image `sizes`, describing the rendered width. */
  sizes?: string;
  priority?: boolean;
  reveal?: boolean;
  revealDelay?: number;
  /** Scale image on hover of a parent `.group`. */
  hoverZoom?: boolean;
  /** Placeholder without monogram or caption, e.g. behind full-bleed hero text. */
  quiet?: boolean;
};

/**
 * The single image primitive for the site. Renders the Sacred Basil
 * photograph when delivered, otherwise an art-directed tonal placeholder
 * carrying the brief for that frame.
 */
export function EditorialImage({
  asset,
  className,
  fill,
  sizes = "100vw",
  priority,
  reveal = true,
  revealDelay,
  hoverZoom,
  quiet,
}: Props) {
  const a = typeof asset === "string" ? assets[asset] : asset;

  return (
    <div
      className={cn(fill ? "absolute inset-0" : "relative", "overflow-hidden", className)}
      data-reveal={reveal ? "image" : undefined}
      data-reveal-delay={revealDelay}
    >
      <div
        data-reveal-media
        className={cn(
          "absolute inset-0",
          hoverZoom && "transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.035]",
        )}
      >
        {a.src ? (
          <Image src={a.src} alt={a.alt} fill sizes={sizes} priority={priority} className="object-cover" />
        ) : (
          <Placeholder asset={a} quiet={quiet} />
        )}
      </div>
    </div>
  );
}

/**
 * Until photography is delivered: a quiet product stage, soft top light,
 * a floor shadow and the SB monogram debossed at the centre, the way it
 * would be pressed into packaging.
 */
function Placeholder({ asset, quiet }: { asset: Asset; quiet?: boolean }) {
  const dark = asset.tone === "dark";
  return (
    <div
      role="img"
      aria-label={asset.alt}
      data-brief={asset.brief}
      className={cn("absolute inset-0", dark ? "bg-chocolate" : "bg-cream")}
    >
      <div
        aria-hidden
        className={cn(
          "absolute inset-0",
          dark
            ? "bg-[radial-gradient(120%_80%_at_50%_0%,rgb(220_194_151/0.16),transparent_60%),linear-gradient(180deg,transparent_55%,rgb(42_26_18/0.85))]"
            : "bg-[radial-gradient(120%_80%_at_50%_0%,rgb(250_246_240/0.95),transparent_62%),linear-gradient(180deg,transparent_58%,rgb(205_185_156/0.55))]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute bottom-[16%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-[50%] blur-xl",
          dark ? "bg-black/35" : "bg-cocoa/12",
        )}
      />
      {!quiet && (
        <Logo
          variant="monogram"
          className={cn(
            "absolute left-1/2 top-[44%] w-[26%] max-w-40 -translate-x-1/2 -translate-y-1/2",
            dark
              ? "text-champagne/14 drop-shadow-[0_1px_0_rgb(0_0_0/0.35)]"
              : "text-sand/45 drop-shadow-[0_1px_0_rgb(255_255_255/0.8)]",
          )}
        />
      )}
      {site.showPlaceholderCaptions && !quiet && (
        <p
          aria-hidden
          className={cn(
            "absolute bottom-4 left-4 right-4 font-display text-[0.95rem] italic leading-snug",
            dark ? "text-ivory/55" : "text-cocoa/50",
          )}
        >
          {asset.brief}
        </p>
      )}
    </div>
  );
}
