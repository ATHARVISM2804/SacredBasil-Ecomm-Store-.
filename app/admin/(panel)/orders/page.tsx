import type { Metadata } from "next";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { firstParam, humanize, pageParam, sanitizeSearch } from "@/lib/admin/format";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { Card, EmptyState, ErrorNotice, PageHeader, Pagination } from "@/components/admin/ui";
import { ORDER_LIST_COLUMNS, OrdersTable, type OrderListRow } from "@/components/admin/OrdersTable";
import { btnGhost, inputCls, labelCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Orders" };
const PAGE_SIZE = 25;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = firstParam(sp.status);
  const q = sanitizeSearch(firstParam(sp.q));
  const page = pageParam(sp.page);

  let query = supabase
    .from("orders")
    .select(ORDER_LIST_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if ((ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.*${q}*,email.ilike.*${q}*,customer_name.ilike.*${q}*`);
  const { data, count, error } = await query;
  const orders = (data ?? []) as OrderListRow[];

  return (
    <>
      <PageHeader eyebrow="Sales" title="Orders" />
      {error && <ErrorNotice message={`Could not load orders: ${error.message}`} />}

      <form role="search" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end" action="/admin/orders">
        <div className="flex-1">
          <label htmlFor="q" className={labelCls}>Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Order number, email or name" className={inputCls} />
        </div>
        <div className="sm:w-48">
          <label htmlFor="status" className={labelCls}>Status</label>
          <select id="status" name="status" defaultValue={status} className={inputCls}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{humanize(s)}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={btnGhost}>
          <Search className="size-3.5" aria-hidden /> Filter
        </button>
      </form>

      <Card flush>
        {orders.length ? (
          <OrdersTable orders={orders} />
        ) : (
          <EmptyState title={q || status ? "No matching orders" : "No orders yet"}>
            {q || status ? "Try a different search or status." : "Orders appear here once customers check out."}
          </EmptyState>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/orders" params={{ q, status }} />
      </Card>
    </>
  );
}
