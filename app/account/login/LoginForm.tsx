"use client";

import { useId, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EMAIL_RE } from "@/lib/cart/validation";

export function LoginForm({ next, linkError, googleEnabled }: { next: string; linkError: boolean; googleEnabled: boolean }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(
    linkError ? "That sign-in link has expired or was already used. Please request a new one." : null,
  );

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setState("sending");
    setMessage(null);
    const { error } = await createSupabaseBrowserClient().auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: redirectTo(), shouldCreateUser: true },
    });
    if (error) {
      setState("error");
      setMessage(
        error.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : "We couldn’t send the link just now. Please try again.",
      );
      return;
    }
    setState("sent");
  };

  const google = async () => {
    setMessage(null);
    const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setState("error");
      setMessage("Google sign-in isn’t available right now. Please use your email.");
    }
  };

  if (state === "sent") {
    return (
      <div className="mt-10 border border-[var(--line)] bg-cream/40 p-6" role="status">
        <p className="font-display text-2xl text-chocolate">Check your email</p>
        <p className="mt-2 text-sm text-cocoa/75">
          We’ve sent a sign-in link to <strong className="font-medium">{email.trim()}</strong>. Open it on this device to
          continue. It may take a minute to arrive — please check your spam folder too.
        </p>
        <button type="button" onClick={() => setState("idle")} className="eyebrow mt-6 text-chocolate underline underline-offset-4">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <form onSubmit={submit} noValidate className="space-y-8">
        <div className="field">
          <label htmlFor={`${id}-email`}>Email</label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={message ? `${id}-msg` : undefined}
            required
          />
        </div>
        {message && (
          <p id={`${id}-msg`} className="text-sm text-terracotta" role="alert">
            {message}
          </p>
        )}
        <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full justify-center disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>
      {googleEnabled && (
        <>
          <p className="my-6 text-center text-xs uppercase tracking-[0.2em] text-cocoa/45">or</p>
          <button type="button" onClick={() => void google()} className="btn w-full justify-center border border-[var(--line)] text-cocoa hover:border-cocoa/40">
            Continue with Google
          </button>
        </>
      )}
      <p className="mt-8 text-sm text-cocoa/60">
        Orders you placed as a guest appear in your account once you sign in with the same email.
      </p>
    </div>
  );
}
