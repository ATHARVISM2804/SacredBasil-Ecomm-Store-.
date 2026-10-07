"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminForAction } from "@/lib/admin/auth";
import { fromLocalInput } from "@/lib/admin/format";
import type { ActionState } from "@/lib/admin/types";

const denied: ActionState = { ok: false, message: "You are not authorised to do that. Please sign in again." };
const isInt = (s: string) => /^\d+$/.test(s);

export async function saveCoupon(mode: "create" | "edit", _prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return denied;

  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const errors: Record<string, string> = {};

  const code = get("code").toUpperCase();
  const kind = get("kind");
  const value = get("value");
  const minSubtotal = get("min_subtotal") || "0";
  const usageLimit = get("usage_limit");
  const startsAt = fromLocalInput(get("starts_at"));
  const endsAt = fromLocalInput(get("ends_at"));

  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) errors.code = "3–32 characters: letters, numbers, - or _.";
  if (kind !== "percent" && kind !== "flat") errors.kind = "Choose percent or flat.";
  if (!isInt(value) || Number(value) < 1) errors.value = "Whole number above 0.";
  else if (kind === "percent" && Number(value) > 100) errors.value = "A percentage cannot exceed 100.";
  if (!isInt(minSubtotal)) errors.min_subtotal = "Whole rupees, 0 or more.";
  if (usageLimit && (!isInt(usageLimit) || Number(usageLimit) < 1)) errors.usage_limit = "Whole number above 0, or blank.";
  if (startsAt === undefined) errors.starts_at = "Invalid date.";
  if (endsAt === undefined) errors.ends_at = "Invalid date.";
  if (startsAt && endsAt && endsAt <= startsAt) errors.ends_at = "Must be after the start.";

  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const row = {
    kind,
    value: Number(value),
    min_subtotal: Number(minSubtotal),
    active: fd.get("active") === "on",
    starts_at: startsAt ?? null,
    ends_at: endsAt ?? null,
    usage_limit: usageLimit ? Number(usageLimit) : null,
  };

  if (mode === "create") {
    const { error } = await admin.supabase.from("coupons").insert({ code, ...row });
    if (error) {
      if (error.code === "23505") return { ok: false, message: "A coupon with that code already exists.", errors: { code: "Exists" } };
      return { ok: false, message: `Could not create the coupon: ${error.message}` };
    }
    revalidatePath("/admin/coupons");
    redirect("/admin/coupons?created=" + encodeURIComponent(code));
  }

  const { data, error } = await admin.supabase.from("coupons").update(row).eq("code", code).select("code");
  if (error) return { ok: false, message: `Could not save: ${error.message}` };
  if (!data?.length) return { ok: false, message: "Coupon not found." };
  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${encodeURIComponent(code)}`);
  return { ok: true, message: "Coupon saved." };
}

export async function deleteCoupon(code: string): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return denied;
  const { error } = await admin.supabase.from("coupons").delete().eq("code", code);
  if (error) return { ok: false, message: `Could not delete: ${error.message}` };
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?deleted=" + encodeURIComponent(code));
}
