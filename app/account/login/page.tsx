import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNext } from "@/app/auth/safe-next";
import { AccountUnavailable } from "../AccountUnavailable";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ next?: string | string[]; error?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNext(Array.isArray(params.next) ? params.next[0] : params.next);

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(next);
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="eyebrow mb-6 text-cocoa/65">Your account</p>
      <h1 className="display-section text-chocolate">Sign in</h1>
      {isSupabaseConfigured ? (
        <>
          <p className="lede mt-6 text-cocoa/72">
            No password needed. We’ll email you a secure link to sign in — or create your account if you’re new.
          </p>
          <LoginForm
            next={next}
            linkError={Boolean(params.error)}
            googleEnabled={process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true"}
          />
        </>
      ) : (
        <div className="mt-8">
          <AccountUnavailable />
        </div>
      )}
    </div>
  );
}
