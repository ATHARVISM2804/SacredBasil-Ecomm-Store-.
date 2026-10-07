"use server";

import { revalidatePath } from "next/cache";
import { adminForAction } from "@/lib/admin/auth";
import { canTransition } from "@/lib/admin/orders";
import { ORDER_STATUSES, type ActionState, type OrderStatus } from "@/lib/admin/types";

const denied: ActionState = { ok: false, message: "You are not authorised to do that. Please sign in again." };

async function currentStatus(supabase: NonNullable<Awaited<ReturnType<typeof adminForAction>>>["supabase"], id: string) {
  const { data } = await supabase.from("orders").select("status").eq("id", id).maybeSingle();
  return (data?.status as OrderStatus | undefined) ?? null;
}

export async function updateOrderStatus(orderId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return denied;
  const next = String(fd.get("status") ?? "") as OrderStatus;
  const note = String(fd.get("note") ?? "").trim().slice(0, 1000) || null;
  if (!ORDER_STATUSES.includes(next)) return { ok: false, message: "Choose a status." };

  const from = await currentStatus(admin.supabase, orderId);
  if (!from) return { ok: false, message: "Order not found." };
  if (!canTransition(from, next)) return { ok: false, message: `An order that is ${from} cannot be moved to ${next}.` };

  const { data, error } = await admin.supabase
    .from("orders")
    .update({ status: next })
    .eq("id", orderId)
    .eq("status", from)
    .select("id");
  if (error) return { ok: false, message: `Could not update the order: ${error.message}` };
  if (!data?.length) return { ok: false, message: "The order changed while you were editing. Reload and try again." };

  const { error: eventError } = await admin.supabase
    .from("order_events")
    .insert({ order_id: orderId, status: next, note, actor: admin.user.id });
  revalidatePath(`/admin/orders/${orderId}`);
  if (eventError) return { ok: true, message: `Status updated, but the timeline entry failed: ${eventError.message}` };
  return { ok: true, message: `Order marked ${next}.` };
}

export async function updateTracking(orderId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return denied;
  const carrier = String(fd.get("tracking_carrier") ?? "").trim().slice(0, 120);
  const number = String(fd.get("tracking_number") ?? "").trim().slice(0, 120);

  const from = await currentStatus(admin.supabase, orderId);
  if (!from) return { ok: false, message: "Order not found." };

  const { error } = await admin.supabase
    .from("orders")
    .update({ tracking_carrier: carrier || null, tracking_number: number || null })
    .eq("id", orderId);
  if (error) return { ok: false, message: `Could not save tracking: ${error.message}` };

  await admin.supabase.from("order_events").insert({
    order_id: orderId,
    status: from,
    note: carrier || number ? `Tracking: ${[carrier, number].filter(Boolean).join(" ")}` : "Tracking details cleared",
    actor: admin.user.id,
  });
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Tracking saved." };
}

export async function addOrderNote(orderId: string, _prev: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await adminForAction();
  if (!admin) return denied;
  const note = String(fd.get("note") ?? "").trim().slice(0, 2000);
  if (!note) return { ok: false, message: "Write a note first.", errors: { note: "Required" } };

  const from = await currentStatus(admin.supabase, orderId);
  if (!from) return { ok: false, message: "Order not found." };

  const { error } = await admin.supabase
    .from("order_events")
    .insert({ order_id: orderId, status: from, note, actor: admin.user.id, internal: true });
  if (error) return { ok: false, message: `Could not add the note: ${error.message}` };
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Note added." };
}
