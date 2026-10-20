/**
 * Central site configuration. Brand facts, terms and contact details are
 * taken from the Sacred Basil Diwali Gifting Collection brochure
 * (docs/inputs/SB Diwali Gifting Collection.pdf).
 */

export const site = {
  name: "Sacred Basil",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  title: "Sacred Basil — Handcrafted Ayurvedic Wellness Gifts",
  description:
    "Handcrafted, Ayurvedic-inspired bath and body gifts from Sacred Basil, a doctor-led brand from Pune. Thoughtfully curated for Diwali, celebrations and corporate gifting.",
  statement: "Thoughtful gifts. Meaningful connections. Lasting impressions.",
  aim: "To make Ayurvedic wellness a beautiful part of everyday life through products that are honest, effective and made with care.",

  contact: {
    email: "contactsacredbasil@gmail.com",
    phones: [
      { name: "Ananya", number: "+91 99592 41078" },
      { name: "Parita", number: "+91 73851 98433" },
    ],
    address: "B 805, Sarang, Nanded City, Sinhgad Road, Pune",
  },

  /**
   * Social profiles shown in the footer. WhatsApp and email come from the
   * brochure; add other networks here once supplied.
   */
  social: [
    { network: "instagram", label: "Instagram", href: "https://www.instagram.com/sacredbasil.in/" },
    { network: "whatsapp", label: "WhatsApp", href: "https://wa.me/919959241078" },
    { network: "email", label: "Email", href: "mailto:contactsacredbasil@gmail.com" },
  ] as { network: "instagram" | "whatsapp" | "email" | "facebook" | "linkedin"; label: string; href: string }[],

  /**
   * Last day to order for delivery before the festival (end of day, IST).
   * Diwali 2026 is 8 November; 7–8 business days of production plus
   * shipping puts the cut-off here. Confirm with Sacred Basil before launch.
   * The note disappears by itself after this date.
   */
  festiveCutoff: { festival: "Diwali", orderBy: "2026-10-23" },

  /** Placeholder frames name the photograph that belongs there when true. */
  showPlaceholderCaptions: false,
} as const;

/** WhatsApp chat with Sacred Basil, opening with a message ready to send. */
export function whatsappLink(text = "Hello Sacred Basil, I’d like some help choosing a gift.") {
  const base = site.social.find((s) => s.network === "whatsapp")?.href ?? "https://wa.me/919959241078";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export type MenuLink = { label: string; href: string };
export type MenuTile = { label: string; href: string; image: string };
export type MenuGroup = { label: string; href: string; links?: MenuLink[]; tiles?: MenuTile[] };

/** Header, row two. Left: what to buy. Right: who we are. */
export const shopMenu: MenuGroup[] = [
  {
    label: "Gift Sets",
    href: "/collections#gift-sets",
    links: [
      { label: "The Luxe Bath & Body Care Kit", href: "/collections/luxe-bath-body-care-kit" },
      { label: "The Tranquil Box", href: "/collections/tranquil-box" },
      { label: "The Serenity Box", href: "/collections/serenity-box" },
      { label: "The Festive Ritual Box / Pouch", href: "/collections/festive-ritual-box-pouch" },
      { label: "Shop all gift sets", href: "/collections#gift-sets" },
    ],
    tiles: [
      { label: "The Luxe Kit", href: "/collections/luxe-bath-body-care-kit", image: "/images/products/luxe-kit-open-premium.webp" },
      { label: "Festive Ritual", href: "/collections/festive-ritual-box-pouch", image: "/images/products/festive-ritual-set.webp" },
    ],
  },
  {
    label: "Bath & Body",
    href: "/collections#studio",
    links: [
      { label: "Aromatic Ubtan", href: "/collections#studio" },
      { label: "Relaxing Bath Salt", href: "/collections#studio" },
      { label: "Glycerine Soap", href: "/collections#studio" },
    ],
    tiles: [
      { label: "Aromatic Ubtan", href: "/collections#studio", image: "/images/products/aromatic-ubtan-packet-25g.webp" },
      { label: "Bath Salt", href: "/collections#studio", image: "/images/products/bath-salt-rose-valley.webp" },
    ],
  },
  {
    label: "Candles & Home",
    href: "/collections#studio",
    links: [
      { label: "Scented Candles", href: "/collections#studio" },
      { label: "Unwind Candle, Oudh Tabac", href: "/collections#studio" },
      { label: "Scented Wax Sachets", href: "/collections#studio" },
    ],
    tiles: [
      { label: "Candles", href: "/collections#studio", image: "/images/products/scented-candle-mahogany-jar.webp" },
      { label: "Wax Sachets", href: "/collections#studio", image: "/images/products/wax-sachets-collection.webp" },
    ],
  },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
];

export const brandMenu: MenuLink[] = [
  { label: "Our Story", href: "/our-story" },
  { label: "Contact", href: "/contact" },
];

/** Brand promises, as stated by Sacred Basil. */
export const brandValues = [
  { title: "Handmade in small batches", text: "Every kit is handcrafted and individually assembled." },
  { title: "Cruelty free", text: "Made with care for every living thing." },
  { title: "Free from harsh chemicals", text: "Ayurvedic-inspired formulations that are gentle and effective." },
  { title: "Eco-friendly packaging", text: "As gentle on the planet as they are on you." },
] as const;

export const founders = [
  {
    name: "Parita",
    role: "Ayurveda Practitioner",
    bio: "Parita runs her Ayurvedic clinic in Pune.",
  },
  {
    name: "Ananya",
    role: "Dentist",
    bio: "Ananya works with a well-established, well-reputed dental clinic in Hyderabad.",
  },
] as const;

/** Order and delivery terms from the brochure. */
export const orderTerms = {
  bulkPayment: "50% advance to confirm bulk production, 50% balance before dispatch.",
  productionTime: "7–8 business days minimum. Every kit is handcrafted and individually assembled.",
  shipping: "We deliver across India. Shipping charges are not included in the kit price.",
  delivery:
    "Delivery timelines and costs depend on the destination and shipping option. Delivery can be arranged through reliable travel or transport partners or shipping services, based on what is most convenient, safe and cost-effective for your location.",
  bespoke: "Customisation is available for orders of 100+ kits. Pricing for customised orders is open for direct discussion.",
} as const;

export const corporateCustomisation = [
  "Custom logo",
  "Corporate branding",
  "Personalised packaging",
  "Custom labels and tags",
  "Message cards",
] as const;

export const corporateAudiences = [
  "IT companies and corporate offices",
  "Real estate firms and business houses",
  "Client and employee gifting",
  "Festive appreciation with a personal touch",
] as const;

export const occasions = [
  "Diwali / festive",
  "Employee gifting",
  "Client gifting",
  "Birthday",
  "Baby shower",
  "Naming ceremony",
  "Wedding",
  "Thank you",
  "Other",
] as const;
