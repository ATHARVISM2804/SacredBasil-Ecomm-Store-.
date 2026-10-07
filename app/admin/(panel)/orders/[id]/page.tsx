import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Printer } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTime, humanize } from "@/lib/admin/format";
import type { OrderEventRow, OrderItemRow, OrderRow } from "@/lib/admin/types";
import { formatINR } from "@/lib/catalog/pricing";
import { Card, DefinitionList, PageHeader, StatusBadge } from "@/components/admin/ui";
import { OrderNoteForm, OrderStatusForm, TrackingForm } from "@/components/admin/OrderActions";
import { btnGhost, tdCls, thCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Order" };

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [{ data: order }, { data: items }, { data: events }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: false }),
  ]);
  if (!order) notFound();
  const o = order as OrderRow;
  const lines = (items ?? []) as OrderItemRow[];
  const timeline = (events ?? []) as OrderEventRow[];

  // Resolve who made each change.
  const actorIds = [...new Set(timeline.map((e) => e.actor).filter((a): a is string => Boolean(a)))];
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", actorIds)
    : { data: [] as { id: string; email: string | null; full_name: string | null }[] };
  const actorName = (id: string | null) => {
    if (!id) return "System";
    const a = actors?.find((x) => x.id === id);
    return a?.full_name || a?.email || "Staff";
  };

  const addr = o.shipping_address ?? {};
  const address = [addr.line1, addr.line2, [addr.city, addr.state].filter(Boolean).join(", "), addr.pincode, addr.country]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/orders", label: "Orders" }}
        eyebrow={`Placed ${formatDateTime(o.created_at)}`}
        title={`Order ${o.order_number}`}
        actions={
          <>
            <StatusBadge status={o.status} />
            <Link href={`/admin/orders/${o.id}/invoice`} className={btnGhost}>
              <Printer className="size-3.5" aria-hidden /> Invoice
            </Link>
            <Link href={`/admin/orders/${o.id}/invoice?view=slip`} className={btnGhost}>
              <Printer className="size-3.5" aria-hidden /> Packing slip
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card title="Items" flush>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-[var(--line)]">
                  <tr>
                    <th scope="col" className={thCls}>Product</th>
                    <th scope="col" className={`${thCls} text-right`}>Qty</th>
                    <th scope="col" className={`${thCls} text-right`}>Unit</th>
                    <th scope="col" className={`${thCls} text-right`}>Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {lines.map((l) => (
                    <tr key={l.id}>
                      <td className={tdCls}>
                        <Link href={`/admin/products/${l.product_id}`} className="hover:underline">
                          {l.product_name}
                        </Link>
                        {l.variant && <div className="text-xs text-cocoa/55">{l.variant}</div>}
                      </td>
                      <td className={`${tdCls} text-right tabular-nums`}>{l.quantity}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{formatINR(l.unit_price)}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{formatINR(l.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto max-w-xs space-y-1.5 px-5 py-5 text-sm sm:px-6">
              <Row label="Subtotal" value={formatINR(o.subtotal)} />
              {o.discount > 0 && (
                <Row label={`Discount${o.coupon_code ? ` (${o.coupon_code})` : ""}`} value={`− ${formatINR(o.discount)}`} />
              )}
              <Row label="Shipping" value={formatINR(o.shipping_fee)} />
              <div className="border-t border-[var(--line)] pt-2">
                <Row label="Total" value={formatINR(o.total)} strong />
              </div>
            </dl>
          </Card>

          <Card title="Timeline">
            {timeline.length ? (
              <ol className="space-y-4">
                {timeline.map((e) => (
                  <li key={e.id} className="grid grid-cols-[auto_1fr] gap-3 text-sm">
                    <span aria-hidden className="mt-1.5 size-2 rounded-full bg-gold" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={e.status} />
                        {e.internal && <span className="text-[0.65rem] uppercase tracking-[0.14em] text-cocoa/50">Internal note</span>}
                        <span className="text-xs text-cocoa/55">
                          {formatDateTime(e.created_at)} · {actorName(e.actor)}
                        </span>
                      </div>
                      {e.note && <p className="mt-1 whitespace-pre-wrap text-cocoa/85">{e.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-cocoa/60">No events recorded yet.</p>
            )}
            <div className="mt-6 border-t border-[var(--line)] pt-6">
              <OrderNoteForm orderId={o.id} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <OrderStatusForm orderId={o.id} status={o.status} />
          </Card>

          <Card title="Shipping">
            <TrackingForm orderId={o.id} carrier={o.tracking_carrier} number={o.tracking_number} />
          </Card>

          <Card title="Customer">
            <DefinitionList
              items={[
                ["Name", o.customer_name],
                ["Email", <a key="e" href={`mailto:${o.email}`} className="hover:underline">{o.email}</a>],
                ["Phone", <a key="p" href={`tel:${o.phone}`} className="hover:underline">{o.phone}</a>],
                ["Account", o.user_id ? <Link key="a" href={`/admin/customers/${o.user_id}`} className="hover:underline">View customer</Link> : "Guest checkout"],
                ["Address", <span key="ad" className="whitespace-pre-line">{address || "—"}</span>],
                ...(o.gift_message ? ([["Gift message", <span key="g" className="whitespace-pre-line">{o.gift_message}</span>]] as [string, React.ReactNode][]) : []),
                ...(o.notes ? ([["Order notes", <span key="n" className="whitespace-pre-line">{o.notes}</span>]] as [string, React.ReactNode][]) : []),
              ]}
            />
          </Card>

          <Card title="Payment">
            <DefinitionList
              items={[
                ["Status", humanize(o.status)],
                ["Paid at", formatDateTime(o.paid_at)],
                ["Razorpay order", <code key="ro" className="text-xs">{o.razorpay_order_id ?? "—"}</code>],
                ["Razorpay payment", <code key="rp" className="text-xs">{o.razorpay_payment_id ?? "—"}</code>],
              ]}
            />
            <p className="mt-5 text-xs leading-relaxed text-cocoa/65">
              Refunds are issued from the Razorpay dashboard: open the payment, choose <em>Issue refund</em>, then mark this
              order refunded here.
            </p>
            <a
              href={
                o.razorpay_payment_id
                  ? `https://dashboard.razorpay.com/app/payments/${encodeURIComponent(o.razorpay_payment_id)}`
                  : "https://dashboard.razorpay.com/app/payments"
              }
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-gold hover:text-chocolate"
            >
              Open in Razorpay <ExternalLink className="size-3" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "font-medium text-chocolate" : "text-cocoa/80"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
