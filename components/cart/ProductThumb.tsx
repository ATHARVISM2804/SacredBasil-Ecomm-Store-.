import Image from "next/image";
import { cn } from "@/lib/utils";

/** Small product image; remote (storage) URLs are served unoptimised. */
export function ProductThumb({ src, alt, className, sizes = "96px" }: { src?: string; alt: string; className?: string; sizes?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden bg-cream", className)}>
      {src && (
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" unoptimized={/^https?:\/\//.test(src)} />
      )}
    </div>
  );
}
