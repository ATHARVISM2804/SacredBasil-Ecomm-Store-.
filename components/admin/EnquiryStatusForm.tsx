"use client";

import { useActionState } from "react";
import { updateEnquiryStatus } from "@/lib/admin/actions/enquiries";
import { humanize } from "@/lib/admin/format";
import { ENQUIRY_STATUSES, idleState, type EnquiryStatus } from "@/lib/admin/types";
import { FormMessage, SelectField, SubmitButton } from "./form";

export function EnquiryStatusForm({ id, status }: { id: string; status: EnquiryStatus }) {
  const [state, action] = useActionState(updateEnquiryStatus.bind(null, id), idleState);
  return (
    <form action={action} className="space-y-4">
      <SelectField
        label="Status"
        name="status"
        defaultValue={status}
        options={ENQUIRY_STATUSES.map((s) => ({ value: s, label: humanize(s) }))}
      />
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="Updating…">Update</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
