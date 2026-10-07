import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./config";

/** Request-scoped client acting as the signed-in user (RLS applies). */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component: cookies are read-only there. The proxy refreshes sessions.
        }
      },
    },
  });
}

/** Anonymous client for public, cacheable reads (no cookies, RLS applies). */
export function createSupabasePublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

/**
 * Service-role client: bypasses RLS. Server-only, for trusted operations
 * (creating orders, recording payments, storing enquiries).
 */
export function createSupabaseAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) throw new Error("Supabase service role is not configured");
  return createClient(supabaseUrl, key, { auth: { persistSession: false } });
}
