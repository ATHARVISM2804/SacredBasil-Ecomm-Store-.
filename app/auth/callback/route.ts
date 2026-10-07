import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { linkGuestOrders } from "@/app/account/session";
import { safeNext } from "../safe-next";

/**
 * Lands magic-link, email-OTP-link and OAuth sign-ins: exchanges the code
 * (PKCE) or token hash for a session cookie, links any guest orders placed
 * with the same confirmed email, then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const fail = () => NextResponse.redirect(new URL(`/account/login?error=link&next=${encodeURIComponent(next)}`, url.origin));

  if (!isSupabaseConfigured) return fail();

  const supabase = await createSupabaseServerClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let userId: string | null = null;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail();
    userId = data.user?.id ?? null;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return fail();
    userId = data.user?.id ?? null;
  } else {
    return fail();
  }

  if (userId) await linkGuestOrders(userId);

  return NextResponse.redirect(new URL(next, url.origin));
}
