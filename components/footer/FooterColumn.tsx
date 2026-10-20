"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Footer link column: folds behind its heading on phones, always open from lg. */
export function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <nav aria-label={title} className="border-b border-ivory/10 lg:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-5 text-[0.75rem] uppercase tracking-[0.18em] text-champagne lg:hidden"
      >
        {title}
        <Plus aria-hidden className={cn("size-4 transition-transform duration-300", open && "rotate-45")} strokeWidth={1.25} />
      </button>
      <p className="hidden text-[0.75rem] uppercase tracking-[0.18em] text-champagne lg:block">{title}</p>
      <ul id={id} className={cn("space-y-3 pb-6 text-[0.95rem] text-ivory/70 lg:mt-6 lg:block lg:pb-0", !open && "hidden")}>
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="transition-colors hover:text-ivory">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
