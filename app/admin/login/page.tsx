import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { ErrorNotice } from "@/components/admin/ui";
import { lookupAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions/auth";
import { firstParam } from "@/lib/admin/format";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const error = firstParam((await searchParams).error);
  const session = await lookupAdmin();
  if (session.status === "admin") redirect("/admin");

  return (
    <div className="flex min-h-full items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo variant="lockup" className="w-36 text-chocolate" />
          <p className="eyebrow mt-8 text-gold">Studio admin</p>
          <h1 className="mt-2 font-display text-4xl font-light text-chocolate">Sign in</h1>
        </div>

        {session.status === "forbidden" ? (
          <div className="space-y-6 text-center">
            <ErrorNotice
              message={`You are signed in as ${session.user.email ?? "this account"}, which is not authorised to use the admin.`}
            />
            <form action={signOut}>
              <button type="submit" className="btn btn-primary min-h-10 px-5 text-[0.65rem] hover:translate-y-0">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <>
            {error === "link" && <ErrorNotice message="That sign-in link is invalid or has expired. Request a new one." />}
            <LoginForm />
          </>
        )}

        <p className="mt-12 text-center text-xs text-cocoa/50">
          <Link href="/" className="hover:text-cocoa">
            ← Back to the store
          </Link>
        </p>
      </div>
    </div>
  );
}
