/**
 * The wider Sacred Basil studio range, shown as enquire-only until prices
 * and stock are confirmed. Names and details are taken only from the
 * product labels and brochure; nothing here is invented.
 * To sell one online, move it into data/catalog.ts with its price tiers.
 */

const p = (f: string) => `/images/products/${f}.webp`;

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
    images: [p("bath-salt-rose-valley")],
  },
  {
    id: "aromatic-ubtan",
    name: "Aromatic Ubtan",
    detail: "Ayurvedic formulation for skin cleansing, exfoliating and polishing. Naturally fragrant, 25 gm.",
    images: [p("aromatic-ubtan-packet-25g")],
  },
  {
    id: "unwind-candle",
    name: "Unwind Candle, Oudh Tabac",
    detail: "Handpoured, 100% soy wax, in a rose-gold tin.",
    images: [p("unwind-candle-tin-oudh-tabac-styled")],
  },
  {
    id: "scented-candle-lavender",
    name: "Scented Candle, Lavender",
    detail: "Soy wax candle in a glass jar.",
    images: [p("scented-candle-lavender-jar")],
  },
  {
    id: "scented-candle-mahogany",
    name: "Scented Candle, Mahogany",
    detail: "Soy wax candle with a mahogany fragrance, in a gold-lidded jar.",
    images: [p("scented-candle-mahogany-jar")],
  },
  {
    id: "rose-candle-tin",
    name: "Rose Candle",
    detail: "A rose-shaped candle in a red keepsake tin.",
    images: [p("rose-candle-red-tin")],
  },
  {
    id: "glycerine-soap",
    name: "Glycerine Soap",
    detail: "A clear handmade bar with heart inclusions.",
    images: [p("glycerine-soap-in-hand")],
  },
  {
    id: "wax-sachets",
    name: "Scented Wax Sachets",
    detail: "Hand-poured wax tablets with pressed flowers and wax rosettes, to hang in wardrobes and small spaces.",
    images: [
      p("wax-sachets-collection"),
      p("wax-sachets-hanging-board"),
      p("wax-sachet-dahlia"),
      p("wax-sachet-lavender"),
      p("wax-sachet-yellow-flowers"),
      p("wax-sachet-hearts"),
      p("wax-sachet-in-hand"),
    ],
  },
  {
    id: "celebration-favours",
    name: "Celebration Favours",
    detail: "Customised favours for birthdays, baby showers, naming ceremonies and weddings.",
    images: [p("favour-pouches-tulle")],
  },
];
