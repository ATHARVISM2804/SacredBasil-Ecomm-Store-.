"use client";

import { useState } from "react";
import { saveAnnouncement, saveShipping } from "@/lib/admin/actions/settings";
import type { AnnouncementSetting, ShippingSetting } from "@/lib/admin/settings";
import { idleState } from "@/lib/admin/types";
import { FormMessage, SelectField, SubmitButton, TextAreaField, TextField, useFormSubmit } from "./form";

export function AnnouncementForm({ value }: { value: AnnouncementSetting | null }) {
  const [state, onSubmit, pending] = useFormSubmit(saveAnnouncement, idleState);
  const err = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <TextField
        id="announcement-text"
        label="Text"
        name="text"
        defaultValue={value?.text ?? ""}
        maxLength={160}
        error={err.text}
        hint="Shown in the bar above the site header. Leave blank to hide it."
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="announcement-link" label="Link" name="link" defaultValue={value?.link ?? ""} placeholder="/corporate-gifting" error={err.link} />
        <TextField id="announcement-label" label="Link label" name="linkLabel" defaultValue={value?.linkLabel ?? ""} error={err.linkLabel} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending}>Save announcement</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function ShippingForm({ value }: { value: ShippingSetting | null }) {
  const [state, onSubmit, pending] = useFormSubmit(saveShipping, idleState);
  const [mode, setMode] = useState<ShippingSetting["mode"]>(value?.mode ?? "separate");
  const err = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <SelectField
        id="shipping-mode"
        label="How shipping is charged"
        name="mode"
        value={mode}
        onChange={(e) => setMode(e.target.value as ShippingSetting["mode"])}
        error={err.mode}
        options={[
          { value: "separate", label: "Charged separately (not added at checkout)" },
          { value: "flat", label: "Flat fee on every order" },
          { value: "free_over", label: "Free above a subtotal, flat fee below it" },
        ]}
      />
      {mode !== "separate" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="shipping-flat"
            label="Flat fee (₹)"
            name="flatFee"
            inputMode="numeric"
            defaultValue={value?.flatFee ?? ""}
            error={err.flatFee}
          />
          {mode === "free_over" && (
            <TextField
              id="shipping-free"
              label="Free from subtotal (₹)"
              name="freeOver"
              inputMode="numeric"
              defaultValue={value?.freeOver ?? ""}
              error={err.freeOver}
              hint="Orders at or above this subtotal ship free."
            />
          )}
        </div>
      )}
      <TextAreaField
        id="shipping-note"
        label="Note shown to customers"
        name="note"
        rows={3}
        maxLength={300}
        defaultValue={value?.note ?? ""}
        error={err.note}
      />
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending}>Save shipping</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
