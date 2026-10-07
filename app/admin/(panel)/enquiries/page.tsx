import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { firstParam, formatDateTime, humanize, pageParam } from "@/lib/admin/format";
import { ENQUIRY_STATUSES, type EnquiryRow } from "@/lib/admin/types";
import { Card, EmptyState, ErrorNotice, PageHeader, Pagination, StatusBadge } from "@/components/admin/ui";
import { tdCls, thCls } from "@/components/admin/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };
const PAGE_SIZE = 25;

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = firstParam(sp.status);
  const page = pageParam(sp.page);

  let query = supabase
    .from("enquiries")
    .select("id, kind, name, email, company, quantity, occasion, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if ((ENQUIRY_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const { data, count, error } = await query;
  const rows = (data ?? []) as EnquiryRow[];

  const tab = (value: string, label: string) => (
    <Link
      key={value}
      href={value ? `/admin/enquiries?status=${value}` : "/admin/enquiries"}
      aria-current={status === value ? "page" : undefined}
      className={cn(
        "rounded-[2px] px-3 py-1.5 text-xs uppercase tracking-[0.14em]",
        status === value ? "bg-chocolate text-ivory" : "text-cocoa/70 hover:bg-cream",
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <PageHeader eyebrow="Leads" title="Enquiries" description="Corporate and general enquiries sent from the website." />
      {error && <ErrorNotice message={`Could not load enquiries: ${error.message}`} />}
      <nav aria-label="Filter by status" className="mb-5 flex flex-wrap gap-1">
        {tab("", "All")}
        {ENQUIRY_STATUSES.map((s) => tab(s, humanize(s)))}
      </nav>
      <Card flush>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  <th scope="col" className={thCls}>From</th>
                  <th scope="col" className={thCls}>Type</th>
                  <th scope="col" className={thCls}>Quantity / occasion</th>
                  <th scope="col" className={thCls}>Received</th>
                  <th scope="col" className={thCls}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {rows.map((e) => (
                  <tr key={e.id} className="hover:bg-cream/50">
                    <td className={tdCls}>
                      <Link href={`/admin/enquiries/${e.id}`} className="font-medium text-chocolate hover:underline">
                        {e.name}
                      </Link>
                      <div className="text-xs text-cocoa/55">{e.company ? `${e.company} · ` : ""}{e.email}</div>
                    </td>
                    <td className={tdCls}>{humanize(e.kind)}</td>
                    <td className={`${tdCls} text-cocoa/75`}>{[e.quantity, e.occasion].filter(Boolean).join(" · ") || "—"}</td>
                    <td className={`${tdCls} whitespace-nowrap text-cocoa/70`}>{formatDateTime(e.created_at)}</td>
                    <td className={tdCls}><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No enquiries">{status ? "Nothing with this status." : "Enquiries from the website appear here."}</EmptyState>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} basePath="/admin/enquiries" params={{ status }} />
      </Card>
    </>
  );
}
