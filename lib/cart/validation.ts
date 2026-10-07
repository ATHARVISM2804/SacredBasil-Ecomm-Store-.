import type { CheckoutAddress, CheckoutContact } from "./types";

/** States and union territories of India. */
export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_RE = /^[1-9][0-9]{5}$/;

/** Normalises an Indian mobile number to "+91XXXXXXXXXX", or null if invalid. */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[\s()-]/g, "").replace(/^\+?91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export const LIMITS = { name: 120, email: 254, line: 200, city: 80, gift: 300 } as const;

export type FieldErrors = Partial<Record<string, string>>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Shared by the checkout form and the create-order endpoint. */
export function validateContact(input: Partial<CheckoutContact>): FieldErrors {
  const e: FieldErrors = {};
  const name = str(input.name);
  const email = str(input.email);
  if (!name) e.name = "Please enter your full name.";
  else if (name.length > LIMITS.name) e.name = "That name is too long.";
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email) e.email = "Please enter a valid email address.";
  if (!normalisePhone(str(input.phone))) e.phone = "Please enter a 10-digit Indian mobile number.";
  return e;
}

export function validateAddress(input: Partial<CheckoutAddress>): FieldErrors {
  const e: FieldErrors = {};
  const line1 = str(input.line1);
  if (!line1) e.line1 = "Please enter your address.";
  else if (line1.length > LIMITS.line) e.line1 = "That address line is too long.";
  if (str(input.line2).length > LIMITS.line) e.line2 = "That address line is too long.";
  const city = str(input.city);
  if (!city) e.city = "Please enter your city.";
  else if (city.length > LIMITS.city) e.city = "That city name is too long.";
  if (!(INDIAN_STATES as readonly string[]).includes(str(input.state))) e.state = "Please choose your state.";
  if (!PINCODE_RE.test(str(input.pincode))) e.pincode = "Please enter a valid 6-digit PIN code.";
  return e;
}

export function cleanAddress(a: CheckoutAddress): CheckoutAddress & { country: "India" } {
  return {
    line1: str(a.line1),
    line2: str(a.line2) || undefined,
    city: str(a.city),
    state: str(a.state),
    pincode: str(a.pincode),
    country: "India",
  };
}
