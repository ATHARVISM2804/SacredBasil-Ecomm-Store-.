import Link from "next/link";
import { seedProducts } from "@/data/catalog";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Lotus } from "@/components/ui/Ornament";
import { SocialLinks } from "@/components/footer/SocialLinks";
import { FooterColumn } from "@/components/footer/FooterColumn";

const support = [
  { label: "Your account", href: "/account" },
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns & refunds", href: "/returns" },
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

const about = [
  { label: "Our story", href: "/our-story" },
  { label: "Corporate gifting", href: "/corporate-gifting" },
  { label: "Studio range", href: "/collections#studio" },
  { label: "Contact us", href: "/contact" },
];

/** Footer, v4: deep chocolate and champagne gold, centred lockup, quiet columns. */
export function Footer() {
  const shop = [
    ...seedProducts.map((p) => ({ label: p.name.replace(/^The /, ""), href: `/collections/${p.slug}` })),
    { label: "Shop all", href: "/collections" },
  ];
  return (
    <footer className="bg-chocolate-deep text-ivory">
      <div className="px-[var(--gutter)] pb-14 pt-20 text-center md:pt-24">
        <Link href="/" aria-label="Sacred Basil, home" className="inline-block">
          <Logo variant="lockup" className="w-32 text-champagne md:w-36" />
        </Link>
        <p className="mx-auto mt-8 max-w-md text-[1.05rem] leading-relaxed text-ivory/75">{site.statement}</p>
        <SocialLinks className="mt-8 justify-center text-champagne" />
      </div>

      <div className="mx-[var(--gutter)] flex items-center gap-4 text-champagne/60" aria-hidden>
        <span className="h-px flex-1 bg-current opacity-40" />
        <Lotus className="h-4 w-7" />
        <span className="h-px flex-1 bg-current opacity-40" />
      </div>

      <div className="grid px-[var(--gutter)] py-10 lg:grid-cols-4 lg:gap-8 lg:py-16">
        <FooterColumn title="Shop" links={shop} />
        <FooterColumn title="Orders & support" links={support} />
        <FooterColumn title="About" links={about} />
        <div className="pt-10 lg:pt-0">
          <p className="text-[0.75rem] uppercase tracking-[0.18em] text-champagne">Get in touch</p>
          <ul className="mt-6 space-y-3 text-[0.95rem] text-ivory/70">
            <li>
              <a href={`mailto:${site.contact.email}`} className="break-all transition-colors hover:text-ivory">
                {site.contact.email}
              </a>
            </li>
            {site.contact.phones.map((p) => (
              <li key={p.number}>
                <a href={`tel:${p.number.replace(/\s/g, "")}`} className="transition-colors hover:text-ivory">
                  {p.name} · {p.number}
                </a>
              </li>
            ))}
            <li className="leading-relaxed">{site.contact.address}</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-ivory/10 px-[var(--gutter)] py-7 text-[0.8rem] text-ivory/45 sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>Doctor-led · Handmade in small batches in Pune · Delivered across India</p>
      </div>
    </footer>
  );
}
