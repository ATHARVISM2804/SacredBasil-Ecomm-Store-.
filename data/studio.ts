/**
 * The wider Sacred Basil studio range, shown as enquire-only until prices
 * and stock are confirmed. Names and details are taken only from the
 * product labels and brochure; nothing here is invented.
 * To sell one online, move it into data/catalog.ts with its price tiers.
 */

/** Studio packshots made from the real product photographs (docs/regen3). */
const v6 = (f: string) => `/images/v6/st-${f}.webp`;

export type StudioItem = {
  id: string;
  name: string;
  detail: string;
  images: string[];
};

export const studioRange: StudioItem[] = [
  {
    id: "bath-salt-rose-valley",
    name: "Relaxing Bath Salt, Rose Valley",
    detail: "200 gm of bath salt with dried rose petals.",
    images: [v6("bath-salt")],
  },
  {
    id: "aromatic-ubtan",
    name: "Aromatic Ubtan",
    detail: "Ayurvedic formulation for skin cleansing, exfoliating and polishing. Naturally fragrant, 25 gm.",
    images: [v6("ubtan")],
  },
  {
    id: "unwind-candle",
    name: "Unwind Candle, Oudh Tabac",
    detail: "Handpoured, 100% soy wax, in a rose-gold tin.",
    images: [v6("unwind")],
  },
  {
    id: "scented-candle-lavender",
    name: "Scented Candle, Lavender",
    detail: "Soy wax candle in a glass jar.",
    images: [v6("lavender")],
  },
  {
    id: "scented-candle-mahogany",
    name: "Scented Candle, Mahogany",
    detail: "Soy wax candle with a mahogany fragrance, in a gold-lidded jar.",
    images: [v6("mahogany")],
  },
  {
    id: "rose-candle-tin",
    name: "Rose Candle",
    detail: "A rose-shaped candle in a red keepsake tin.",
    images: [v6("rose")],
  },
  {
    id: "glycerine-soap",
    name: "Glycerine Soap",
    detail: "A clear handmade bar with heart inclusions.",
    images: [v6("glycerine")],
  },
  {
    id: "wax-sachets",
    name: "Scented Wax Sachets",
    detail: "Hand-poured wax tablets with pressed flowers and wax rosettes, to hang in wardrobes and small spaces.",
    images: [v6("sachets")],
  },
  {
    id: "celebration-favours",
    name: "Celebration Favours",
    detail: "Customised favours for birthdays, baby showers, naming ceremonies and weddings.",
    images: [v6("favours")],
  },
];
