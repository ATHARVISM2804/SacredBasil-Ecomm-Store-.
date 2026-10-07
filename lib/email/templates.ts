import "server-only";
import { orderTerms, site } from "@/data/site";
import { formatINR } from "@/lib/catalog/pricing";
import type { EmailMessage } from "./send";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export type EmailOrder = {
  order_number: string;
  customer_name: string;
  email: string;
  phone: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; pincode: string };
  gift_message: string | null;
  subtotal: number;
  discount: number;
  coupon_code: string | null;
  shipping_fee: number;
  total: number;
  items: { product_name: string; variant: string | null; quantity: number; unit_price: number; line_total: number }[];
};

const layout = (body: string) => `<!doctype html><html><body style="margin:0;background:#f6f0e8;font-family:Georgia,serif;color:#3a261b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f0e8;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffaf3;border:1px solid #e4d7c4;padding:40px 32px">
<tr><td style="font-size:22px;letter-spacing:0.18em;text-transform:uppercase;color:#3e271b;padding-bottom:24px">Sacred Basil</td></tr>
<tr><td style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7">${body}</td></tr>
</table></td></tr></table></body></html>`;

function itemsTable(o: EmailOrder) {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee3d3">${esc(i.product_name)}${i.variant ? ` <span style="color:#8a7360">(${esc(i.variant)})</span>` : ""} × ${i.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee3d3">${formatINR(i.line_total)}</td></tr>`,
    )
    .join("");
  const totals = [
    ["Subtotal", formatINR(o.subtotal)],
    ...(o.discount ? [[`Discount${o.coupon_code ? ` (${esc(o.coupon_code)})` : ""}`, `−${formatINR(o.discount)}`]] : []),
    ["Shipping", o.shipping_fee ? formatINR(o.shipping_fee) : "Charged separately"],
    ["<strong>Total paid</strong>", `<strong>${formatINR(o.total)}</strong>`],
  ]
    .map(([k, v]) => `<tr><td style="padding:4px 0">${k}</td><td align="right" style="padding:4px 0">${v}</td></tr>`)
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">${rows}${totals}</table>`;
}

const addressText = (a: EmailOrder["shipping_address"]) =>
  [a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`].filter(Boolean).join(", ");

const itemsText = (o: EmailOrder) =>
  o.items.map((i) => `- ${i.product_name}${i.variant ? ` (${i.variant})` : ""} x ${i.quantity}: ${formatINR(i.line_total)}`).join("\n");

export function orderConfirmationEmail(o: EmailOrder): EmailMessage {
  const first = o.customer_name.split(" ")[0];
  const shippingLine = o.shipping_fee
    ? ""
    : `<p>${esc(orderTerms.shipping)} We will be in touch with the shipping cost and options for your destination.</p>`;
  return {
    to: o.email,
    replyTo: site.contact.email,
    subject: `Your Sacred Basil order ${o.order_number} is confirmed`,
    html: layout(`<p>Dear ${esc(first)},</p>
<p>Thank you for your order. Your payment has been received and order <strong>${esc(o.order_number)}</strong> is confirmed.</p>
${itemsTable(o)}
<p><strong>Delivering to:</strong> ${esc(addressText(o.shipping_address))}</p>
${o.gift_message ? `<p><strong>Gift message:</strong> ${esc(o.gift_message)}</p>` : ""}
<p><strong>What happens next.</strong> ${esc(orderTerms.productionTime)}</p>
${shippingLine}
<p>Questions? Reply to this email or write to ${esc(site.contact.email)}.</p>
<p style="color:#8a7360">With warmth,<br>Sacred Basil</p>`),
    text: `Dear ${first},

Thank you for your order. Your payment has been received and order ${o.order_number} is confirmed.

${itemsText(o)}
Subtotal: ${formatINR(o.subtotal)}${o.discount ? `\nDiscount: -${formatINR(o.discount)}` : ""}
Shipping: ${o.shipping_fee ? formatINR(o.shipping_fee) : "charged separately"}
Total paid: ${formatINR(o.total)}

Delivering to: ${addressText(o.shipping_address)}
${o.gift_message ? `Gift message: ${o.gift_message}\n` : ""}
What happens next: ${orderTerms.productionTime}
${o.shipping_fee ? "" : `${orderTerms.shipping} We will be in touch with the shipping cost for your destination.\n`}
Questions? Write to ${site.contact.email}.

Sacred Basil`,
  };
}

export function adminOrderEmail(o: EmailOrder, to: string): EmailMessage {
  return {
    to,
    replyTo: o.email,
    subject: `New paid order ${o.order_number} — ${formatINR(o.total)}`,
    html: layout(`<p><strong>${esc(o.order_number)}</strong> has been paid.</p>
<p>${esc(o.customer_name)} · ${esc(o.email)} · ${esc(o.phone)}</p>
${itemsTable(o)}
<p><strong>Ship to:</strong> ${esc(addressText(o.shipping_address))}</p>
${o.gift_message ? `<p><strong>Gift message:</strong> ${esc(o.gift_message)}</p>` : ""}`),
    text: `${o.order_number} has been paid.
${o.customer_name} / ${o.email} / ${o.phone}

${itemsText(o)}
Total paid: ${formatINR(o.total)}
Ship to: ${addressText(o.shipping_address)}
${o.gift_message ? `Gift message: ${o.gift_message}` : ""}`,
  };
}

export function enquiryAdminEmail(e: Record<string, string | undefined>, to: string): EmailMessage {
  const fields = Object.entries(e).filter(([, v]) => v && v.trim());
  return {
    to,
    replyTo: e.email,
    subject: `New ${e.kind === "corporate" ? "corporate gifting " : ""}enquiry from ${e.name}`,
    html: layout(
      `<table role="presentation" cellpadding="0" cellspacing="0">${fields
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 16px 4px 0;color:#8a7360;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;white-space:pre-wrap">${esc(v!)}</td></tr>`,
        )
        .join("")}</table>`,
    ),
    text: fields.map(([k, v]) => `${k}: ${v}`).join("\n"),
  };
}
