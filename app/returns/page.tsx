import type { Metadata } from "next";
import { site } from "@/data/site";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Returns and refunds for Sacred Basil orders.",
  alternates: { canonical: "/returns" },
};

// CLIENT TO CONFIRM: Sacred Basil's returns, cancellation and refund policy (required by Razorpay before going live).
export default function ReturnsPage() {
  return (
    <LegalPage title="Returns & refunds">
      <p>
        Every Sacred Basil set is handcrafted and individually assembled. Our full returns and refund policy will be
        published here. Until then, if anything arrives damaged or not as expected, please contact us with your order
        number and a photograph.
      </p>
      <h2>Contact</h2>
      <p>
        Write to <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or call{" "}
        {site.contact.phones.map((p) => `${p.name} on ${p.number}`).join(" or ")}.
      </p>
    </LegalPage>
  );
}
