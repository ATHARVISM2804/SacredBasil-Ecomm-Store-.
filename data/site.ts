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

  /** Social profiles. Leave empty until supplied. */
  social: [] as { label: string; href: string }[],

  /** Placeholder frames name the photograph that belongs there when true. */
  showPlaceholderCaptions: false,
} as const;

export const navigation = [
  { label: "Shop", href: "/collections" },
  { label: "Corporate Gifting", href: "/corporate-gifting" },
  { label: "Our Story", href: "/our-story" },
  { label: "Contact", href: "/contact" },
] as const;

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
