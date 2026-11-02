import type { Product } from "@/lib/catalog/types";

/**
 * Seed catalogue, transcribed from the Sacred Basil Diwali Gifting
 * Collection brochure (docs/inputs/SB Diwali Gifting Collection.pdf).
 * Contents, sizes, pricing and packaging are exactly as stated there.
 *
 * Once Supabase is configured, the admin panel is the source of truth and
 * this file only seeds the database.
 */

/** Studio photographs made from the brochure's own product shots (docs/regen3). */
const v6 = (f: string) => `/images/v6/${f}.webp`;

export const seedProducts: Product[] = [
  {
    id: "luxe-bath-body-care-kit",
    slug: "luxe-bath-body-care-kit",
    name: "The Luxe Bath & Body Care Kit",
    tagline: "Crafted for your Diwali Dawn",
    shortDescription: "Our signature five-piece collection in a premium magnetic box.",
    description:
      "A luxurious self-care ritual, thoughtfully curated to nourish the skin, relax the body and elevate everyday moments.",
    images: [v6("g-luxe-open"), v6("g-luxe-closed"), v6("g-luxe-lineup")],
    contents: [
      { name: "Body Scrub", size: "40 g", quantity: 1, note: "Exfoliates & nourishes" },
      { name: "Face Scrub", size: "25 g", quantity: 1, note: "Gentle care for a natural glow" },
      { name: "Body Oil", size: "30 ml", quantity: 1, note: "Deeply hydrates & revitalises" },
      { name: "Handmade Soap", size: "75 g", quantity: 1, note: "Gentle cleansing with nourishing care" },
      { name: "Soy Wax Scented Candle", quantity: 1, note: "Long-lasting fragrance for a calm, cozy ambiance" },
    ],
    packaging: "Premium magnetic box with eco-friendly packaging.",
    tiers: [
      { min: 1, max: 9, unitPrice: 1100 },
      { min: 10, max: 25, unitPrice: 999 },
      { min: 26, max: null, unitPrice: 899 },
    ],
    bespokeFrom: 100,
    customisation: "Custom logo, corporate branding, personalised packaging, custom labels or tags and other bespoke requirements.",
    stock: null,
    status: "active",
    featured: true,
    sortOrder: 1,
  },
  {
    id: "tranquil-box",
    slug: "tranquil-box",
    name: "The Tranquil Box",
    tagline: "Simple. Soothing. Thoughtful.",
    shortDescription: "Four handcrafted essentials, with a scented candle, in a magnet closure gift box.",
    description:
      "The Tranquil Box is a calming blend of handcrafted self-care essentials, curated to nourish, relax and restore. A meaningful gift that brings moments of peace and well-being.",
    images: [v6("g-tranquil-open"), v6("g-tranquil-closed")],
    contents: [
      { name: "Artisanal Soap", size: "75 g approx", quantity: 1, note: "Gentle & Nourishing" },
      { name: "Aromatic Ubtan", size: "50 g approx", quantity: 1 },
      { name: "Aromatic Body Oil", size: "35 ml", quantity: 1 },
      { name: "Scented Candle", quantity: 1 },
    ],
    packaging: "Thoughtfully packed in our signature Sacred Basil magnet closure gift box.",
    dimensions: "6 × 4 × 2 inch (15.2 × 10.2 × 5 cm)",
    tiers: [
      { min: 1, max: 5, unitPrice: 549 },
      { min: 6, max: 25, unitPrice: 524 },
      { min: 26, max: null, unitPrice: 499 },
    ],
    bespokeFrom: 100,
    customisation: "Customisation available with your logo and message.",
    stock: null,
    status: "active",
    featured: true,
    sortOrder: 2,
  },
  {
    id: "serenity-box",
    slug: "serenity-box",
    name: "The Serenity Box",
    tagline: "Simple. Soothing. Thoughtful.",
    shortDescription: "Three calming essentials in our signature floral gift box.",
    description:
      "The Serenity Box is a calming blend of handcrafted self-care essentials, curated to nourish, relax and restore. A meaningful gift that brings moments of peace and well-being.",
    images: [v6("g-serenity-open"), v6("g-serenity-closed")],
    contents: [
      { name: "Artisanal Soap", size: "70 g approx", quantity: 1, note: "Gentle & Nourishing" },
      { name: "Aromatic Body Oil", size: "35 ml", quantity: 1 },
      { name: "Aromatic Bath Powder", size: "50 g approx", quantity: 1 },
    ],
    packaging: "Thoughtfully packed in our signature Sacred Basil gift box.",
    dimensions: "4 × 4 × 2 inch (10.2 × 10.2 × 5 cm)",
    tiers: [
      { min: 1, max: 5, unitPrice: 449 },
      { min: 6, max: 25, unitPrice: 424 },
      { min: 26, max: null, unitPrice: 399 },
    ],
    bespokeFrom: 100,
    customisation: "Customisation of the gift box, contents and message card.",
    stock: null,
    status: "active",
    featured: true,
    sortOrder: 3,
  },
  {
    id: "festive-ritual",
    slug: "festive-ritual-box-pouch",
    name: "The Festive Ritual Box / Pouch",
    tagline: "Simple. Soothing. Thoughtful.",
    shortDescription: "Three handcrafted essentials in a festive box or an organza pouch.",
    description:
      "The Festive Ritual Box/Pouch is a thoughtful blend of handcrafted self-care essentials, curated to nourish, relax and restore. A meaningful gift that brings moments of peace and well-being.",
    images: [v6("g-festive-set"), v6("festive-box")],
    contents: [
      { name: "Artisanal Soap", size: "75 g approx", quantity: 1, note: "Gentle & Nourishing" },
      { name: "Aromatic Ubtan", size: "50 g approx", quantity: 1 },
      { name: "Aromatic Body Oil", size: "35 ml", quantity: 1 },
    ],
    packaging: "Thoughtfully packed in our signature Sacred Basil box or pouch.",
    variants: [
      { id: "box", name: "Festive box" },
      { id: "pouch", name: "Organza pouch" },
    ],
    tiers: [
      { min: 1, max: 5, unitPrice: 279 },
      { min: 6, max: 25, unitPrice: 249 },
      { min: 26, max: null, unitPrice: 229 },
    ],
    bespokeFrom: 100,
    customisation: "Customisation available with your logo and message.",
    stock: null,
    status: "active",
    featured: true,
    sortOrder: 4,
  },
];

/**
 * Past orders (brochure "Our Previous Work"), re-shot in the studio look from
 * the real order photographs (docs/regen3). Sizes are the files' own.
 */
const workSizes = [954, 1045, 1045, 1045, 1045, 1738, 1738, 1738, 1738, 1738, 1992, 1738];
export const previousWork = Array.from({ length: 12 }, (_, i) => ({
  src: `/images/v6/work-${String(i + 1).padStart(2, "0")}.webp`,
  width: 1400,
  height: workSizes[i],
  alt: [
    "Luxe Bath & Body Care Kits with body scrub, face scrub, body oil, artisanal soap and a lit candle",
    "An open Luxe Bath & Body Care Kit among finished kits, ready to ship",
    "Floral Sacred Basil gift boxes, body oils, ubtan sachets and soaps being packed",
    "Hands closing a floral Sacred Basil gift box",
    "Festive Diwali boxes with soaps and body oils laid out for packing",
    "A festive Diwali Sacred Basil box standing in front of a stack of boxes",
    "Rows of gold-tied gift pouches with Sacred Basil cards",
    "Kraft-wrapped soaps and black tulle favours with tags",
    "Sage tulle favours with thank-you tags in a basket",
    "Rows of white organza favour pouches with thank-you cards",
    "Soap favours in white tulle with thank-you cards",
    "Winter Bath & Body Care Kits in kraft boxes",
  ][i],
}));
