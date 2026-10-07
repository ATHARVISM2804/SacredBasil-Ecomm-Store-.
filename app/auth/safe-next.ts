/**
 * Only same-site paths are allowed as post-login destinations. The value is
 * parsed the way the browser will parse it (which strips tabs and newlines and
 * treats "\" as "/"), and rejected unless it stays on this origin.
 */
export function safeNext(next: string | null | undefined, fallback = "/account") {
  if (!next || !next.startsWith("/")) return fallback;
  const base = "https://same-site.invalid";
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return fallback;
  }
  if (url.origin !== base) return fallback;
  // Dot segments can normalise to "//host", which a browser reads as another site.
  if (url.pathname.startsWith("//")) return fallback;
  return url.pathname + url.search + url.hash;
}
