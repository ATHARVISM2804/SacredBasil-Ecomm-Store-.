import "server-only";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminDbConfigured } from "@/lib/payments/config";

/**
 * The signed-in customer for an /account page, or a redirect to sign in.
 * Returns null only when accounts are not configured at all.
 */
export async function requireUser(next: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return { supabase, user: data.user };
}

/**
 * Attaches guest orders to this account when the account's email is
 * confirmed and matches (done in SQL from auth.users, never from input).
 */
export async function linkGuestOrders(userId: string) {
  if (!isAdminDbConfigured()) return;
  const { error } = await createSupabaseAdminClient().rpc("link_guest_orders", { p_user_id: userId });
  if (error) console.error("[account] link_guest_orders failed", error.message);
}
