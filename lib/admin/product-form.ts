import type { PriceTier, ProductItem, ProductVariant } from "@/lib/catalog/types";

/** The product columns written by the admin form. */
export type ProductInput = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  short_description: string;
  description: string;
  images: string[];
  contents: ProductItem[];
  packaging: string;
  dimensions: string | null;
  variants: ProductVariant[] | null;
  tiers: PriceTier[];
  bespoke_from: number | null;
  customisation: string | null;
  stock: number | null;
  status: "active" | "draft";
  featured: boolean;
  sort_order: number;
};

/** Editor row for a price tier, as typed (strings, blank max = "and above"). */
export type TierDraft = { min: string; max: string; unitPrice: string };

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const isInt = (s: string) => /^\d+$/.test(s.trim());

/**
 * Validates price tiers: whole rupees, positive, ascending and contiguous
 * (each tier starts one above the previous maximum); only the last tier may
 * be open-ended. Returns the parsed tiers or an error message.
 */
export function validateTiers(drafts: TierDraft[]): { tiers: PriceTier[] } | { error: string } {
  if (drafts.length === 0) return { error: "Add at least one price tier." };
  const tiers: PriceTier[] = [];
  for (const [i, d] of drafts.entries()) {
    const n = i + 1;
    if (!isInt(d.min) || Number(d.min) < 1) return { error: `Tier ${n}: minimum must be a whole number of 1 or more.` };
    if (d.max.trim() !== "" && !isInt(d.max)) return { error: `Tier ${n}: maximum must be a whole number or blank.` };
    if (!isInt(d.unitPrice) || Number(d.unitPrice) < 1)
      return { error: `Tier ${n}: unit price must be a whole number of rupees above 0.` };
    const tier: PriceTier = {
      min: Number(d.min),
      max: d.max.trim() === "" ? null : Number(d.max),
      unitPrice: Number(d.unitPrice),
    };
    if (tier.max !== null && tier.max < tier.min) return { error: `Tier ${n}: maximum is below the minimum.` };
    const prev = tiers[i - 1];
    if (prev) {
      if (prev.max === null) return { error: `Tier ${i}: only the last tier can be open-ended ("and above").` };
      if (tier.min !== prev.max + 1)
        return { error: `Tier ${n}: should start at ${prev.max + 1}, right after the previous tier, with no gaps or overlaps.` };
    }
    tiers.push(tier);
  }
  return { tiers };
}

function parseJson<T>(raw: FormDataEntryValue | null, fallback: T): T {
  if (typeof raw !== "string" || !raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};

const optionalInt = (raw: string): number | null | undefined => {
  if (raw === "") return null;
  return isInt(raw) ? Number(raw) : undefined;
};

/** Parses and validates the product editor's FormData. */
export function parseProductForm(fd: FormData): { input: ProductInput } | { errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const id = str(fd, "id");
  const name = str(fd, "name");
  const slug = str(fd, "slug");
  if (!ID_RE.test(id)) errors.id = "Invalid product id.";
  if (!name) errors.name = "Name is required.";
  if (!SLUG_RE.test(slug)) errors.slug = "Use lowercase letters, numbers and single hyphens, e.g. tranquil-box.";

  const contentsRaw = parseJson<{ name: string; quantity: string; size: string; note: string }[]>(fd.get("contents"), []);
  const contents: ProductItem[] = [];
  for (const [i, c] of contentsRaw.entries()) {
    const itemName = String(c.name ?? "").trim();
    const qty = String(c.quantity ?? "").trim();
    if (!itemName && !qty && !String(c.size ?? "").trim() && !String(c.note ?? "").trim()) continue; // empty row
    if (!itemName) errors.contents = `Contents row ${i + 1}: name is required.`;
    else if (!isInt(qty) || Number(qty) < 1) errors.contents = `Contents row ${i + 1}: quantity must be 1 or more.`;
    const item: ProductItem = { name: itemName, quantity: Number(qty) };
    const size = String(c.size ?? "").trim();
    const note = String(c.note ?? "").trim();
    if (size) item.size = size;
    if (note) item.note = note;
    contents.push(item);
  }

  const variantsRaw = parseJson<{ id: string; name: string }[]>(fd.get("variants"), []);
  const variants: ProductVariant[] = [];
  for (const [i, v] of variantsRaw.entries()) {
    const vName = String(v.name ?? "").trim();
    if (!vName) continue;
    const vId = String(v.id ?? "").trim() || slugify(vName);
    if (!SLUG_RE.test(vId)) errors.variants = `Variant ${i + 1}: id must be lowercase letters, numbers and hyphens.`;
    if (variants.some((x) => x.id === vId)) errors.variants = `Variant ids must be unique ("${vId}" repeats).`;
    variants.push({ id: vId, name: vName });
  }

  const tierResult = validateTiers(parseJson<TierDraft[]>(fd.get("tiers"), []));
  if ("error" in tierResult) errors.tiers = tierResult.error;

  const images = parseJson<string[]>(fd.get("images"), []).filter((s) => typeof s === "string" && s.trim());
  if (images.some((s) => !(s.startsWith("/") || s.startsWith("https://"))))
    errors.images = "Images must be site paths (/images/...) or uploaded https URLs.";
  if (images.length > 12) errors.images = "Up to 12 images per product.";

  const bespoke = optionalInt(str(fd, "bespoke_from"));
  if (bespoke === undefined || bespoke === 0) errors.bespoke_from = "Whole number above 0, or leave blank.";
  const stock = optionalInt(str(fd, "stock"));
  if (stock === undefined) errors.stock = "Whole number of 0 or more, or leave blank for made to order.";
  const sortRaw = str(fd, "sort_order") || "0";
  if (!/^-?\d+$/.test(sortRaw)) errors.sort_order = "Whole number.";

  const status = str(fd, "status");
  if (status !== "active" && status !== "draft") errors.status = "Choose draft or active.";
  if (status === "active" && images.length === 0) errors.images = "Add at least one image before making a product active.";

  if (Object.keys(errors).length > 0 || "error" in tierResult) return { errors };

  return {
    input: {
      id,
      slug,
      name,
      tagline: str(fd, "tagline"),
      short_description: str(fd, "short_description"),
      description: str(fd, "description"),
      images,
      contents,
      packaging: str(fd, "packaging"),
      dimensions: str(fd, "dimensions") || null,
      variants: variants.length ? variants : null,
      tiers: tierResult.tiers,
      bespoke_from: bespoke ?? null,
      customisation: str(fd, "customisation") || null,
      stock: stock ?? null,
      status: status as "active" | "draft",
      featured: fd.get("featured") === "on",
      sort_order: Number(sortRaw),
    },
  };
}
