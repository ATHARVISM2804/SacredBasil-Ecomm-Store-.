import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { ordersForProfiles, summarise } from "@/lib/admin/customers";
import { firstParam, formatDate, pageParam, sanitizeSearch } from "@/lib/admin/format";
import type { ProfileRow } from "@/lib/admin/types";
import { formatINR } from "@/lib/catalog/pricing";
import { Card, EmptyState, ErrorNotice, PageHeader, Pagination, StatusBadge } from "@/components/admin/ui";
import { btnGhost, inputCls, labelCls, tdCls, thCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Customers" };
const PAGE_SIZE = 30;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = sanitizeSearch(firstParam(sp.q));
  const page = pageParam(sp.page);

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.or(`email.ilike.*${q}*,full_name.ilike.*${q}*,phone.ilike.*${q}*`);
  const { data, count, error } = await query;
  const profiles = (data ?? []) as ProfileRow[];
  const orders = await ordersForProfiles(supabase, profiles);

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="Registered accounts. Order counts exclude unpaid checkouts; spend counts paid orders only."
      />
      {error && <ErrorNotice message={`Could not load customers: ${error.message}`} />}
      <form role="search" action="/admin/customers" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="q" className={labelCls}>Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, email or phone" className={inputCls} />
        </div>
        <button type="submit" className={btnGhost}>
          <Search className="size-3.5" aria-hidden /> Search
        </button>
      </form>
      <Card flush>
        {profiles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  <th scope="col" className={thCls}>Customer</th>
                  <th scope="col" className={thCls}>Joined</th>
                  <th scope="col" className={`${thCls} text-right`}>Orders</th>
                  <th scope="col" className={`${thCls} text-right`}>Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {profiles.map((p) => {
                  const s = summarise(p, orders);
                  return (
                    <tr key={p.id} className="hover:bg-cream/50">
                      <td className={tdCls}>
                        <Link href={`/admin/customers/${p.id}`} className="font-medium text-chocolate hover:underline">
                          {p.full_name || p.email || "Unnamed"}
                        </Link>
                        {p.role === "admin" && <span className="ml-2"><StatusBadge status="admin" /></span>}
                        <div className="text-xs text-cocoa/55">{p.email}</div>
                      </td>
                      <td className={`${tdCls} text-cocoa/70`}>{formatDate(p.created_at)}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{s.orders}</td>
                      <td className={`${tdCls} text-right tabular-nums`}>{formatINR(s.spend)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title={q ? "No matching customers" : "No customers yet"} />
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/customers" params={{ q }} />
      </Card>
    </>
  );
}
