/**
 * Central asset map.
 *
 * Every image on the site is referenced through this file. When the
 * Sacred Basil photography is delivered, drop files into
 * /public/images/sacred-basil/ using the filenames below (or set the
 * filename to match) and add them to `delivered`. No component changes
 * are needed.
 *
 * `src: null` renders an art-directed placeholder with the brief for the
 * photograph that belongs in that frame (see `brief`).
 *
 * Product photographs must match the supplied references exactly:
 * same packaging, same box configuration, same product count.
 */

export type Asset = {
  src: string | null;
  alt: string;
  /** What the photograph should show. Used as the placeholder caption. */
  brief: string;
  /** Tone of the placeholder field. */
  tone: "dark" | "light";
  width?: number;
  height?: number;
};

const dir = "/images/sacred-basil";

/**
 * Filenames that have been delivered into /public/images/sacred-basil/.
 * Add a filename here once the approved photograph is in place.
 */
const delivered = new Set<string>([]);

const a = (file: string | null, alt: string, brief: string, tone: Asset["tone"] = "light"): Asset => ({
  src: file && delivered.has(file) ? `${dir}/${file}` : null,
  alt,
  brief,
  tone,
});

export const assets = {
  hero: a(
    "hero-sacred-basil.jpg",
    "Sacred Basil gift box on cream linen in warm evening light",
    "Hero: gift box off-centre right, golden-hour light",
    "dark",
  ),
  heroPoster: a("hero-poster.jpg", "Sacred Basil gift box in warm light", "Hero video poster", "dark"),

  intro: a(
    "intro-gift-set.jpg",
    "Sacred Basil gift set resting on ivory textile beside jasmine",
    "Intro: single gift set, generous negative space",
  ),

  // Ritual products (one product each, packaging as supplied)
  ritualSoap: a(
    "ritual-soap.jpg",
    "Sacred Basil Artisanal Soap on carved stone",
    "Ritual: Artisanal Soap on stone",
    "dark",
  ),
  ritualUbtan: a(
    "ritual-body-scrub.jpg",
    "Sacred Basil Aromatic Ubtan with a brass spoon",
    "Ritual: Aromatic Ubtan, close detail",
  ),
  ritualOil: a(
    "ritual-body-oil.jpg",
    "Sacred Basil Aromatic Body Oil in soft light",
    "Ritual: Aromatic Body Oil, backlit",
    "dark",
  ),
  ritualCandle: a(
    "ritual-candle.jpg",
    "Sacred Basil Scented Candle, lit, in a dim room",
    "Ritual: Scented Candle, lit",
    "dark",
  ),

  // Collections
  luxeKit: a(
    "luxe-bath-body-care-kit.jpg",
    "Sacred Basil Luxe Bath & Body Care Kit",
    "Luxe Bath & Body Care Kit, exact contents as reference",
  ),
  serenityBox: a("serenity-box.jpg", "Sacred Basil Serenity Box", "Serenity Box, as supplied reference"),
  tranquilBox: a("tranquil-box.jpg", "Sacred Basil Tranquil Box", "Tranquil Box, as supplied reference"),
  festiveSet: a(
    "diwali-gift-set-01.jpg",
    "Sacred Basil festive gift set: outer box, organza pouch, ubtan, soap and body oil",
    "Festive set: outer box, pouch, ubtan, soap, body oil",
  ),
  festiveSetAlt: a(
    "diwali-gift-set-02.jpg",
    "Stacked Sacred Basil festive boxes",
    "Festive set: stacked outer boxes",
    "dark",
  ),
  festiveSetDetail: a(
    "diwali-gift-set-03.jpg",
    "Organza pouch from the Sacred Basil festive gift set",
    "Festive set: organza pouch detail",
  ),
  customGifting: a(
    "corporate-gifting.jpg",
    "A row of Sacred Basil gift boxes prepared for a corporate order",
    "Corporate: several boxes, prepared for an order",
    "dark",
  ),
  luxuryGiftBox: a(
    "luxury-gift-box.jpg",
    "An open Sacred Basil gift box on cream linen",
    "Corporate: large gift box, open",
  ),

  // Editorial
  editorial01: a(
    "editorial-product-01.jpg",
    "Sacred Basil products among marigold petals",
    "Editorial: products with marigold petals",
    "dark",
  ),
  editorial02: a(
    "editorial-product-02.jpg",
    "Sacred Basil gift box beside carved stone",
    "Editorial: box against carved stone",
  ),
  story: a(
    "story-hands.jpg",
    "Hands tying the ribbon on a Sacred Basil gift box",
    "Story: hands finishing a gift box",
    "dark",
  ),
  stillLife: a(
    "still-life.jpg",
    "A quiet still life of a Sacred Basil gift set",
    "Still life: one gift set, near-empty frame",
  ),

  // Gifting moments
  momentFestivals: a("moment-festivals.jpg", "Sacred Basil gifts among diyas", "Moment: festivals, diyas", "dark"),
  momentCelebrations: a("moment-celebrations.jpg", "Sacred Basil gifts at a celebration", "Moment: celebrations"),
  momentThankYou: a("moment-thank-you.jpg", "A Sacred Basil gift with a handwritten note", "Moment: thank you"),
  momentClient: a("moment-client-gifting.jpg", "Sacred Basil gift boxes on a desk", "Moment: client gifting", "dark"),
  momentEmployee: a("moment-employee-gifting.jpg", "Sacred Basil gifts for a team", "Moment: employee gifting"),
  momentPersonal: a("moment-personal-ritual.jpg", "A Sacred Basil ritual at home", "Moment: personal ritual", "dark"),
} satisfies Record<string, Asset>;

export type AssetKey = keyof typeof assets;
