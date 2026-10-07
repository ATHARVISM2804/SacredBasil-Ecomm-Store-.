"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LIMITS, normalisePhone, validateAddress, type FieldErrors } from "@/lib/cart/validation";

/**
 * Account mutations. Each runs as the signed-in user, so Row Level Security
 * limits it to that user's own rows; the session is still checked first.
 */

export type ActionResult = { ok: boolean; message?: string; fields?: FieldErrors };

async function session() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
}

const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function updateProfile(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const s = await session();
  if (!s) return { ok: false, message: "Please sign in again." };
  const fullName = text(fd, "full_name");
  const rawPhone = text(fd, "phone");
  const phone = rawPhone ? normalisePhone(rawPhone) : null;
  const fields: FieldErrors = {};
  if (fullName.length > LIMITS.name) fields.full_name = "That name is too long.";
  if (rawPhone && !phone) fields.phone = "Please enter a 10-digit Indian mobile number.";
  if (Object.keys(fields).length) return { ok: false, fields };

  const { error } = await s.supabase
    .from("profiles")
    .update({ full_name: fullName || null, phone })
    .eq("id", s.user.id);
  if (error) return { ok: false, message: "We couldn’t save your details. Please try again." };
  revalidatePath("/account");
  return { ok: true, message: "Saved." };
}

export async function saveAddress(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const s = await session();
  if (!s) return { ok: false, message: "Please sign in again." };

  const id = text(fd, "id");
  const input = {
    line1: text(fd, "line1"),
    line2: text(fd, "line2"),
    city: text(fd, "city"),
    state: text(fd, "state"),
    pincode: text(fd, "pincode"),
  };
  const fullName = text(fd, "full_name");
  const phone = normalisePhone(text(fd, "phone"));
  const label = text(fd, "label").slice(0, 40);
  const isDefault = fd.get("is_default") === "on";

  const fields = validateAddress(input);
  if (!fullName) fields.full_name = "Please enter the recipient’s name.";
  else if (fullName.length > LIMITS.name) fields.full_name = "That name is too long.";
  if (!phone) fields.phone = "Please enter a 10-digit Indian mobile number.";
  if (Object.keys(fields).length) return { ok: false, fields };

  const row = {
    user_id: s.user.id,
    label: label || null,
    full_name: fullName,
    phone: phone!,
    line1: input.line1,
    line2: input.line2 || null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    is_default: isDefault,
  };

  if (isDefault) {
    await s.supabase.from("addresses").update({ is_default: false }).eq("user_id", s.user.id);
  }
  const { error } = id
    ? await s.supabase.from("addresses").update(row).eq("id", id).eq("user_id", s.user.id)
    : await s.supabase.from("addresses").insert(row);
  if (error) return { ok: false, message: "We couldn’t save this address. Please try again." };
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved." };
}

export async function deleteAddress(fd: FormData) {
  const s = await session();
  if (!s) return;
  const id = text(fd, "id");
  if (!id) return;
  await s.supabase.from("addresses").delete().eq("id", id).eq("user_id", s.user.id);
  revalidatePath("/account/addresses");
}

export async function makeDefaultAddress(fd: FormData) {
  const s = await session();
  if (!s) return;
  const id = text(fd, "id");
  if (!id) return;
  await s.supabase.from("addresses").update({ is_default: false }).eq("user_id", s.user.id);
  await s.supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", s.user.id);
  revalidatePath("/account/addresses");
}

export async function removeFromWishlist(fd: FormData) {
  const s = await session();
  if (!s) return;
  const productId = text(fd, "product_id");
  if (!productId) return;
  await s.supabase.from("wishlist_items").delete().eq("user_id", s.user.id).eq("product_id", productId);
  revalidatePath("/account/wishlist");
}
