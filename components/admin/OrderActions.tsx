"use client";

import { useActionState } from "react";
import { addOrderNote, updateOrderStatus, updateTracking } from "@/lib/admin/actions/orders";
import { ORDER_TRANSITIONS } from "@/lib/admin/orders";
import { humanize } from "@/lib/admin/format";
import { idleState, type OrderStatus } from "@/lib/admin/types";
import { FormMessage, SelectField, SubmitButton, TextAreaField, TextField } from "./form";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [state, action] = useActionState(updateOrderStatus.bind(null, orderId), idleState);
  const options = ORDER_TRANSITIONS[status];
  if (!options.length) return <p className="text-sm text-cocoa/60">No further status changes for a {status} order.</p>;
  return (
    <form action={action} className="space-y-4">
      <SelectField
        id="order-status"
        label="Move to"
        name="status"
        options={options.map((s) => ({ value: s, label: humanize(s) }))}
        hint={
          options.includes("refunded") || options.includes("cancelled")
            ? "Cancelling a paid order or marking it refunded does not move money. Issue refunds in the Razorpay dashboard first."
            : undefined
        }
      />
      <TextAreaField id="order-status-note" label="Note (optional)" name="note" rows={2} maxLength={1000} />
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="Updating…">Update status</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function TrackingForm({
  orderId,
  carrier,
  number,
}: {
  orderId: string;
  carrier: string | null;
  number: string | null;
}) {
  const [state, action] = useActionState(updateTracking.bind(null, orderId), idleState);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Carrier" name="tracking_carrier" defaultValue={carrier ?? ""} maxLength={120} />
        <TextField label="Tracking number" name="tracking_number" defaultValue={number ?? ""} maxLength={120} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton variant="ghost">Save tracking</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function OrderNoteForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(addOrderNote.bind(null, orderId), idleState);
  return (
    <form action={action} className="space-y-3">
      <TextAreaField
        id="order-note"
        label="Internal note"
        name="note"
        rows={3}
        maxLength={2000}
        error={state.errors?.note}
        hint="Visible to staff only."
      />
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton variant="ghost" pendingLabel="Adding…">Add note</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
