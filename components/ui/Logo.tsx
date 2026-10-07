import { monogram, wordmark } from "./logo-paths";
import { cn } from "@/lib/utils";

type Mark = { viewBox: string; transform: string; d: string };

function Svg({ mark, className, title }: { mark: Mark; className?: string; title?: string }) {
  return (
    <svg
      viewBox={mark.viewBox}
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g transform={mark.transform}>
        <path d={mark.d} />
      </g>
    </svg>
  );
}

/**
 * Sacred Basil brand mark, traced from the supplied logo
 * (docs/brand/sacred-basil-logo-original.png). Colour follows `currentColor`.
 *   monogram  the SB monogram alone
 *   wordmark  "SACRED BASIL" alone
 *   lockup    monogram above wordmark, as supplied
 */
export function Logo({
  variant = "wordmark",
  className,
}: {
  variant?: "monogram" | "wordmark" | "lockup";
  className?: string;
}) {
  if (variant === "monogram") return <Svg mark={monogram} className={className} title="Sacred Basil" />;
  if (variant === "wordmark") return <Svg mark={wordmark} className={className} title="Sacred Basil" />;
  return (
    <span role="img" aria-label="Sacred Basil" className={cn("inline-flex flex-col items-center", className)}>
      <Svg mark={monogram} className="w-full" />
      <Svg mark={wordmark} className="mt-[9%] w-[85%]" />
    </span>
  );
}
