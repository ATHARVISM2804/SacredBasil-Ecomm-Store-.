import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "light" | "text";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  light: "btn-light",
  text: "btn-text",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  arrow = true,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={cn("btn", variants[variant], className)} data-cursor="open">
      <span>{children}</span>
      {arrow && <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />}
    </Link>
  );
}
