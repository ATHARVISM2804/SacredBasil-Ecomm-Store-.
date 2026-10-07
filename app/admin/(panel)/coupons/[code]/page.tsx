import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import type { CouponRow } from "@/lib/admin/types";
import { Card, PageHeader } from "@/components/admin/ui";
import { CouponForm, DeleteCouponButton } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Edit coupon" };

export default async function EditCouponPage({ params }: { params: Promise<{ code: string }> }) {
  const code = decodeURIComponent((await params).code).toUpperCase();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
  if (!data) notFound();
  const coupon = data as CouponRow;

  return (
    <>
      <PageHeader back={{ href: "/admin/coupons", label: "Coupons" }} eyebrow="Promotions" title={coupon.code} />
      <Card className="max-w-3xl">
        <CouponForm coupon={coupon} />
      </Card>
      <div className="mt-6 max-w-3xl">
        <DeleteCouponButton code={coupon.code} />
      </div>
    </>
  );
}
