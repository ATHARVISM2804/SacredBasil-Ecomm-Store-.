import type { Metadata } from "next";
import Link from "next/link";
import { orderTerms, site } from "@/data/site";
import { formatINR } from "@/lib/catalog/pricing";
import { isAdminDbConfigured } from "@/lib/payments/config";
import { verifyReceiptToken } from "@/lib/payments/receipt";
import { getOrderByNumber, type OrderWithItems } from "@/lib/payments/orders";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ order?: string | string[]; token?: string | string[] }> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function loadOrder(orderNumber: string, token: string): Promise<OrderWithItems | null> {
  if (!/^SB\d{1,12}$/.test(orderNumber) || !isAdminDbConfigured()) return null;
  if (!verifyReceiptToken(orderNumber, token)) return null;
  try {
    return await getOrderByNumber(orderNumber);
  } catch (error) {
    console.error("[checkout/success]", error);
    return null;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderNumber = one(params.order);
  const order = await loadOrder(orderNumber, one(params.token));

  if (!order) {
    return (
      <section className="bg-ivory pb-24 pt-12 md:pb-32 md:pt-16">
        <div className="shell max-w-2xl">
          <p className="eyebrow mb-6 text-cocoa/65">Order</p>
          <h1 className="display-section text-chocolate">We couldn’t find that order</h1>
          <p className="lede mt-8 text-cocoa/72">
            This link may be incomplete. If you’ve paid, your confirmation email has your order details. For any help,
            write to{" "}
            <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
              {site.contact.email}
            </a>
            .
          </p>
          <Link href="/collections" className="btn btn-primary mt-10">
            Back to the collections
          </Link>
        </div>
      </section>
    );
  }

  const paid = order.status !== "pending" && order.status !== "failed";
  const first = order.customer_name.split(" ")[0];
  const a = order.shipping_address;

  return (
    <section className="bg-ivory pb-24 pt-12 md:pb-32 md:pt-16">
      <div className="shell max-w-3xl">
        <p className="eyebrow mb-6 text-gold">Order {order.order_number}</p>
        <h1 className="display-section text-chocolate">
          {paid ? `Thank you, ${first}` : "We’re confirming your payment"}
        </h1>
        <p className="lede mt-8 text-cocoa/72">
          {paid
            ? `Your payment has been received and your order is confirmed. A confirmation has been sent to ${order.email}.`
            : `This usually takes a moment. Once your payment is confirmed you’ll receive an email at ${order.email}. Please don’t pay again.`}
        </p>

        <div className="mt-14 border border-[var(--line)] bg-cream/40 p-6 md:p-10">
          <h2 className="eyebrow text-cocoa/70">Your order</h2>
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {order.items.map((i) => (
              <li key={`${i.product_id}-${i.variant ?? ""}`} className="flex justify-between gap-4 py-3">
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
          <dl className="mt-4 space-y-2 border-t border-[var(--line)] pt-4 text-sm">
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
              <dt className="eyebrow text-cocoa/75">{paid ? "Total paid" : "Total"}</dt>
              <dd className="font-display text-2xl text-chocolate tabular-nums">{formatINR(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-cocoa/70">
            Delivering to {a.city}, {a.state} {a.pincode}
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="display-sub text-chocolate">What happens next</h2>
            <p className="mt-4 text-cocoa/75">{orderTerms.productionTime}</p>
          </div>
          <div>
            <h2 className="display-sub text-chocolate">Delivery</h2>
            <p className="mt-4 text-cocoa/75">
              {order.shipping_fee
                ? orderTerms.delivery
                : `${orderTerms.shipping} We’ll be in touch with the shipping cost and the best option for your destination.`}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link href="/collections" className="btn btn-primary">
            Continue shopping
          </Link>
          <Link href="/account" className="btn btn-text text-cocoa/75 hover:text-chocolate">
            Your account
          </Link>
        </div>
        <p className="mt-10 text-sm text-cocoa/60">
          Questions about your order? Write to{" "}
          <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
            {site.contact.email}
          </a>{" "}
          quoting {order.order_number}.
        </p>
      </div>
    </section>
  );
}
