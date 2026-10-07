export type EnquiryKind = "corporate" | "general";

export type EnquiryData = {
  kind: EnquiryKind;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  quantity?: string;
  occasion?: string;
  collection?: string;
  budget?: string;
  deliveryLocation?: string;
  message?: string;
  /** Honeypot. Must stay empty. */
  website?: string;
};

export type EnquiryFailure = "invalid" | "not_configured" | "failed";
export type EnquiryResult = { ok: true } | { ok: false; reason: EnquiryFailure; fields?: string[] };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEnquiry(data: Partial<EnquiryData>): string[] {
  const missing: string[] = [];
  if (!data.name?.trim()) missing.push("name");
  if (!data.email?.trim() || !EMAIL.test(data.email.trim())) missing.push("email");
  if (data.kind === "general" && !data.message?.trim()) missing.push("message");
  return missing;
}

/**
 * Client-side submission. Posts to /api/enquiry, which forwards to the
 * configured provider (webhook, Formspree, Resend, CRM). Returns success
 * only when the server confirms delivery.
 */
export async function submitEnquiry(data: EnquiryData): Promise<EnquiryResult> {
  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => ({}))) as { reason?: EnquiryFailure; fields?: string[] };
    return { ok: false, reason: body.reason ?? "failed", fields: body.fields };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
