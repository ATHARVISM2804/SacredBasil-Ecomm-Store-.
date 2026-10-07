"use server";

import { revalidatePath } from "next/cache";
import { adminForAction } from "@/lib/admin/auth";
import { ENQUIRY_STATUSES, type ActionState, type EnquiryStatus } from "@/lib/admin/types";

export async function updateEnquiryStatus(id: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return { ok: false, message: "You are not authorised to do that. Please sign in again." };
  const status = String(fd.get("status") ?? "") as EnquiryStatus;
  if (!ENQUIRY_STATUSES.includes(status)) return { ok: false, message: "Choose a valid status." };

  const { data, error } = await admin.supabase.from("enquiries").update({ status }).eq("id", id).select("id");
  if (error) return { ok: false, message: `Could not update: ${error.message}` };
  if (!data?.length) return { ok: false, message: "Enquiry not found." };
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  return { ok: true, message: "Status updated." };
}
