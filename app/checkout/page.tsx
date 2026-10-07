import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { paymentsReady } from "@/lib/payments/config";
import { CheckoutForm, type CheckoutCustomer } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

async function loadCustomer(): Promise<CheckoutCustomer | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("addresses")
      .select("id, label, full_name, phone, line1, line2, city, state, pincode, is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  return {
    email: user.email ?? "",
    name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    addresses: addresses ?? [],
  };
}

export default async function CheckoutPage() {
  const customer = await loadCustomer();
  return (
    <section className="bg-ivory pb-24 pt-40 md:pb-32 md:pt-48">
      <div className="shell">
        <p className="eyebrow mb-6 text-cocoa/65">Secure checkout</p>
        <h1 className="display-section text-chocolate">Checkout</h1>
        <CheckoutForm customer={customer} paymentsReady={paymentsReady()} accountsEnabled={isSupabaseConfigured} />
      </div>
    </section>
  );
}
