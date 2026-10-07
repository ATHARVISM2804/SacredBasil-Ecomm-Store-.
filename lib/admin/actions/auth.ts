"use server";

import { redirect } from "next/navigation";
import { site } from "@/data/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/admin/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInWithPassword(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { ok: false, message: "Supabase is not configured yet." };
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Enter a valid email address.", errors: { email: "Invalid email" } };
  if (!password) return { ok: false, message: "Enter your password.", errors: { password: "Required" } };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "Email or password is incorrect." };
  redirect("/admin");
}

export async function sendMagicLink(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return { ok: false, message: "Supabase is not configured yet." };
  const email = String(fd.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Enter a valid email address.", errors: { email: "Invalid email" } };

  // Trusted config only; never build auth links from request headers.
  const origin = site.url;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/admin/auth/callback?next=/admin` },
  });
  // Same response whether or not the account exists, so emails cannot be probed.
  if (error && error.status !== 400 && error.status !== 422) {
    return { ok: false, message: "Could not send the link right now. Please try again shortly." };
  }
  return { ok: true, message: "If that email belongs to an admin account, a sign-in link is on its way." };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
