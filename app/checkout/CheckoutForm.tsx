"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/data/site";
import { formatINR } from "@/lib/catalog/pricing";
import { couponMessage } from "@/lib/cart/pricing";
import { refreshCatalog } from "@/lib/cart/catalog";
import { usePricedCart } from "@/lib/cart/usePricedCart";
import { INDIAN_STATES, LIMITS, validateAddress, validateContact, type FieldErrors } from "@/lib/cart/validation";
import type {
  CheckoutAddress,
  CheckoutContact,
  CheckoutFailure,
  Coupon,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/lib/cart/types";
import { loadRazorpay, openRazorpay, type RazorpaySuccess } from "@/lib/payments/razorpay-client";
import { ProductThumb } from "@/components/cart/ProductThumb";
import { cn } from "@/lib/utils";

export type SavedAddress = {
  id: string;
  label: string | null;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type CheckoutCustomer = { email: string; name: string; phone: string; addresses: SavedAddress[] };

type Phase = "idle" | "creating" | "paying" | "verifying" | "retry";

const EMPTY_ADDRESS: CheckoutAddress = { line1: "", line2: "", city: "", state: "", pincode: "" };

const fromSaved = (a: SavedAddress): CheckoutAddress => ({
  line1: a.line1,
  line2: a.line2 ?? "",
  city: a.city,
  state: a.state,
  pincode: a.pincode,
});

const displayPhone = (p: string) => p.replace(/^\+91/, "");

export function CheckoutForm({
  customer,
  paymentsReady,
  accountsEnabled,
}: {
  customer: CheckoutCustomer | null;
  paymentsReady: boolean;
  accountsEnabled: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const defaultAddress = customer?.addresses[0];

  const [contact, setContact] = useState<CheckoutContact>({
    name: customer?.name || defaultAddress?.full_name || "",
    email: customer?.email ?? "",
    phone: displayPhone(customer?.phone || defaultAddress?.phone || ""),
  });
  const [addressId, setAddressId] = useState<string>(defaultAddress?.id ?? "new");
  const [address, setAddress] = useState<CheckoutAddress>(defaultAddress ? fromSaved(defaultAddress) : EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(false);
  const [gift, setGift] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponNote, setCouponNote] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [notice, setNotice] = useState<{ tone: "error" | "info"; text: string } | null>(null);
  const pending = useRef<{ order: CreateOrderResponse; signature: string } | null>(null);

  const { totals, status, cart } = usePricedCart(coupon);

  useEffect(() => {
    if (paymentsReady) loadRazorpay().catch(() => {});
  }, [paymentsReady]);

  const busy = phase === "creating" || phase === "paying" || phase === "verifying";
  const couponApplied = coupon && totals?.couponCode === coupon.code;

  if (!cart.hydrated) return <p className="mt-16 text-cocoa/60">Loading your bag…</p>;

  if (cart.lines.length === 0) {
    return (
      <div className="mt-16 max-w-lg">
        <p className="lede text-cocoa/72">Your bag is empty.</p>
        <Link href="/collections" className="btn btn-primary mt-10">
          Explore the collections
        </Link>
      </div>
    );
  }

  const chooseAddress = (id: string) => {
    setAddressId(id);
    const saved = customer?.addresses.find((a) => a.id === id);
    setAddress(saved ? fromSaved(saved) : EMPTY_ADDRESS);
    if (saved && !contact.phone) setContact((c) => ({ ...c, phone: displayPhone(saved.phone) }));
    setErrors({});
  };

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponNote(null);
    try {
      const res = await fetch("/api/checkout/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, lines: cart.lines }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; coupon?: Coupon; message?: string };
      if (res.ok && data.ok && data.coupon) {
        setCoupon(data.coupon);
        setCouponInput("");
      } else {
        setCouponNote(data.message ?? "This code isn’t valid.");
      }
    } catch {
      setCouponNote("Couldn’t check that code. Please try again.");
    } finally {
      setCouponBusy(false);
    }
  };

  const signature = () =>
    JSON.stringify({ l: cart.lines, contact, address, gift: gift.trim(), c: couponApplied ? coupon.code : null, t: totals?.total });

  const pay = (order: CreateOrderResponse) => {
    setPhase("paying");
    openRazorpay(
      {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: site.name,
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: order.prefill,
        notes: { order_number: order.orderNumber },
        theme: { color: "#3e271b" },
      },
      {
        onSuccess: (r) => void verify(r, order),
        onDismiss: () => {
          setPhase("retry");
          setNotice({
            tone: "info",
            text: `Payment wasn’t completed. Your order ${order.orderNumber} is saved — you can try again whenever you’re ready.`,
          });
        },
        onFailure: (r) => {
          setNotice({
            tone: "error",
            text: r.error.description
              ? `${r.error.description} You can retry in the payment window or choose another method.`
              : "The payment didn’t go through. You can retry or choose another method.",
          });
        },
      },
    );
  };

  const verify = async (r: RazorpaySuccess, order: CreateOrderResponse) => {
    setPhase("verifying");
    setNotice({ tone: "info", text: "Confirming your payment…" });
    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const data = (await res.json().catch(() => ({}))) as { orderNumber?: string; token?: string };
      if (res.ok && data.orderNumber && data.token) {
        pending.current = null;
        cart.clear();
        router.replace(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}&token=${encodeURIComponent(data.token)}`);
        return;
      }
      setPhase("retry");
      setNotice({
        tone: "error",
        text: `We received a response from the payment provider but couldn’t confirm it yet. Please don’t pay again — if your account was charged, order ${order.orderNumber} will be confirmed by email shortly. Questions: ${site.contact.email}.`,
      });
    } catch {
      setPhase("retry");
      setNotice({
        tone: "error",
        text: `We couldn’t reach our server to confirm your payment. Please don’t pay again — if your account was charged, order ${order.orderNumber} will be confirmed by email shortly. Questions: ${site.contact.email}.`,
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentsReady || busy || !totals) return;

    const found = { ...validateContact(contact), ...validateAddress(address) };
    if (gift.trim().length > LIMITS.gift) found.giftMessage = "Please keep the gift message under 300 characters.";
    setErrors(found);
    if (Object.keys(found).length) {
      setNotice({ tone: "error", text: "Please check the highlighted details." });
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    if (totals.hasIssues) {
      setNotice({ tone: "error", text: "Some items in your bag need attention. Please review your bag." });
      return;
    }

    setNotice(null);
    const sig = signature();
    if (pending.current?.signature === sig) {
      try {
        await loadRazorpay();
        pay(pending.current.order);
      } catch {
        setPhase("retry");
        setNotice({ tone: "error", text: "The payment window couldn’t load. Please check your connection and try again." });
      }
      return;
    }

    setPhase("creating");
    const body: CreateOrderRequest = {
      lines: cart.lines,
      contact,
      address,
      giftMessage: gift.trim() || undefined,
      couponCode: couponApplied ? coupon.code : undefined,
      expectedTotal: totals.total,
      saveAddress: Boolean(customer) && addressId === "new" && saveAddress,
    };
    try {
      const [res] = await Promise.all([
        fetch("/api/checkout/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
        loadRazorpay(),
      ]);
      const data = (await res.json().catch(() => ({}))) as Partial<CreateOrderResponse> & {
        reason?: CheckoutFailure;
        message?: string;
        fields?: FieldErrors;
      };
      if (!res.ok || !data.razorpayOrderId) {
        setPhase("idle");
        if (data.fields) setErrors(data.fields);
        if (data.reason === "price_changed" || data.reason === "cart_invalid") refreshCatalog();
        if (data.reason === "coupon_invalid") {
          setCoupon(null);
          setCouponNote(data.message ?? couponMessage("not_found"));
        }
        setNotice({
          tone: "error",
          text:
            data.reason === "payments_not_configured"
              ? "Online payments are being set up. Please enquire and we’ll arrange your order directly."
              : (data.message ?? "We couldn’t start the payment. Please try again in a moment."),
        });
        return;
      }
      const order = data as CreateOrderResponse;
      pending.current = { order, signature: sig };
      pay(order);
    } catch {
      setPhase("idle");
      setNotice({ tone: "error", text: "We couldn’t start the payment. Please check your connection and try again." });
    }
  };

  const field = (
    name: string,
    label: string,
    input: React.ReactElement<{ id?: string }>,
    opts: { className?: string; hint?: string } = {},
  ) => {
    const id = `${uid}-${name}`;
    return (
      <div className={cn("field", opts.className)}>
        <label htmlFor={id}>{label}</label>
        {input}
        {errors[name] ? (
          <p id={`${id}-error`} className="text-[0.8rem] text-terracotta">
            {errors[name]}
          </p>
        ) : (
          opts.hint && <p className="text-[0.8rem] text-cocoa/55">{opts.hint}</p>
        )}
      </div>
    );
  };

  const inputProps = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
    disabled: busy,
  });

  const setAddr = (k: keyof CheckoutAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress((a) => ({ ...a, [k]: e.target.value }));
  const setCont = (k: keyof CheckoutContact) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact((c) => ({ ...c, [k]: e.target.value }));

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20">
      <div className="space-y-14">
        {!paymentsReady && (
          <div className="border border-gold/50 bg-cream/50 p-6" role="note">
            <p className="font-display text-xl text-chocolate">Online payments are being set up</p>
            <p className="mt-2 text-sm text-cocoa/75">
              We’re not taking card or UPI payments on the site just yet. Please{" "}
              <Link href="/corporate-gifting#enquire" className="underline underline-offset-4">
                send us an enquiry
              </Link>{" "}
              or write to{" "}
              <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
                {site.contact.email}
              </a>{" "}
              and we’ll arrange your order directly.
            </p>
          </div>
        )}

        <fieldset className="space-y-8">
          <legend className="display-sub mb-8 text-chocolate">Contact</legend>
          {!customer && accountsEnabled && (
            <p className="-mt-4 text-sm text-cocoa/65">
              Have an account?{" "}
              <Link href="/account/login?next=/checkout" className="underline underline-offset-4">
                Sign in
              </Link>{" "}
              for faster checkout, or continue as a guest.
            </p>
          )}
          {field("name", "Full name", <input {...inputProps("name")} autoComplete="name" value={contact.name} onChange={setCont("name")} maxLength={LIMITS.name} />)}
          <div className="grid gap-8 md:grid-cols-2">
            {field(
              "email",
              "Email",
              <input {...inputProps("email")} type="email" autoComplete="email" value={contact.email} onChange={setCont("email")} maxLength={LIMITS.email} />,
              { hint: "Your confirmation is sent here." },
            )}
            {field(
              "phone",
              "Mobile",
              <input {...inputProps("phone")} type="tel" autoComplete="tel-national" inputMode="tel" placeholder="98765 43210" value={contact.phone} onChange={setCont("phone")} maxLength={16} />,
              { hint: "For delivery updates." },
            )}
          </div>
        </fieldset>

        <fieldset className="space-y-8">
          <legend className="display-sub mb-8 text-chocolate">Delivery address</legend>
          {customer && customer.addresses.length > 0 && (
            <div className="field">
              <label htmlFor={`${uid}-saved`}>Saved addresses</label>
              <select id={`${uid}-saved`} value={addressId} onChange={(e) => chooseAddress(e.target.value)} disabled={busy}>
                {customer.addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {(a.label ? `${a.label} — ` : "") + `${a.line1}, ${a.city}`}
                  </option>
                ))}
                <option value="new">A new address</option>
              </select>
            </div>
          )}
          {field("line1", "Address", <input {...inputProps("line1")} autoComplete="address-line1" value={address.line1} onChange={setAddr("line1")} maxLength={LIMITS.line} placeholder="House / flat, building, street" />)}
          {field("line2", "Area, landmark (optional)", <input {...inputProps("line2")} autoComplete="address-line2" value={address.line2} onChange={setAddr("line2")} maxLength={LIMITS.line} />)}
          <div className="grid gap-8 md:grid-cols-3">
            {field("city", "City", <input {...inputProps("city")} autoComplete="address-level2" value={address.city} onChange={setAddr("city")} maxLength={LIMITS.city} />)}
            {field(
              "state",
              "State",
              <select {...inputProps("state")} autoComplete="address-level1" value={address.state} onChange={setAddr("state")}>
                <option value="">Select</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>,
            )}
            {field(
              "pincode",
              "PIN code",
              <input {...inputProps("pincode")} autoComplete="postal-code" inputMode="numeric" value={address.pincode} onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))} />,
            )}
          </div>
          {customer && addressId === "new" && (
            <label className="flex items-center gap-3 text-sm text-cocoa/75">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="size-4 accent-[var(--color-chocolate)]" />
              Save this address to my account
            </label>
          )}
          <p className="text-[0.8rem] text-cocoa/55">We deliver across India.</p>
        </fieldset>

        <fieldset className="space-y-8">
          <legend className="display-sub mb-8 text-chocolate">A gift?</legend>
          {field(
            "giftMessage",
            "Gift message (optional)",
            <textarea {...inputProps("giftMessage")} value={gift} onChange={(e) => setGift(e.target.value)} maxLength={LIMITS.gift} rows={3} placeholder="We’ll include your message with the gift." />,
            { hint: `${gift.length}/${LIMITS.gift}` },
          )}
        </fieldset>
      </div>

      <aside aria-label="Order summary" className="h-fit border border-[var(--line)] bg-cream/40 p-6 md:p-8 lg:sticky lg:top-32">
        <h2 className="display-sub text-chocolate">Order summary</h2>
        {status === "loading" && <p className="mt-6 text-sm text-cocoa/60">Loading…</p>}
        {status === "error" && <p className="mt-6 text-sm text-terracotta">We couldn’t load prices. Please refresh.</p>}
        {totals && (
          <>
            <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {totals.lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-4">
                  <ProductThumb src={l.product?.images[0]} alt="" className="aspect-[4/5] w-14" sizes="56px" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-display text-base leading-tight text-chocolate">{l.product?.name ?? "Unavailable item"}</p>
                    {l.variantName && <p className="text-cocoa/60">{l.variantName}</p>}
                    <p className="text-cocoa/60 tabular-nums">
                      {l.quantity} × {formatINR(l.unitPrice)}
                    </p>
                    {l.issue && <p className="text-terracotta">Needs attention — review your bag</p>}
                  </div>
                  <p className="text-sm tabular-nums">{l.issue ? "—" : formatINR(l.lineTotal)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              {couponApplied ? (
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Code <strong className="font-medium">{coupon.code}</strong> applied
                  </span>
                  <button type="button" onClick={() => setCoupon(null)} className="text-cocoa/60 underline underline-offset-4" disabled={busy}>
                    Remove
                  </button>
                </div>
              ) : (
                <div className="field">
                  <label htmlFor={`${uid}-coupon`}>Gift or discount code</label>
                  <div className="flex items-end gap-3">
                    <input
                      id={`${uid}-coupon`}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyCoupon();
                        }
                      }}
                      maxLength={40}
                      autoComplete="off"
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => void applyCoupon()}
                      disabled={couponBusy || busy || !couponInput.trim()}
                      className="eyebrow shrink-0 pb-3 text-chocolate disabled:opacity-40"
                    >
                      {couponBusy ? "Checking…" : "Apply"}
                    </button>
                  </div>
                </div>
              )}
              {(couponNote || (coupon && totals.couponRejection)) && (
                <p className="mt-2 text-[0.8rem] text-terracotta" role="status">
                  {couponNote ?? couponMessage(totals.couponRejection!, coupon!)}
                </p>
              )}
            </div>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-cocoa/70">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(totals.subtotal)}</dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-gold">
                  <dt>Discount ({totals.couponCode})</dt>
                  <dd className="tabular-nums">−{formatINR(totals.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-cocoa/70">Shipping</dt>
                <dd className="tabular-nums">
                  {totals.shippingSeparate ? "Charged separately" : totals.shipping ? formatINR(totals.shipping) : "Complimentary"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-[var(--line)] pt-4">
                <dt className="eyebrow text-cocoa/75">Total</dt>
                <dd className="font-display text-3xl text-chocolate tabular-nums">{formatINR(totals.total)}</dd>
              </div>
            </dl>
            {totals.shippingSeparate && <p className="mt-3 text-[0.8rem] leading-relaxed text-cocoa/60">{totals.shippingNote}</p>}
            <p className="mt-3 text-[0.8rem] leading-relaxed text-cocoa/60">
              Every kit is handcrafted to order: allow 7–8 business days for production before dispatch.
            </p>
          </>
        )}

        {notice && (
          <p
            className={cn("mt-6 text-sm", notice.tone === "error" ? "text-terracotta" : "text-cocoa/80")}
            role={notice.tone === "error" ? "alert" : "status"}
          >
            {notice.text}
          </p>
        )}

        <button
          type="submit"
          disabled={!paymentsReady || busy || !totals || totals.hasIssues}
          className="btn btn-primary mt-6 w-full justify-center disabled:pointer-events-none disabled:opacity-50"
        >
          {!paymentsReady
            ? "Online payment coming soon"
            : phase === "creating"
              ? "Preparing…"
              : phase === "paying"
                ? "Complete payment in the window…"
                : phase === "verifying"
                  ? "Confirming…"
                  : phase === "retry"
                    ? "Try payment again"
                    : totals
                      ? `Pay ${formatINR(totals.total)}`
                      : "Pay"}
        </button>
        <p className="mt-3 text-center text-[0.75rem] text-cocoa/55">
          Payments are processed securely by Razorpay. By paying you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4">
            terms
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}
