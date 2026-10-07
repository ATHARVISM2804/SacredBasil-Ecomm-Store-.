"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { seedProducts as collections } from "@/data/catalog";
import { occasions, site } from "@/data/site";
import { submitEnquiry, validateEnquiry, type EnquiryData, type EnquiryFailure, type EnquiryKind } from "@/lib/enquiry";
import { cn } from "@/lib/utils";

type Props = { kind?: EnquiryKind; className?: string };

export function EnquiryForm(props: Props) {
  return (
    <Suspense fallback={<Form {...props} />}>
      <FormWithParams {...props} />
    </Suspense>
  );
}

function FormWithParams(props: Props) {
  const params = useSearchParams();
  const preset = params.get("collection");
  const product = params.get("product");
  return (
    <Form
      {...props}
      defaultCollection={collections.find((c) => c.slug === preset)?.name}
      defaultMessage={product ? `I'd like to know more about the ${product.slice(0, 80)}.` : undefined}
    />
  );
}

const failureCopy: Record<EnquiryFailure, string> = {
  invalid: "Please check the highlighted fields.",
  not_configured: "Online enquiries are not connected yet, so your details have not been sent. Please try again soon.",
  failed: "Your enquiry could not be sent. Please check your connection and try again.",
};

function Form({
  kind = "corporate",
  className,
  defaultCollection,
  defaultMessage,
}: Props & { defaultCollection?: string; defaultMessage?: string }) {
  const uid = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | EnquiryFailure>("idle");
  const [invalid, setInvalid] = useState<string[]>([]);
  const corporate = kind === "corporate";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = { kind, ...Object.fromEntries(form) } as EnquiryData;

    const missing = validateEnquiry(data);
    setInvalid(missing);
    if (missing.length) {
      setStatus("invalid");
      e.currentTarget.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    const result = await submitEnquiry(data);
    if (result.ok) setStatus("sent");
    else {
      setInvalid(result.fields ?? []);
      setStatus(result.reason);
    }
  }

  if (status === "sent") {
    return (
      <div className={cn("py-10", className)} role="status" aria-live="polite">
        <p className="eyebrow text-cocoa/60">Enquiry sent</p>
        <p className="mt-5 max-w-md font-display text-[clamp(2rem,3.2vw,3rem)] font-light leading-[1.1]">
          Thank you. Your enquiry is with us.
        </p>
        <p className="mt-5 max-w-sm text-cocoa/72">We will be in touch using the details you shared.</p>
        <button type="button" onClick={() => setStatus("idle")} className="btn btn-text mt-8 text-cocoa">
          Send another enquiry
        </button>
      </div>
    );
  }

  const f = (name: string) => ({
    id: `${uid}-${name}`,
    name,
    "aria-invalid": invalid.includes(name) || undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className={cn("grid gap-x-10 gap-y-8 sm:grid-cols-2", className)}>
      <Field label="Name" htmlFor={`${uid}-name`} required>
        <input {...f("name")} type="text" autoComplete="name" required />
      </Field>
      {corporate && (
        <Field label="Company" htmlFor={`${uid}-company`}>
          <input {...f("company")} type="text" autoComplete="organization" />
        </Field>
      )}
      <Field label="Email" htmlFor={`${uid}-email`} required>
        <input {...f("email")} type="email" autoComplete="email" inputMode="email" required />
      </Field>
      <Field label="Phone" htmlFor={`${uid}-phone`}>
        <input {...f("phone")} type="tel" autoComplete="tel" inputMode="tel" />
      </Field>

      {corporate && (
        <>
          <Field label="Number of gifts" htmlFor={`${uid}-quantity`}>
            <input {...f("quantity")} type="text" inputMode="numeric" placeholder="Approximate is fine" />
          </Field>
          <Field label="Occasion" htmlFor={`${uid}-occasion`}>
            <select {...f("occasion")} defaultValue="">
              <option value="" disabled>
                Select an occasion
              </option>
              {occasions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Preferred collection" htmlFor={`${uid}-collection`}>
            <select {...f("collection")} defaultValue={defaultCollection ?? ""}>
              <option value="">Not sure yet</option>
              {collections.map((c) => (
                <option key={c.slug}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget per gift" htmlFor={`${uid}-budget`}>
            <input {...f("budget")} type="text" placeholder="Optional" />
          </Field>
          <Field label="Delivery location" htmlFor={`${uid}-deliveryLocation`} className="sm:col-span-2">
            <input
              {...f("deliveryLocation")}
              type="text"
              autoComplete="address-level2"
              placeholder="City, or multiple cities"
            />
          </Field>
        </>
      )}

      <Field label="Message" htmlFor={`${uid}-message`} className="sm:col-span-2" required={!corporate}>
        <textarea
          {...f("message")}
          defaultValue={defaultMessage}
          rows={4}
          placeholder={
            corporate ? "Tell us about the occasion, timing and anything you have in mind" : "How can we help?"
          }
        />
      </Field>

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p
          role="alert"
          aria-live="assertive"
          className={cn("max-w-md text-sm", status in failureCopy ? "text-terracotta" : "sr-only")}
        >
          {status in failureCopy ? failureCopy[status as EnquiryFailure] : ""}
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary w-full justify-between sm:w-auto sm:justify-center disabled:opacity-60"
          data-cursor="open"
        >
          {status === "sending" ? "Sending" : "Send Enquiry"}
          <ArrowRight aria-hidden className="btn-arrow size-3.5" strokeWidth={1.25} />
        </button>
      </div>
      {site.contact.email && (
        <p className="text-sm text-cocoa/60 sm:col-span-2">
          Prefer email? Write to{" "}
          <a className="underline underline-offset-4" href={`mailto:${site.contact.email}`}>
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("field", className)}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span aria-hidden> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
    </div>
  );
}
