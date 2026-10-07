"use client";

import { useState } from "react";
import { sendMagicLink, signInWithPassword } from "@/lib/admin/actions/auth";
import { idleState } from "@/lib/admin/types";
import { FormMessage, SubmitButton, TextField, useFormSubmit } from "./form";

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [pwState, onPwSubmit, pwPending] = useFormSubmit(signInWithPassword, idleState);
  const [linkState, onLinkSubmit, linkPending] = useFormSubmit(sendMagicLink, idleState);

  return (
    <div>
      {mode === "password" ? (
        <form onSubmit={onPwSubmit} className="space-y-5" noValidate>
          <TextField label="Email" name="email" type="email" autoComplete="email" required error={pwState.errors?.email} />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={pwState.errors?.password}
          />
          <FormMessage state={pwState} />
          <SubmitButton pending={pwPending} pendingLabel="Signing in…" className="w-full justify-center">
            Sign in
          </SubmitButton>
        </form>
      ) : (
        <form onSubmit={onLinkSubmit} className="space-y-5" noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            error={linkState.errors?.email}
            hint="We will email you a one-time sign-in link."
          />
          <FormMessage state={linkState} />
          <SubmitButton pending={linkPending} pendingLabel="Sending…" className="w-full justify-center">
            Email me a link
          </SubmitButton>
        </form>
      )}
      <button
        type="button"
        onClick={() => setMode((m) => (m === "password" ? "link" : "password"))}
        className="mt-6 text-xs uppercase tracking-[0.18em] text-cocoa/60 underline-offset-4 hover:text-cocoa hover:underline"
      >
        {mode === "password" ? "Send me a magic link instead" : "Sign in with a password instead"}
      </button>
    </div>
  );
}
