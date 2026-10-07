import "server-only";

/**
 * Transactional email through the Resend REST API (no SDK).
 * Needs RESEND_API_KEY and RESEND_FROM_EMAIL (a sender on a verified domain,
 * e.g. "Sacred Basil <orders@sacredbasil.in>"). Without them every send is a
 * logged no-op, so nothing ever pretends an email went out.
 */

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export type EmailResult = { ok: true; id: string } | { ok: false; reason: "not_configured" | "failed" };

export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);

export const adminNotifyEmail = () => process.env.ADMIN_NOTIFY_EMAIL || null;

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.info(`[email] not configured; skipped "${message.subject}"`);
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status} for "${message.subject}"`);
      return { ok: false, reason: "failed" };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id ?? "" };
  } catch (error) {
    console.error(`[email] send failed for "${message.subject}"`, error);
    return { ok: false, reason: "failed" };
  }
}
