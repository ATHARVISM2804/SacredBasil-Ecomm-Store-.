"use client";

/** Browser side of Razorpay Standard Checkout. */

export type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayFailure = { error: { code?: string; description?: string; reason?: string } };

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", cb: (response: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

/** Loads checkout.js once; resolves when window.Razorpay is available. */
export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("browser only"));
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve() : reject(new Error("Razorpay unavailable")));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Could not load Razorpay"));
    };
    document.body.appendChild(script);
  });
  return loading;
}

export function openRazorpay(
  options: Omit<RazorpayOptions, "handler" | "modal">,
  callbacks: { onSuccess: (r: RazorpaySuccess) => void; onDismiss: () => void; onFailure: (r: RazorpayFailure) => void },
) {
  if (!window.Razorpay) throw new Error("Razorpay not loaded");
  const rzp = new window.Razorpay({
    ...options,
    handler: callbacks.onSuccess,
    modal: { ondismiss: callbacks.onDismiss, confirm_close: true },
  });
  rzp.on("payment.failed", callbacks.onFailure);
  rzp.open();
}
