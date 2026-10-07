import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { firstParam, formatDateTime } from "@/lib/admin/format";
import type { CouponRow } from "@/lib/admin/types";
import { formatINR } from "@/lib/catalog/pricing";
import { Card, EmptyState, ErrorNotice, Notice, PageHeader, StatusBadge } from "@/components/admin/ui";
import { btnSm, tdCls, thCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Coupons" };

function couponState(c: CouponRow, now: number) {
  if (!c.active) return "inactive";
  if (c.starts_at && Date.parse(c.starts_at) > now) return "scheduled";
  if (c.ends_at && Date.parse(c.ends_at) < now) return "expired";
  if (c.usage_limit !== null && c.used_count >= c.usage_limit) return "used up";
  return "active";
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  const coupons = (data ?? []) as CouponRow[];
  // eslint-disable-next-line react-hooks/purity -- server component, rendered per request
  const now = Date.now();
  const created = firstParam(sp.created);
  const deleted = firstParam(sp.deleted);

  return (
    <>
      <PageHeader
        eyebrow="Promotions"
        title="Coupons"
        actions={
          <Link href="/admin/coupons/new" className={`${btnSm} btn-primary`}>
            <Plus className="size-3.5" aria-hidden /> New coupon
          </Link>
        }
      />
      {created && <Notice>Coupon {created} created.</Notice>}
      {deleted && <Notice>Coupon {deleted} deleted.</Notice>}
      {error && <ErrorNotice message={`Could not load coupons: ${error.message}`} />}
      <Card flush>
        {coupons.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-[var(--line)]">
                <tr>
                  <th scope="col" className={thCls}>Code</th>
                  <th scope="col" className={thCls}>Discount</th>
                  <th scope="col" className={thCls}>Min subtotal</th>
                  <th scope="col" className={thCls}>Valid</th>
                  <th scope="col" className={`${thCls} text-right`}>Used</th>
                  <th scope="col" className={thCls}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-cream/50">
                    <td className={tdCls}>
                      <Link href={`/admin/coupons/${encodeURIComponent(c.code)}`} className="font-mono font-medium text-chocolate hover:underline">
                        {c.code}
                      </Link>
                    </td>
                    <td className={tdCls}>{c.kind === "percent" ? `${c.value}%` : formatINR(c.value)}</td>
                    <td className={tdCls}>{c.min_subtotal ? formatINR(c.min_subtotal) : "—"}</td>
                    <td className={`${tdCls} text-xs text-cocoa/70`}>
                      {c.starts_at || c.ends_at ? (
                        <>
                          {c.starts_at ? formatDateTime(c.starts_at) : "Now"} → {c.ends_at ? formatDateTime(c.ends_at) : "no end"}
                        </>
                      ) : (
                        "Always"
                      )}
                    </td>
                    <td className={`${tdCls} text-right tabular-nums`}>
                      {c.used_count}
                      {c.usage_limit !== null && <span className="text-cocoa/50"> / {c.usage_limit}</span>}
                    </td>
                    <td className={tdCls}><StatusBadge status={couponState(c, now)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No coupons yet" />
        )}
      </Card>
    </>
  );
}
