import { NextResponse } from "next/server";
import { validateEnquiry, type EnquiryData } from "@/lib/enquiry";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAdminDbConfigured } from "@/lib/payments/config";
import { adminNotifyEmail, sendEmail } from "@/lib/email/send";
import { enquiryAdminEmail } from "@/lib/email/templates";

/**
 * Enquiry endpoint.
 *
 * Destinations (any that are configured are used):
 *  - Supabase: stored in public.enquiries with the service role, shown in /admin.
 *  - ENQUIRY_WEBHOOK_URL: forwarded as JSON (Formspree, Zapier/Make, a CRM);
 *    optional ENQUIRY_WEBHOOK_TOKEN is sent as a Bearer token.
 *  - Resend: the studio is emailed at ADMIN_NOTIFY_EMAIL (a courtesy copy;
 *    it does not count as delivery on its own).
 *
 * Success is reported only when the enquiry was stored or forwarded. With no
 * destination configured the endpoint reports `not_configured` and the site
 * never tells the visitor their enquiry was received.
 */

const clip = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export async function POST(request: Request) {
  let data: Partial<EnquiryData>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ reason: "invalid" }, { status: 400 });
  }

  // Silently accept bot submissions without forwarding them.
  if (data.website) return NextResponse.json({ ok: true });

  const fields = validateEnquiry(data);
  if (fields.length) return NextResponse.json({ reason: "invalid", fields }, { status: 422 });

  const enquiry = {
    kind: data.kind === "corporate" ? ("corporate" as const) : ("general" as const),
    name: clip(data.name, 200)!,
    email: clip(data.email, 254)!,
    phone: clip(data.phone, 40),
    company: clip(data.company, 200),
    quantity: clip(data.quantity, 100),
    occasion: clip(data.occasion, 100),
    collection: clip(data.collection, 200),
    budget: clip(data.budget, 100),
    deliveryLocation: clip(data.deliveryLocation, 200),
    message: clip(data.message, 5000),
  };

  const endpoint = process.env.ENQUIRY_WEBHOOK_URL;
  const canStore = isAdminDbConfigured();
  if (!canStore && !endpoint) return NextResponse.json({ reason: "not_configured" }, { status: 503 });

  const [stored, forwarded] = await Promise.all([
    canStore ? store(enquiry) : Promise.resolve(false),
    endpoint ? forward(endpoint, enquiry) : Promise.resolve(false),
  ]);

  if (!stored && !forwarded) return NextResponse.json({ reason: "failed" }, { status: 502 });

  const admin = adminNotifyEmail();
  if (admin) await sendEmail(enquiryAdminEmail(enquiry, admin));

  return NextResponse.json({ ok: true });
}

type Enquiry = {
  kind: "corporate" | "general";
  name: string;
  email: string;
  phone?: string;
  company?: string;
  quantity?: string;
  occasion?: string;
  collection?: string;
  budget?: string;
  deliveryLocation?: string;
  message?: string;
};

async function store(e: Enquiry) {
  try {
    const { error } = await createSupabaseAdminClient().from("enquiries").insert({
      kind: e.kind,
      name: e.name,
      email: e.email,
      phone: e.phone ?? null,
      company: e.company ?? null,
      quantity: e.quantity ?? null,
      occasion: e.occasion ?? null,
      collection: e.collection ?? null,
      budget: e.budget ?? null,
      delivery_location: e.deliveryLocation ?? null,
      message: e.message ?? null,
    });
    if (error) {
      console.error("[enquiry] store failed", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[enquiry] store failed", error);
    return false;
  }
}

async function forward(endpoint: string, e: Enquiry) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify({ ...e, source: "sacred-basil-website", submittedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
