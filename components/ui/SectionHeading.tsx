import { cn } from "@/lib/utils";

/**
 * Serif section heading with an optional label and supporting line.
 * The heading uses a text-mask reveal.
 */
export function SectionHeading({
  id,
  label,
  title,
  intro,
  as: Tag = "h2",
  size = "section",
  className,
  tone = "dark",
}: {
  id?: string;
  label?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section" | "sub";
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {label && (
        <p className={cn("eyebrow mb-6", tone === "dark" ? "text-cocoa/65" : "text-ivory/70")} data-reveal="fade">
          {label}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          size === "hero" ? "display-hero" : size === "sub" ? "display-sub" : "display-section",
          "text-balance",
        )}
      >
        <span className="block overflow-hidden pb-[0.08em]" data-reveal="mask">
          <span className="block">{title}</span>
        </span>
      </Tag>
      {intro && (
        <p
          className={cn("lede mt-7", tone === "dark" ? "text-cocoa/75" : "text-ivory/75")}
          data-reveal="fade"
          data-reveal-delay="0.15"
        >
          {intro}
        </p>
      )}
    </div>
  );
}
