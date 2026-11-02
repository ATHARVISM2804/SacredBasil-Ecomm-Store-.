import { site } from "@/data/site";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function absoluteUrl(path = "/") {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path}`;
}
