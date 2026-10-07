import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseAdminClient, createSupabasePublicClient } from "@/lib/supabase/server";
import { DEFAULT_SHIPPING } from "@/lib/cart/pricing";
import type { Coupon, ShippingSetting } from "@/lib/cart/types";
import { isAdminDbConfigured } from "./config";

const MODES = ["separate", "flat", "free_over"] as const;
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v) : undefined);

/** The `shipping` settings row, or the brochure default (shipping charged separately). */
export async function loadShippingSetting(): Promise<ShippingSetting> {
  if (!isSupabaseConfigured) return DEFAULT_SHIPPING;
  const { data, error } = await createSupabasePublicClient()
    .from("settings")
    .select("value")
    .eq("key", "shipping")
    .maybeSingle();
  if (error) throw new Error(`Could not load shipping settings: ${error.message}`);
  const v = (data?.value ?? null) as Record<string, unknown> | null;
  if (!v || !MODES.includes(v.mode as ShippingSetting["mode"])) return DEFAULT_SHIPPING;
  return {
    mode: v.mode as ShippingSetting["mode"],
    flatFee: num(v.flatFee),
    freeOver: num(v.freeOver),
    note: typeof v.note === "string" ? v.note : undefined,
  };
}

type CouponRow = {
  code: string;
  kind: "percent" | "flat";
  value: number;
  min_subtotal: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
};

export const normaliseCouponCode = (code: unknown) =>
  typeof code === "string" ? code.trim().toUpperCase().slice(0, 40) : "";

/** Looks a coupon up with the service role (coupons are not publicly readable). */
export async function loadCoupon(code: string): Promise<Coupon | null> {
  if (!code || !isAdminDbConfigured()) return null;
  const { data, error } = await createSupabaseAdminClient()
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(`Could not load coupon: ${error.message}`);
  if (!data) return null;
  const r = data as CouponRow;
  return {
    code: r.code,
    kind: r.kind,
    value: r.value,
    minSubtotal: r.min_subtotal,
    active: r.active,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    usageLimit: r.usage_limit,
    usedCount: r.used_count,
  };
}
