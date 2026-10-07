import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog/types";
import { formatINR, lowestPrice, startingPrice } from "@/lib/catalog/pricing";
import { cn } from "@/lib/utils";

export function ProductCard({
  product: p,
  headingLevel: H = "h3",
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw",
  priority,
  className,
}: {
  product: Product;
  headingLevel?: "h2" | "h3";
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const pieces = p.contents.reduce((n, i) => n + i.quantity, 0);
  const from = startingPrice(p);
  const bulk = lowestPrice(p);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[5/4] overflow-hidden rounded-[3px] bg-cream">
        <Image
          src={p.images[0]}
          alt={p.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-[50%_72%] transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
        />
        <span
          aria-hidden
          className="eyebrow absolute inset-x-0 bottom-0 flex h-11 translate-y-full items-center justify-center bg-chocolate/92 text-ivory transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:translate-y-0"
        >
          View the set
        </span>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <p className="eyebrow text-gold">{pieces} handcrafted pieces</p>
        <H className="mt-2 font-display text-[1.55rem] leading-tight text-chocolate">
          <Link
            href={`/collections/${p.slug}`}
            data-cursor="view"
            className="after:absolute after:inset-0 after:content-['']"
          >
            {p.name}
          </Link>
        </H>
        <p className="mt-2 line-clamp-2 text-[0.92rem] leading-relaxed text-cocoa/70">{p.shortDescription}</p>
        <p className="mt-4 flex items-baseline gap-2 text-chocolate">
          <span className="font-display text-xl">{formatINR(from)}</span>
          {bulk < from && <span className="text-[0.8rem] text-cocoa/60">or {formatINR(bulk)} each in bulk</span>}
        </p>
      </div>
    </article>
  );
}
