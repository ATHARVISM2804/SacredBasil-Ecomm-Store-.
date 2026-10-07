import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { humanize } from "@/lib/admin/format";
import { cardCls } from "./styles";

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  back,
}: {
  title: string;
  eyebrow?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
      <div>
        {back && (
          <Link
            href={back.href}
            className="mb-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-cocoa/60 hover:text-cocoa"
          >
            <ChevronLeft className="size-3.5" aria-hidden /> {back.label}
          </Link>
        )}
        {eyebrow && <p className="eyebrow mb-2 text-gold">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-light leading-tight text-chocolate">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-cocoa/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  children,
  className,
  actions,
  flush = false,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  /** Content spans edge to edge (tables). */
  flush?: boolean;
}) {
  return (
    <section className={cn(cardCls, !flush && "p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className={cn("mb-4 flex items-center justify-between gap-3", flush && "px-5 pt-5 sm:px-6")}>
          {title && <h2 className="font-display text-2xl font-normal text-chocolate">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const tones: Record<string, string> = {
  pending: "bg-sand/50 text-cocoa",
  paid: "bg-champagne/60 text-chocolate",
  processing: "bg-champagne/60 text-chocolate",
  packed: "bg-latte/30 text-chocolate",
  shipped: "bg-sage/25 text-chocolate",
  delivered: "bg-sage/45 text-chocolate",
  cancelled: "bg-rose/25 text-cocoa",
  refunded: "bg-rose/25 text-cocoa",
  failed: "bg-terracotta/20 text-terracotta",
  new: "bg-champagne/70 text-chocolate",
  in_progress: "bg-latte/30 text-chocolate",
  quoted: "bg-sand/60 text-chocolate",
  won: "bg-sage/45 text-chocolate",
  closed: "bg-cream text-cocoa/70",
  active: "bg-sage/40 text-chocolate",
  draft: "bg-cream text-cocoa/70",
  inactive: "bg-cream text-cocoa/70",
  admin: "bg-chocolate text-ivory",
  customer: "bg-cream text-cocoa/70",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-[2px] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]",
        tones[status] ?? "bg-cream text-cocoa",
      )}
    >
      {humanize(status)}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="font-display text-2xl text-chocolate">{title}</p>
      {children && <div className="mt-2 text-sm text-cocoa/65">{children}</div>}
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div role="alert" className="mb-6 rounded-[2px] border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
      {message}
    </div>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" className="mb-6 rounded-[2px] border border-sage/50 bg-sage/15 px-4 py-3 text-sm text-chocolate">
      {children}
    </div>
  );
}

/** Prev/next pagination that keeps the other query parameters. */
export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  params,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => v)), page: String(p) });
    return `${basePath}?${q.toString()}`;
  };
  const link = "inline-flex items-center gap-1 rounded-[2px] border border-[var(--line)] px-3 py-1.5 text-xs hover:bg-cream";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-[var(--line)] px-4 py-3 text-sm">
      <span className="text-cocoa/60">
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link className={link} href={href(page - 1)}>
            <ChevronLeft className="size-3.5" aria-hidden /> Previous
          </Link>
        )}
        {page < pages && (
          <Link className={link} href={href(page + 1)}>
            Next <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </nav>
  );
}

export function DefinitionList({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-cocoa/55 sm:pt-0.5">{k}</dt>
          <dd className="break-words text-cocoa">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
