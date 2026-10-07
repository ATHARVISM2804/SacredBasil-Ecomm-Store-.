import type { Metadata } from "next";
import type { SavedAddress } from "@/app/checkout/CheckoutForm";
import { AccountUnavailable } from "../AccountUnavailable";
import { requireUser } from "../session";
import { AddressBook } from "./AddressBook";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await requireUser("/account/addresses");
  if (!session) return <AccountUnavailable />;

  const { data } = await session.supabase
    .from("addresses")
    .select("id, label, full_name, phone, line1, line2, city, state, pincode, is_default")
    .eq("user_id", session.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="display-section mb-14 text-chocolate">Addresses</h1>
      <AddressBook addresses={(data ?? []) as SavedAddress[]} />
    </div>
  );
}
