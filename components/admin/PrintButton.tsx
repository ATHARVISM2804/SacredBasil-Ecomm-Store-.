"use client";

import { Printer } from "lucide-react";
import { btnSm } from "./styles";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={`${btnSm} btn-primary`}>
      <Printer className="size-3.5" aria-hidden /> {label}
    </button>
  );
}
