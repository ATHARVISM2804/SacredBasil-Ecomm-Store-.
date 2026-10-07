import { supabaseUrl } from "@/lib/supabase/config";

export const PRODUCT_BUCKET = "product-images";

const publicPrefix = () => `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${PRODUCT_BUCKET}/`;

/** Object path inside the product bucket for an uploaded image URL, or null for site-local images. */
export function storagePathFromUrl(url: string): string | null {
  const prefix = publicPrefix();
  if (!supabaseUrl || !url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length));
}

/** Safe object name for an uploaded file. */
export function objectNameFor(file: File) {
  const dot = file.name.lastIndexOf(".");
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const base = (dot > 0 ? file.name.slice(0, dot) : file.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${Date.now().toString(36)}-${base || "image"}.${ext || "jpg"}`;
}
