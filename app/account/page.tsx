import type { Metadata } from "next";
import Link from "next/link";
import { formatINR } from "@/lib/catalog/pricing";
import { AccountUnavailable } from "./AccountUnavailable";
import { ProfileForm } from "./ProfileForm";
import { linkGuestOrders, requireUser } from "./session";
import { formatDate, orderStatusLabel } from "./status";

export const metadata: Metadata = { title: "Your account" };

type OrderSummary = {
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  tracking_carrier: string | null;
  tracking_number: string | null;
};

export default async function AccountPage() {
  const session = await requireUser("/account");
  if (!session) return <AccountUnavailable />;
  const { supabase, user } = session;

  // Picks up guest orders placed with this (confirmed) email since the last visit.
  await linkGuestOrders(user.id);

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("order_number, status, total, created_at, tracking_carrier, tracking_number")
      .eq("user_id", user.id)
      .not("status", "in", "(pending,failed)") // unpaid checkouts are not orders yet
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const list = (orders ?? []) as OrderSummary[];
  const name = profile?.full_name?.split(" ")[0];

  return (
    <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-24">
      <div>
        <h1 className="display-section text-chocolate">{name ? `Welcome, ${name}` : "Your account"}</h1>
        <h2 className="display-sub mt-14 text-chocolate">Orders</h2>
        {list.length === 0 ? (
          <p className="mt-6 text-cocoa/70">
            No orders yet.{" "}
            <Link href="/collections" className="underline underline-offset-4">
              Explore the collections
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {list.map((o) => (
              <li key={o.order_number}>
                <Link
                  href={`/account/orders/${o.order_number}`}
                  className="grid grid-cols-2 gap-x-6 gap-y-1 py-5 transition-colors hover:bg-cream/40 md:grid-cols-[8rem_1fr_auto_auto] md:items-center"
                >
                  <span className="font-display text-xl text-chocolate">{o.order_number}</span>
                  <span className="text-sm text-cocoa/65 md:order-none">{formatDate(o.created_at)}</span>
                  <span className="eyebrow text-cocoa/75">
                    {orderStatusLabel[o.status] ?? o.status}
                    {o.tracking_number ? " · tracking available" : ""}
                  </span>
                  <span className="text-right tabular-nums">{formatINR(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="display-sub text-chocolate">Your details</h2>
        <div className="mt-8">
          <ProfileForm email={user.email ?? ""} fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
        </div>
      </div>
    </div>
  );
}
