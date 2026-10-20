import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { Footer } from "@/components/footer/Footer";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Cursor } from "@/components/ui/Cursor";
import { WelcomeLayer } from "@/components/ui/WelcomeLayer";
import { WhatsAppConcierge } from "@/components/ui/WhatsAppConcierge";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { loadAnnouncement } from "@/lib/announcement";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s — Sacred Basil" },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_IN",
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#3e271b",
  viewportFit: "cover",
};

const profiles = site.social.filter((s) => s.href.startsWith("https://") && s.network !== "whatsapp").map((s) => s.href);

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
  ...(site.contact.email ? { email: site.contact.email } : {}),
  ...(profiles.length ? { sameAs: profiles } : {}),
};

/** Adds `motion` before first paint so reveal start-states never flash. */
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const announcement = await loadAnnouncement();
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <SiteHeader announcement={announcement} />
        <main id="main">
          <ViewTransition default="page">{children}</ViewTransition>
        </main>
        <Footer />
        <CartDrawer />
        <MotionProvider />
        <Cursor />
        <WhatsAppConcierge />
        <WelcomeLayer />
      </body>
    </html>
  );
}
