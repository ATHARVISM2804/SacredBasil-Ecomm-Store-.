import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for the Sacred Basil website.",
  alternates: { canonical: "/terms" },
};

// CLIENT TO CONFIRM: order, payment, delivery and returns terms before launch.
export default function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>
        By using this website you agree to these terms. The site presents Sacred Basil collections and lets you send
        enquiries; it does not take orders or payments online.
      </p>
      <h2>Products and imagery</h2>
      <p>
        We present our collections as accurately as we can. The exact contents, pricing and availability of any order
        are confirmed with you directly before it is placed.
      </p>
      <h2>Content</h2>
      <p>
        The Sacred Basil name, photography and text on this site belong to Sacred Basil and may not be reused without
        permission.
      </p>
    </LegalPage>
  );
}
