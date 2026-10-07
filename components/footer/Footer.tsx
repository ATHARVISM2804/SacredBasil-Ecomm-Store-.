import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { seedProducts } from "@/data/catalog";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Ornament } from "@/components/ui/Ornament";
import { SocialLinks } from "@/components/footer/SocialLinks";

const explore = [
  { label: "Shop all", href: "/collections" },
  { label: "Corporate gifting", href: "/corporate-gifting" },
  { label: "Our story", href: "/our-story" },
  { label: "Contact", href: "/contact" },
];

const help = [
  { label: "Your account", href: "/account" },
  { label: "Shipping & delivery", href: "/shipping" },
  { label: "Returns & refunds", href: "/returns" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-chocolate-deep text-ivory">
      <div className="shell grid grid-cols-2 gap-x-6 gap-y-14 py-20 md:grid-cols-12 md:gap-x-10 md:py-24">
        <div className="col-span-2 md:col-span-4">
          <Logo variant="lockup" className="w-32 text-champagne" />
          <p className="mt-8 max-w-xs font-display text-[1.3rem] italic leading-snug text-ivory/75">{site.statement}</p>
          <Ornament tone="champagne" className="mt-8 justify-start" />
          <p className="eyebrow mt-10 text-champagne/80">Follow &amp; message us</p>
          <SocialLinks className="mt-5" />
        </div>

        <nav aria-label="Shop" className="md:col-span-2 md:col-start-6">
          <p className="eyebrow text-champagne/80">Shop</p>
          <ul className="mt-6 space-y-3 text-[0.92rem]">
            {seedProducts.map((p) => (
              <li key={p.id}>
                <Link href={`/collections/${p.slug}`} className="link-underline text-ivory/75 hover:text-ivory">
                  {p.name.replace(/^The /, "")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Explore" className="md:col-span-2">
          <p className="eyebrow text-champagne/80">Explore</p>
          <ul className="mt-6 space-y-3 text-[0.92rem]">
            {explore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-ivory/75 hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-10 text-champagne/80">Help</p>
          <ul className="mt-6 space-y-3 text-[0.92rem]">
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-ivory/75 hover:text-ivory">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-3">
          <p className="eyebrow text-champagne/80">Get in touch</p>
          <ul className="mt-6 space-y-4 text-[0.92rem] text-ivory/75">
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 size-4 shrink-0 text-champagne" strokeWidth={1.25} />
              <a href={`mailto:${site.contact.email}`} className="link-underline -my-2 inline-block break-all py-2 hover:text-ivory">
                {site.contact.email}
              </a>
            </li>
            {site.contact.phones.map((p) => (
              <li key={p.number} className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 size-4 shrink-0 text-champagne" strokeWidth={1.25} />
                <a href={`tel:${p.number.replace(/\s/g, "")}`} className="link-underline -my-2 inline-block py-2 hover:text-ivory">
                  {p.name}: {p.number}
                </a>
              </li>
            ))}
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-champagne" strokeWidth={1.25} />
              <span>{site.contact.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell">
        <div className="flex flex-col gap-4 border-t border-[var(--line-light)] py-8 text-xs tracking-[0.06em] text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Handcrafted in Pune, delivered across India.
          </p>
          <p>Premium Ayurvedic wellness gifts</p>
        </div>
      </div>
    </footer>
  );
}
