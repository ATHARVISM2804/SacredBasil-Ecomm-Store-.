import type { Metadata } from "next";
import { orderTerms, site } from "@/data/site";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "How Sacred Basil gift sets are made, packed and delivered across India.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <LegalPage title="Shipping & delivery">
      <h2>Production</h2>
      <p>{orderTerms.productionTime}</p>
      <h2>Delivery across India</h2>
      <p>{orderTerms.shipping}</p>
      <p>{orderTerms.delivery}</p>
      <h2>Bulk and corporate orders</h2>
      <p>{orderTerms.bulkPayment}</p>
      <p>{orderTerms.bespoke}</p>
      <h2>Questions</h2>
      <p>
        Write to <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or call{" "}
        {site.contact.phones.map((p) => `${p.name} on ${p.number}`).join(" or ")}.
      </p>
    </LegalPage>
  );
}
