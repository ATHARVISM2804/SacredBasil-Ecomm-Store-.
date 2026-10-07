import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type AdminContext = {
  supabase: ServerClient;
  user: User;
  profile: { id: string; email: string | null; full_name: string | null; role: string };
};

type Lookup =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "forbidden"; user: User }
  | ({ status: "admin" } & AdminContext);

/**
 * Resolves the current session against `profiles.role`. Deduplicated per
 * request, so layouts and pages can both call it cheaply.
 */
export const lookupAdmin = cache(async (): Promise<Lookup> => {
  if (!isSupabaseConfigured) return { status: "unconfigured" };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin") return { status: "forbidden", user };
  return { status: "admin", supabase, user, profile };
});

/**
 * Guard for admin pages. Anonymous visitors go to the login screen; signed-in
 * non-admins go there too, with a "not authorised" notice.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const result = await lookupAdmin();
  if (result.status === "admin") return result;
  if (result.status === "forbidden") redirect("/admin/login?error=not_authorised");
  redirect("/admin/login");
}

/**
 * Guard for server actions. Returns null when the caller is not an admin so
 * the action can respond with an error instead of throwing.
 */
export async function adminForAction(): Promise<AdminContext | null> {
  const result = await lookupAdmin();
  return result.status === "admin" ? result : null;
}
