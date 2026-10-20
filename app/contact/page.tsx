import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site, whatsappLink } from "@/data/site";
import { SocialIcon } from "@/components/footer/SocialLinks";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Sacred Basil about a gift, a collection or a corporate order.",
  alternates: { canonical: "/contact" },
};

/** Contact, v4: details beside a real product photograph, then the form. */
export default function ContactPage() {
  const { email, phones, address } = site.contact;
  const instagram = site.social.find((s) => s.network === "instagram");

  const detail = (label: string, children: React.ReactNode) => (
    <div className="border-t border-[var(--line)] pt-5">
      <p className="text-[0.75rem] uppercase tracking-[0.18em] text-gold">{label}</p>
      <div className="mt-3 text-[1.1rem] text-chocolate">{children}</div>
    </div>
  );

  return (
    <>
      <section aria-labelledby="contact-title" className="grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-[var(--gutter)] py-16 lg:px-16 lg:py-24 xl:px-24">
          <p className="text-[0.8rem] uppercase tracking-[0.18em] text-gold">Contact</p>
          <h1 id="contact-title" className="display-hero mt-5 text-chocolate">
            Start a conversation.
          </h1>
          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-cocoa/75">
            A question about a collection, a personal gift or something you have in mind. We would love to hear from you.
          </p>
          <div className="mt-12 grid max-w-lg gap-7">
            {detail(
              "Write to us",
              <a href={`mailto:${email}`} className="break-all hover:underline">
                {email}
              </a>,
            )}
            {detail(
              "Call or WhatsApp",
              phones.map((p) => (
                <a key={p.number} href={`tel:${p.number.replace(/\s/g, "")}`} className="block py-1.5 hover:underline">
                  {p.name} · {p.number}
                </a>
              )).concat(
                <a key="wa" href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-[1rem] underline underline-offset-4">
                  <SocialIcon network="whatsapp" className="size-[1.1rem]" />
                  Message us on WhatsApp
                </a>,
              ),
            )}
            {instagram &&
              detail(
                "Follow us",
                <a href={instagram.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  @{instagram.href.replace(/\/$/, "").split("/").pop()}
                </a>,
              )}
            {detail("Studio", <p className="text-[1rem] text-cocoa/80">{address}</p>)}
          </div>
        </div>
        <div className="relative min-h-[26rem] bg-cream lg:min-h-[44rem]">
          <Image
            src="/images/products/set-tranquil.webp"
            alt="The Sacred Basil Tranquil Box open with its Diwali card, soap, ubtan, body oil and candle"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="form-title" className="bg-cream px-[var(--gutter)] py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="form-title" className="display-section text-chocolate">
              Send us a message
            </h2>
            <p className="mt-6 text-[1rem] leading-relaxed text-cocoa/75">
              Gifting for a team? Our{" "}
              <Link href="/corporate-gifting#enquire" className="underline underline-offset-4">
                corporate enquiry form
              </Link>{" "}
              asks for the details we need to help.
            </p>
          </div>
          <EnquiryForm kind="general" className="lg:col-span-7 lg:col-start-6" />
        </div>
      </section>
    </>
  );
}
