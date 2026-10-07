import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AccountNav } from "./AccountNav";

export const metadata: Metadata = {
  title: { default: "Your account", template: "%s — Sacred Basil" },
  robots: { index: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[70svh] bg-ivory pb-24 pt-40 md:pb-32 md:pt-48">
      <div className="shell">
        <AccountNav enabled={isSupabaseConfigured} />
        {children}
      </div>
    </section>
  );
}
