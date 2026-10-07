"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminForAction } from "@/lib/admin/auth";
import { parseProductForm } from "@/lib/admin/product-form";
import { storagePathFromUrl } from "@/lib/admin/storage";
import type { ActionState } from "@/lib/admin/types";

function revalidateStorefront(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/collections");
  for (const slug of new Set(slugs)) revalidatePath(`/collections/${slug}`);
  revalidatePath("/admin/products");
}

export async function saveProduct(mode: "create" | "edit", _prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, message: "You are not authorised to do that. Please sign in again." };

  const parsed = parseProductForm(fd);
  if ("errors" in parsed) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: parsed.errors };
  }
  const input = parsed.input;
  const { supabase } = admin;

  const { data: slugOwner } = await supabase.from("products").select("id").eq("slug", input.slug).maybeSingle();
  if (slugOwner && slugOwner.id !== input.id) {
    return { ok: false, message: "That slug is already used by another product.", errors: { slug: "Already in use" } };
  }

  if (mode === "create") {
    const { error } = await supabase.from("products").insert(input);
    if (error) return { ok: false, message: `Could not create the product: ${error.message}` };
    revalidateStorefront(input.slug);
    redirect(`/admin/products/${encodeURIComponent(input.id)}?created=1`);
  }

  const { data: existing } = await supabase.from("products").select("slug, images").eq("id", input.id).maybeSingle();
  if (!existing) return { ok: false, message: "This product no longer exists." };

  const { id, ...changes } = input;
  const { error } = await supabase.from("products").update(changes).eq("id", id);
  if (error) return { ok: false, message: `Could not save: ${error.message}` };

  // Remove uploaded files that were taken off the product.
  const removed = (existing.images as string[])
    .filter((url) => !input.images.includes(url))
    .map(storagePathFromUrl)
    .filter((p): p is string => Boolean(p));
  let note = "";
  if (removed.length) {
    const { error: rmError } = await supabase.storage.from("product-images").remove(removed);
    if (rmError) note = ` (Some removed images could not be deleted from storage: ${rmError.message})`;
  }

  revalidateStorefront(input.slug, existing.slug as string);
  revalidatePath(`/admin/products/${id}`);
  return { ok: true, message: `Saved.${note}` };
}
