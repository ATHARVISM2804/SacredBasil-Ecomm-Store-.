import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { formatDateTime, humanize } from "@/lib/admin/format";
import type { EnquiryRow } from "@/lib/admin/types";
import { Card, DefinitionList, PageHeader, StatusBadge } from "@/components/admin/ui";
import { EnquiryStatusForm } from "@/components/admin/EnquiryStatusForm";

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const e = data as EnquiryRow;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/enquiries", label: "Enquiries" }}
        eyebrow={`${humanize(e.kind)} enquiry · ${formatDateTime(e.created_at)}`}
        title={e.name}
        actions={<StatusBadge status={e.status} />}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title="Details">
            <DefinitionList
              items={[
                ["Email", <a key="e" href={`mailto:${e.email}`} className="hover:underline">{e.email}</a>],
                ["Phone", e.phone ? <a key="p" href={`tel:${e.phone}`} className="hover:underline">{e.phone}</a> : "—"],
                ["Company", e.company ?? "—"],
                ["Quantity", e.quantity ?? "—"],
                ["Occasion", e.occasion ?? "—"],
                ["Collection", e.collection ?? "—"],
                ["Budget", e.budget ?? "—"],
                ["Deliver to", e.delivery_location ?? "—"],
              ]}
            />
          </Card>
          <Card title="Message">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-cocoa/85">{e.message || "No message."}</p>
          </Card>
        </div>
        <Card title="Pipeline">
          <EnquiryStatusForm id={e.id} status={e.status} />
          <a
            href={`mailto:${e.email}?subject=${encodeURIComponent("Your Sacred Basil enquiry")}`}
            className="mt-6 inline-block text-xs uppercase tracking-[0.16em] text-gold hover:text-chocolate"
          >
            Reply by email
          </a>
        </Card>
      </div>
    </>
  );
}
