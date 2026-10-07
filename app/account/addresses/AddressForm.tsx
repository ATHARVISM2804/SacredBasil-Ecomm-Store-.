"use client";

import { useActionState, useId } from "react";
import { INDIAN_STATES } from "@/lib/cart/validation";
import { saveAddress, type ActionResult } from "../actions";
import type { SavedAddress } from "@/app/checkout/CheckoutForm";

/** Add or edit an address. Remount with a new `key` to reset after saving. */
export function AddressForm({ address, onDone }: { address?: SavedAddress; onDone?: () => void }) {
  const id = useId();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(async (prev, fd) => {
    const result = await saveAddress(prev, fd);
    if (result.ok) onDone?.();
    return result;
  }, null);
  const err = (k: string) => state?.fields?.[k];

  const input = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, className = "") => (
    <div className={`field ${className}`}>
      <label htmlFor={`${id}-${name}`}>{label}</label>
      <input id={`${id}-${name}`} name={name} aria-invalid={err(name) ? true : undefined} {...props} />
      {err(name) && <p className="text-[0.8rem] text-terracotta">{err(name)}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-7" noValidate>
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="grid gap-7 md:grid-cols-2">
        {input("label", "Label (optional)", { defaultValue: address?.label ?? "", placeholder: "Home, Office…", maxLength: 40 })}
        {input("full_name", "Recipient name", { defaultValue: address?.full_name ?? "", autoComplete: "name", maxLength: 120 })}
      </div>
      {input("phone", "Mobile", { defaultValue: address?.phone.replace(/^\+91/, "") ?? "", type: "tel", autoComplete: "tel-national" })}
      {input("line1", "Address", { defaultValue: address?.line1 ?? "", autoComplete: "address-line1", maxLength: 200 })}
      {input("line2", "Area, landmark (optional)", { defaultValue: address?.line2 ?? "", autoComplete: "address-line2", maxLength: 200 })}
      <div className="grid gap-7 md:grid-cols-3">
        {input("city", "City", { defaultValue: address?.city ?? "", autoComplete: "address-level2", maxLength: 80 })}
        <div className="field">
          <label htmlFor={`${id}-state`}>State</label>
          <select id={`${id}-state`} name="state" defaultValue={address?.state ?? ""} aria-invalid={err("state") ? true : undefined}>
            <option value="">Select</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {err("state") && <p className="text-[0.8rem] text-terracotta">{err("state")}</p>}
        </div>
        {input("pincode", "PIN code", { defaultValue: address?.pincode ?? "", inputMode: "numeric", maxLength: 6, autoComplete: "postal-code" })}
      </div>
      <label className="flex items-center gap-3 text-sm text-cocoa/75">
        <input type="checkbox" name="is_default" defaultChecked={address?.is_default} className="size-4 accent-[var(--color-chocolate)]" />
        Use as my default address
      </label>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save address"}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="eyebrow text-cocoa/60 hover:text-chocolate">
            Cancel
          </button>
        )}
        {state?.message && !state.ok && (
          <p className="text-sm text-terracotta" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
