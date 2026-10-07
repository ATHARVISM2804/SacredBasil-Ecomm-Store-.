import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { Card, PageHeader } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "New coupon" };

export default async function NewCouponPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader back={{ href: "/admin/coupons", label: "Coupons" }} eyebrow="Promotions" title="New coupon" />
      <Card className="max-w-3xl">
        <CouponForm />
      </Card>
    </>
  );
}
