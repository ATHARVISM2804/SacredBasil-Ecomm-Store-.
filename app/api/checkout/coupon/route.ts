import { NextResponse } from "next/server";
import { isAdminDbConfigured } from "@/lib/payments/config";
import { parseLines, priceOnServer } from "@/lib/payments/checkout";
import { normaliseCouponCode } from "@/lib/payments/settings";
import type { Coupon } from "@/lib/cart/types";

/** Validates a coupon against the current bag, priced on the server. */
export async function POST(request: Request) {
  if (!isAdminDbConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "not_configured", message: "Codes can’t be applied just yet." },
      { status: 503 },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }
  const code = normaliseCouponCode(body.code);
  const lines = parseLines(body.lines);
  if (!code || !lines) return NextResponse.json({ ok: false, reason: "invalid", message: "Please enter a code." }, { status: 400 });

  try {
    const pricing = await priceOnServer(lines, code);
    if (!pricing.ok) return NextResponse.json({ ok: false, reason: pricing.reason, message: pricing.message }, { status: pricing.status });
    const c = pricing.coupon!;
    // The public shape of the code, so the summary can re-price live as the bag changes.
    const coupon: Coupon = { ...c, usageLimit: null, usedCount: 0 };
    return NextResponse.json({ ok: true, coupon, discount: pricing.totals.discount, total: pricing.totals.total });
  } catch (error) {
    console.error("[checkout/coupon]", error);
    return NextResponse.json({ ok: false, reason: "failed", message: "Couldn’t check that code. Please try again." }, { status: 502 });
  }
}
