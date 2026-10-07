import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import type { AnnouncementSetting, ShippingSetting } from "@/lib/admin/settings";
import { Card, ErrorNotice, PageHeader } from "@/components/admin/ui";
import { AnnouncementForm, ShippingForm } from "@/components/admin/SettingsForms";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("settings").select("key, value").in("key", ["announcement", "shipping"]);
  const get = <T,>(key: string) => (data?.find((r) => r.key === key)?.value as T | undefined) ?? null;

  return (
    <>
      <PageHeader eyebrow="Store" title="Settings" />
      {error && <ErrorNotice message={`Could not load settings: ${error.message}`} />}
      <div className="grid max-w-3xl gap-6">
        <Card title="Announcement bar">
          <AnnouncementForm value={get<AnnouncementSetting>("announcement")} />
        </Card>
        <Card title="Shipping">
          <ShippingForm value={get<ShippingSetting>("shipping")} />
        </Card>
      </div>
    </>
  );
}
