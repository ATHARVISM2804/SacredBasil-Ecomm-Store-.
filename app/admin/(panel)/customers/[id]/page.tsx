import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { summarise } from "@/lib/admin/customers";
import { formatDate } from "@/lib/admin/format";
import type { ProfileRow } from "@/lib/admin/types";
import { formatINR } from "@/lib/catalog/pricing";
import { Card, DefinitionList, EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";
import { ORDER_LIST_COLUMNS, OrdersTable, type OrderListRow } from "@/components/admin/OrdersTable";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as ProfileRow;

  const [byUser, byEmail] = await Promise.all([
    supabase.from("orders").select(`${ORDER_LIST_COLUMNS}, user_id`).eq("user_id", id).order("created_at", { ascending: false }),
    p.email
      ? supabase.from("orders").select(`${ORDER_LIST_COLUMNS}, user_id`).ilike("email", p.email.replace(/[%_\\]/g, "\\$&")).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const map = new Map<string, OrderListRow & { user_id: string | null }>();
  for (const o of [...(byUser.data ?? []), ...(byEmail.data ?? [])] as (OrderListRow & { user_id: string | null })[]) map.set(o.id, o);
  const orders = [...map.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const stats = summarise(p, orders);

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        eyebrow={`Joined ${formatDate(p.created_at)}`}
        title={p.full_name || p.email || "Customer"}
        actions={<StatusBadge status={p.role} />}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Card title="Orders" flush>
          {orders.length ? (
            <OrdersTable orders={orders} />
          ) : (
            <EmptyState title="No orders yet" />
          )}
        </Card>
        <Card title="Profile">
          <DefinitionList
            items={[
              ["Email", p.email ? <a key="e" href={`mailto:${p.email}`} className="hover:underline">{p.email}</a> : "—"],
              ["Phone", p.phone ?? "—"],
              ["Orders", String(stats.orders)],
              ["Total spend", formatINR(stats.spend)],
            ]}
          />
          <p className="mt-5 text-xs text-cocoa/55">Includes guest orders placed with the same email.</p>
        </Card>
      </div>
    </>
  );
}
