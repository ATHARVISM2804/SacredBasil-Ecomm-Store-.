/** Display helpers shared by admin pages. Times are shown in India Standard Time. */

const TZ = "Asia/Kolkata";

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

/** ISO timestamp for midnight IST, `daysAgo` days before today. */
export function istDayStart(daysAgo = 0) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
  const start = new Date(`${today}T00:00:00+05:30`);
  start.setUTCDate(start.getUTCDate() - daysAgo);
  return start.toISOString();
}

/** Converts a stored timestamp to a `datetime-local` value in IST. */
export function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parses a `datetime-local` value entered in IST. Returns null for blank, undefined for invalid. */
export function fromLocalInput(value: string): string | null | undefined {
  const v = value.trim();
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return undefined;
  const d = new Date(`${v}:00+05:30`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export const humanize = (s: string) => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

/** Strips characters that would break a PostgREST `or=` filter. */
export const sanitizeSearch = (q: string) => q.replace(/[,()*%\\:"']/g, " ").trim().slice(0, 80);

export function pageParam(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";
