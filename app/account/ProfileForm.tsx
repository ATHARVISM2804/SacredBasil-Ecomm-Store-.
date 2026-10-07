"use client";

import { useActionState, useId } from "react";
import { updateProfile, type ActionResult } from "./actions";

export function ProfileForm({ email, fullName, phone }: { email: string; fullName: string; phone: string }) {
  const id = useId();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateProfile, null);
  const err = (k: string) => state?.fields?.[k];

  return (
    <form action={action} className="space-y-8">
      <div className="field">
        <label htmlFor={`${id}-email`}>Email</label>
        <input id={`${id}-email`} value={email} readOnly disabled />
      </div>
      <div className="field">
        <label htmlFor={`${id}-name`}>Full name</label>
        <input id={`${id}-name`} name="full_name" defaultValue={fullName} autoComplete="name" maxLength={120} aria-invalid={err("full_name") ? true : undefined} />
        {err("full_name") && <p className="text-[0.8rem] text-terracotta">{err("full_name")}</p>}
      </div>
      <div className="field">
        <label htmlFor={`${id}-phone`}>Mobile</label>
        <input id={`${id}-phone`} name="phone" type="tel" defaultValue={phone.replace(/^\+91/, "")} autoComplete="tel-national" aria-invalid={err("phone") ? true : undefined} />
        {err("phone") && <p className="text-[0.8rem] text-terracotta">{err("phone")}</p>}
      </div>
      <div className="flex items-center gap-5">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Saving…" : "Save details"}
        </button>
        {state?.message && (
          <p className={state.ok ? "text-sm text-cocoa/70" : "text-sm text-terracotta"} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
