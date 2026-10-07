"use server";

import { revalidatePath } from "next/cache";
import { adminForAction } from "@/lib/admin/auth";
import { SHIPPING_MODES, type AnnouncementSetting, type ShippingSetting } from "@/lib/admin/settings";
import type { ActionState } from "@/lib/admin/types";

const denied: ActionState = { ok: false, message: "You are not authorised to do that. Please sign in again." };

async function upsert(key: string, value: unknown): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return denied;
  const { error } = await admin.supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) return { ok: false, message: `Could not save: ${error.message}` };
  // Settings appear across the storefront (announcement bar, cart, checkout).
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved." };
}

export async function saveAnnouncement(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await adminForAction())) return denied;
  const text = String(fd.get("text") ?? "").trim();
  const link = String(fd.get("link") ?? "").trim();
  const linkLabel = String(fd.get("linkLabel") ?? "").trim();
  const errors: Record<string, string> = {};
  if (text.length > 160) errors.text = "Keep it under 160 characters.";
  if (link && !(link.startsWith("/") || link.startsWith("https://"))) errors.link = "Use a site path (/...) or an https:// URL.";
  if (link && !linkLabel) errors.linkLabel = "Add a label for the link.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const value: AnnouncementSetting = { text };
  if (link) {
    value.link = link;
    value.linkLabel = linkLabel;
  }
  return upsert("announcement", value);
}

export async function saveShipping(_prev: ActionState, fd: FormData): Promise<ActionState> {
  if (!(await adminForAction())) return denied;
  const mode = String(fd.get("mode") ?? "") as ShippingSetting["mode"];
  const note = String(fd.get("note") ?? "").trim();
  const flatFee = String(fd.get("flatFee") ?? "").trim();
  const freeOver = String(fd.get("freeOver") ?? "").trim();
  const errors: Record<string, string> = {};
  if (!SHIPPING_MODES.includes(mode)) errors.mode = "Choose a shipping mode.";
  if ((mode === "flat" || mode === "free_over") && !/^\d+$/.test(flatFee)) errors.flatFee = "Whole rupees, 0 or more.";
  if (mode === "free_over" && (!/^\d+$/.test(freeOver) || Number(freeOver) < 1)) errors.freeOver = "Whole rupees above 0.";
  if (note.length > 300) errors.note = "Keep it under 300 characters.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors };

  const value: ShippingSetting = { mode, note };
  if (mode === "flat" || mode === "free_over") value.flatFee = Number(flatFee);
  if (mode === "free_over") value.freeOver = Number(freeOver);
  return upsert("shipping", value);
}
