"use client";

import { useState, useTransition } from "react";
import { deleteCoupon, saveCoupon } from "@/lib/admin/actions/coupons";
import { toLocalInput } from "@/lib/admin/format";
import { idleState, type ActionState, type CouponRow } from "@/lib/admin/types";
import { CheckboxField, FormMessage, SelectField, SubmitButton, TextField, useFormSubmit } from "./form";
import { btnGhost } from "./styles";

export function CouponForm({ coupon }: { coupon?: CouponRow }) {
  const mode = coupon ? "edit" : "create";
  const [state, onSubmit, pending] = useFormSubmit(saveCoupon.bind(null, mode), idleState);
  const [kind, setKind] = useState(coupon?.kind ?? "percent");
  const err = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Code"
          name="code"
          required
          defaultValue={coupon?.code ?? ""}
          readOnly={mode === "edit"}
          autoCapitalize="characters"
          className="[&_input]:uppercase"
          error={err.code}
          hint={mode === "edit" ? "Codes cannot be renamed. Create a new coupon instead." : "Saved in capitals, e.g. DIWALI10."}
        />
        <SelectField
          label="Discount type"
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as CouponRow["kind"])}
          error={err.kind}
          options={[
            { value: "percent", label: "Percent off subtotal" },
            { value: "flat", label: "Flat rupees off" },
          ]}
        />
        <TextField
          label={kind === "percent" ? "Percent off" : "Rupees off"}
          name="value"
          inputMode="numeric"
          required
          defaultValue={coupon?.value ?? ""}
          error={err.value}
        />
        <TextField
          label="Minimum subtotal (₹)"
          name="min_subtotal"
          inputMode="numeric"
          defaultValue={coupon?.min_subtotal ?? 0}
          error={err.min_subtotal}
        />
        <TextField
          label="Starts (IST)"
          name="starts_at"
          type="datetime-local"
          defaultValue={toLocalInput(coupon?.starts_at)}
          error={err.starts_at}
          hint="Blank = immediately."
        />
        <TextField
          label="Ends (IST)"
          name="ends_at"
          type="datetime-local"
          defaultValue={toLocalInput(coupon?.ends_at)}
          error={err.ends_at}
          hint="Blank = no end date."
        />
        <TextField
          label="Usage limit"
          name="usage_limit"
          inputMode="numeric"
          defaultValue={coupon?.usage_limit ?? ""}
          error={err.usage_limit}
          hint={coupon ? `Used ${coupon.used_count} times so far. Blank = unlimited.` : "Blank = unlimited."}
        />
        <CheckboxField label="Active" name="active" defaultChecked={coupon?.active ?? true} className="self-center" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending}>{mode === "create" ? "Create coupon" : "Save coupon"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function DeleteCouponButton({ code }: { code: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionState | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        className={`${btnGhost} text-terracotta disabled:opacity-60`}
        onClick={() => {
          if (!window.confirm(`Delete coupon ${code}? This cannot be undone.`)) return;
          startTransition(async () => setResult(await deleteCoupon(code)));
        }}
      >
        {pending ? "Deleting…" : "Delete coupon"}
      </button>
      {result && !result.ok && (
        <p role="alert" className="text-sm text-terracotta">
          {result.message}
        </p>
      )}
    </div>
  );
}
