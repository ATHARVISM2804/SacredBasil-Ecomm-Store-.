import "server-only";
import type { AdminContext } from "./auth";
import { PAID_STATUSES } from "./orders";
import type { OrderRow, ProfileRow } from "./types";

type OrderSummary = Pick<OrderRow, "id" | "user_id" | "email" | "total" | "status">;

/** Orders belonging to these profiles, matched by account or by email. */
export async function ordersForProfiles(supabase: AdminContext["supabase"], profiles: Pick<ProfileRow, "id" | "email">[]) {
  if (!profiles.length) return [] as OrderSummary[];
  const ids = profiles.map((p) => p.id);
  const emails = [...new Set(profiles.flatMap((p) => (p.email ? [p.email, p.email.toLowerCase()] : [])))];
  const cols = "id, user_id, email, total, status";
  const [byUser, byEmail] = await Promise.all([
    supabase.from("orders").select(cols).in("user_id", ids),
    emails.length ? supabase.from("orders").select(cols).in("email", emails) : Promise.resolve({ data: [] }),
  ]);
  const all = new Map<string, OrderSummary>();
  for (const o of [...(byUser.data ?? []), ...(byEmail.data ?? [])] as OrderSummary[]) all.set(o.id, o);
  return [...all.values()];
}

export function summarise(profile: Pick<ProfileRow, "id" | "email">, orders: OrderSummary[]) {
  const email = profile.email?.toLowerCase();
  const mine = orders.filter((o) => o.user_id === profile.id || (email && o.email.toLowerCase() === email));
  const placed = mine.filter((o) => o.status !== "pending" && o.status !== "failed");
  const spend = mine.filter((o) => PAID_STATUSES.includes(o.status)).reduce((s, o) => s + o.total, 0);
  return { orders: placed.length, spend };
}
