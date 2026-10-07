import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import { formatINR } from "@/lib/catalog/pricing";
import { AccountUnavailable } from "../../AccountUnavailable";
import { requireUser } from "../../session";
import { formatDate, orderStatusLabel } from "../../status";

type Props = { params: Promise<{ orderNumber: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Order ${(await params).orderNumber}` };
}

type OrderDetail = {
  order_number: string;
  status: string;
  created_at: string;
  paid_at: string | null;
  customer_name: string;
  phone: string;
  email: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  gift_message: string | null;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total: number;
  tracking_carrier: string | null;
  tracking_number: string | null;
  items: { product_id: string; product_name: string; variant: string | null; quantity: number; unit_price: number; line_total: number }[];
  events: { status: string; note: string | null; created_at: string }[];
};

export default async function AccountOrderPage({ params }: Props) {
  const { orderNumber } = await params;
  const session = await requireUser(`/account/orders/${orderNumber}`);
  if (!session) return <AccountUnavailable />;
  if (!/^SB\d{1,12}$/.test(orderNumber)) notFound();

  // RLS: only this customer's own orders are visible.
  const { data } = await session.supabase
    .from("orders")
    .select(
      "order_number, status, created_at, paid_at, customer_name, phone, email, shipping_address, gift_message, subtotal, discount, coupon_code, shipping_fee, total, tracking_carrier, tracking_number, items:order_items(product_id, product_name, variant, quantity, unit_price, line_total), events:order_events(status, note, created_at)",
    )
    .eq("order_number", orderNumber)
    .eq("user_id", session.user.id)
    .maybeSingle();
  const order = data as OrderDetail | null;
  if (!order) notFound();

  const a = order.shipping_address;
  const events = [...(order.events ?? [])].sort((x, y) => x.created_at.localeCompare(y.created_at));

  return (
    <div className="max-w-4xl">
      <Link href="/account" className="eyebrow text-cocoa/60 hover:text-chocolate">
        ← All orders
      </Link>
      <h1 className="display-section mt-6 text-chocolate">Order {order.order_number}</h1>
      <p className="mt-4 text-cocoa/70">
        Placed {formatDate(order.created_at)} · <span className="text-chocolate">{orderStatusLabel[order.status] ?? order.status}</span>
      </p>

      {order.tracking_number && (
        <div className="mt-10 border border-gold/50 bg-cream/50 p-6">
          <p className="eyebrow text-cocoa/70">Tracking</p>
          <p className="mt-2 font-display text-xl text-chocolate">
            {order.tracking_carrier ? `${order.tracking_carrier} · ` : ""}
            {order.tracking_number}
          </p>
        </div>
      )}

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {order.items.map((i) => (
              <li key={`${i.product_id}-${i.variant ?? ""}`} className="flex justify-between gap-4 py-4">
                <span>
                  <span className="font-display text-lg text-chocolate">{i.product_name}</span>
                  {i.variant && <span className="text-cocoa/60"> · {i.variant}</span>}
                  <span className="block text-sm text-cocoa/60 tabular-nums">
                    {i.quantity} × {formatINR(i.unit_price)}
                  </span>
                </span>
                <span className="tabular-nums">{formatINR(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-cocoa/70">Subtotal</dt>
              <dd className="tabular-nums">{formatINR(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-cocoa/70">Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</dt>
                <dd className="tabular-nums">−{formatINR(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-cocoa/70">Shipping</dt>
              <dd className="tabular-nums">{order.shipping_fee ? formatINR(order.shipping_fee) : "Charged separately"}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="eyebrow text-cocoa/75">Total</dt>
              <dd className="font-display text-2xl text-chocolate tabular-nums">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-8 text-sm">
          <div>
            <p className="eyebrow mb-2 text-cocoa/70">Delivering to</p>
            <p className="text-cocoa/80">
              {order.customer_name}
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {order.phone}
            </p>
          </div>
          {order.gift_message && (
            <div>
              <p className="eyebrow mb-2 text-cocoa/70">Gift message</p>
              <p className="italic text-cocoa/80">“{order.gift_message}”</p>
            </div>
          )}
          {events.length > 0 && (
            <div>
              <p className="eyebrow mb-2 text-cocoa/70">History</p>
              <ol className="space-y-2">
                {events.map((e, i) => (
                  <li key={i} className="text-cocoa/75">
                    <span className="text-chocolate">{orderStatusLabel[e.status] ?? e.status}</span> · {formatDate(e.created_at)}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>

      <p className="mt-14 text-sm text-cocoa/60">
        Questions about this order? Write to{" "}
        <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
          {site.contact.email}
        </a>{" "}
        quoting {order.order_number}.
      </p>
    </div>
  );
}
