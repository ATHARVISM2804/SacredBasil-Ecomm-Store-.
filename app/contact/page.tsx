import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { ImageHero } from "@/components/sections/ImageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Sacred Basil about a gift, a collection or a corporate order.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, phones, address } = site.contact;

  return (
    <>
      <ImageHero
        label="Contact"
        title="Start a conversation."
        intro="A question about a collection, a personal gift or something you have in mind. We would love to hear from you."
        image="/images/site/hero-contact.webp"
        alt="A cream Sacred Basil correspondence card and brass pen beside the chocolate Luxe gift box, with marigold petals and tulsi"
      />
      <section aria-label="Contact form" className="bg-ivory pb-[var(--section-y)]">
        <div className="shell">
          <div className="grid gap-16 pt-[var(--section-y)] lg:grid-cols-12 lg:gap-8">
            <aside className="space-y-10 lg:col-span-4">
              <div className="space-y-3">
                <p className="eyebrow text-gold">Write to us</p>
                <a href={`mailto:${email}`} className="link-underline block break-all font-display text-2xl text-chocolate">
                  {email}
                </a>
              </div>
              <div className="space-y-3">
                <p className="eyebrow text-gold">Call or WhatsApp</p>
                {phones.map((p) => (
                  <a
                    key={p.number}
                    href={`tel:${p.number.replace(/\s/g, "")}`}
                    className="link-underline block font-display text-2xl text-chocolate"
                  >
                    {p.name}: {p.number}
                  </a>
                ))}
              </div>
              <div className="space-y-2">
                <p className="eyebrow text-gold">Studio</p>
                <p className="text-cocoa/75">{address}</p>
              </div>
              <div>
                <p className="eyebrow text-gold">Gifting for a team?</p>
                <p className="mt-3 max-w-xs text-cocoa/75">
                  For corporate and bulk orders, the{" "}
                  <Link href="/corporate-gifting#enquire" className="underline underline-offset-4">
                    corporate enquiry form
                  </Link>{" "}
                  asks for the details we need to help.
                </p>
              </div>
            </aside>
            <EnquiryForm kind="general" className="lg:col-span-7 lg:col-start-6" />
          </div>
        </div>
      </section>
    </>
  );
}
