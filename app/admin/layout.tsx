import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SetupScreen } from "@/components/admin/SetupScreen";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin — Sacred Basil" },
  robots: { index: false, follow: false },
};

/*
 * The root layout wraps every route in the storefront header and footer.
 * The admin covers the viewport with its own fixed shell instead; when
 * printing, the storefront chrome is hidden and the shell flows normally.
 */
const printCss = `@media print {
  body > :not(main) { display: none !important; }
  [data-admin-shell] { position: static !important; overflow: visible !important; }
  html, body { background: #fff !important; }
}`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-admin-shell
      data-lenis-prevent
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-ivory font-sans text-cocoa print:bg-white"
    >
      <style>{printCss}</style>
      {isSupabaseConfigured ? children : <SetupScreen />}
    </div>
  );
}
