import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { istDayStart } from "@/lib/admin/format";
import { PAID_STATUSES, TO_FULFIL_STATUSES } from "@/lib/admin/orders";
import { formatINR } from "@/lib/catalog/pricing";
import { Card, EmptyState, ErrorNotice, PageHeader } from "@/components/admin/ui";
import { ORDER_LIST_COLUMNS, OrdersTable, type OrderListRow } from "@/components/admin/OrdersTable";
import { cardCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const today = istDayStart(0);
  const d7 = istDayStart(6);
  const d30 = istDayStart(29);

  const countSince = (since: string) =>
    supabase.from("orders").select("id", { count: "exact", head: true }).not("status", "in", "(pending,failed)").gte("created_at", since);

  const [cToday, c7, c30, revenue, toFulfil, awaitingPayment, newEnquiries, recent, lowStock] = await Promise.all([
    countSince(today),
    countSince(d7),
    countSince(d30),
    supabase.from("orders").select("total").in("status", PAID_STATUSES).gte("paid_at", d30),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", TO_FULFIL_STATUSES),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("orders").select(ORDER_LIST_COLUMNS).order("created_at", { ascending: false }).limit(8),
    supabase.from("products").select("id, name, stock, status").not("stock", "is", null).lt("stock", 10).order("stock"),
  ]);

  const firstError = [cToday, c7, c30, revenue, toFulfil, awaitingPayment, newEnquiries, recent, lowStock].find((r) => r.error)?.error;
  const revenue30 = (revenue.data ?? []).reduce((sum, o) => sum + (o.total as number), 0);

  const kpis = [
    { label: "Orders today", value: String(cToday.count ?? 0), href: "/admin/orders" },
    { label: "Orders · 7 days", value: String(c7.count ?? 0), href: "/admin/orders" },
    { label: "Orders · 30 days", value: String(c30.count ?? 0), href: "/admin/orders" },
    { label: "Paid revenue · 30 days", value: formatINR(revenue30), href: "/admin/orders" },
    {
      label: "To fulfil",
      value: String(toFulfil.count ?? 0),
      note: `${awaitingPayment.count ?? 0} awaiting payment`,
      href: "/admin/orders?status=paid",
    },
    { label: "New enquiries", value: String(newEnquiries.count ?? 0), href: "/admin/enquiries?status=new" },
  ];

  const lowStockRows = (lowStock.data ?? []) as { id: string; name: string; stock: number; status: string }[];

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" description="Order counts exclude unpaid and failed checkouts. Days are counted in IST." />
      {firstError && <ErrorNotice message={`Some figures could not be loaded: ${firstError.message}`} />}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className={`${cardCls} block p-4 transition-colors hover:bg-white sm:p-5`}>
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-cocoa/60">{k.label}</p>
            <p className="mt-2 font-display text-3xl leading-none text-chocolate tabular-nums">{k.value}</p>
            {k.note && <p className="mt-2 text-xs text-cocoa/55">{k.note}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card
          title="Recent orders"
          flush
          actions={
            <Link href="/admin/orders" className="text-xs uppercase tracking-[0.16em] text-gold hover:text-chocolate">
              All orders
            </Link>
          }
        >
          {recent.data?.length ? (
            <OrdersTable orders={recent.data as OrderListRow[]} />
          ) : (
            <EmptyState title="No orders yet">Orders appear here once customers check out.</EmptyState>
          )}
        </Card>

        <Card title="Low stock">
          {lowStockRows.length ? (
            <ul className="divide-y divide-[var(--line)] text-sm">
              {lowStockRows.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">
                    {p.name}
                    {p.status === "draft" && <span className="ml-1 text-xs text-cocoa/50">(draft)</span>}
                  </Link>
                  <span className={`tabular-nums ${p.stock === 0 ? "text-terracotta" : "text-cocoa/70"}`}>{p.stock}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cocoa/60">No products with fewer than 10 in stock. Made-to-order products are not tracked.</p>
          )}
        </Card>
      </div>
    </>
  );
}
