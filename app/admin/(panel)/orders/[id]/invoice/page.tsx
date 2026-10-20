import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { requireAdmin } from "@/lib/admin/auth";
import { firstParam, formatDate } from "@/lib/admin/format";
import type { OrderItemRow, OrderRow } from "@/lib/admin/types";
import { formatINR } from "@/lib/catalog/pricing";
import { Logo } from "@/components/ui/Logo";
import { PrintButton } from "@/components/admin/PrintButton";
import { btnGhost } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Invoice" };

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const slip = firstParam(sp.view) === "slip";
  const { supabase } = await requireAdmin();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);
  if (!order) notFound();
  const o = order as OrderRow;
  const lines = (items ?? []) as OrderItemRow[];
  const a = o.shipping_address ?? {};
  const docTitle = slip ? "Packing slip" : "Invoice";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/admin/orders/${o.id}`} className="text-xs uppercase tracking-[0.18em] text-cocoa/60 hover:text-cocoa">
          ← Order {o.order_number}
        </Link>
        <div className="flex gap-2">
          <Link href={`/admin/orders/${o.id}/invoice${slip ? "" : "?view=slip"}`} className={btnGhost}>
            {slip ? "Show invoice" : "Show packing slip"}
          </Link>
          <PrintButton label={`Print ${docTitle.toLowerCase()}`} />
        </div>
      </div>

      <article className="mx-auto max-w-[800px] bg-white p-8 text-sm text-cocoa shadow-[0_1px_0_var(--line)] sm:p-12 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex flex-col justify-between gap-6 border-b border-[var(--line)] pb-8 sm:flex-row">
          <div>
            <Logo variant="lockup" className="w-28 text-chocolate" />
          </div>
          <div className="text-left sm:text-right">
            <h1 className="font-display text-4xl font-light text-chocolate">{docTitle}</h1>
            <p className="mt-2">
              Order <strong>{o.order_number}</strong>
            </p>
            <p className="text-cocoa/70">{formatDate(o.paid_at ?? o.created_at)}</p>
          </div>
        </header>

        <section className="grid gap-8 py-8 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-2 text-cocoa/60">From</p>
            <p className="font-medium">{site.name}</p>
            <p className="whitespace-pre-line text-cocoa/80">{site.contact.address}</p>
            <p className="text-cocoa/80">{site.contact.email}</p>
          </div>
          <div>
            <p className="eyebrow mb-2 text-cocoa/60">Ship to</p>
            <p className="font-medium">{a.recipientName || o.customer_name}</p>
            <p className="text-cocoa/80">
              {[a.line1, a.line2].filter(Boolean).join(", ")}
              <br />
              {[a.city, a.state, a.pincode].filter(Boolean).join(", ")}
              {a.country && (
                <>
                  <br />
                  {a.country}
                </>
              )}
            </p>
            <p className="text-cocoa/80">{a.recipientPhone || o.phone}</p>
            {!slip && <p className="text-cocoa/80">{o.email}</p>}
            {!slip && a.recipientName && <p className="mt-2 text-cocoa/60">Ordered by {o.customer_name}</p>}
          </div>
        </section>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y border-[var(--line)] text-left text-[0.65rem] uppercase tracking-[0.16em] text-cocoa/60">
              <th scope="col" className="py-2.5 pr-3 font-medium">Item</th>
              <th scope="col" className="py-2.5 px-3 text-right font-medium">Qty</th>
              {!slip && <th scope="col" className="py-2.5 px-3 text-right font-medium">Unit price</th>}
              {!slip && <th scope="col" className="py-2.5 pl-3 text-right font-medium">Amount</th>}
              {slip && <th scope="col" className="py-2.5 pl-3 text-right font-medium">Packed</th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-b border-[var(--line)]">
                <td className="py-3 pr-3">
                  {l.product_name}
                  {l.variant && <span className="text-cocoa/60"> — {l.variant}</span>}
                </td>
                <td className="py-3 px-3 text-right tabular-nums">{l.quantity}</td>
                {!slip && <td className="py-3 px-3 text-right tabular-nums">{formatINR(l.unit_price)}</td>}
                {!slip && <td className="py-3 pl-3 text-right tabular-nums">{formatINR(l.line_total)}</td>}
                {slip && (
                  <td className="py-3 pl-3 text-right">
                    <span aria-hidden className="inline-block size-4 border border-cocoa/50" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!slip && (
          <dl className="ml-auto mt-6 max-w-xs space-y-1.5">
            <TotalRow label="Subtotal" value={formatINR(o.subtotal)} />
            {o.discount > 0 && (
              <TotalRow label={`Discount${o.coupon_code ? ` (${o.coupon_code})` : ""}`} value={`− ${formatINR(o.discount)}`} />
            )}
            <TotalRow label="Shipping" value={formatINR(o.shipping_fee)} />
            <div className="border-t border-cocoa/40 pt-2 font-medium text-chocolate">
              <TotalRow label="Total" value={formatINR(o.total)} />
            </div>
            {o.razorpay_payment_id && (
              <p className="pt-2 text-xs text-cocoa/60">Paid online · Ref {o.razorpay_payment_id}</p>
            )}
          </dl>
        )}

        {o.gift_message && (
          <section className="mt-10 border-t border-[var(--line)] pt-6">
            <p className="eyebrow mb-2 text-cocoa/60">Gift message</p>
            <p className="whitespace-pre-line font-display text-lg italic">{o.gift_message}</p>
          </section>
        )}

        <footer className="mt-12 border-t border-[var(--line)] pt-6 text-center text-xs text-cocoa/60">
          {site.statement}
        </footer>
      </article>
    </>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
