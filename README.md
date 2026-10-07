# Sacred Basil

Website for Sacred Basil: handcrafted wellness, thoughtfully gifted.
Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis.

Specs live in `docs/spec/`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph |
| `ENQUIRY_WEBHOOK_URL` | Where enquiries are POSTed as JSON (Formspree, a Resend function, Zapier/Make, CRM) |
| `ENQUIRY_WEBHOOK_TOKEN` | Optional bearer token for the webhook |

Without `ENQUIRY_WEBHOOK_URL`, the forms tell visitors that online enquiries are not connected yet. They never claim an enquiry was received.

## Content still to be supplied by the client

Everything below is wired up; supply the material and it appears. No component changes needed.

| What | Where |
| --- | --- |
| **Photography** (every frame currently shows a captioned placeholder) | Drop files in `public/images/sacred-basil/` using the filenames in `data/assets.ts`, then add each filename to the `delivered` set in that file. |
| **Hero film or frame sequence** | `heroMedia` in `data/assets.ts` (MP4/WebM, or ordered frame URLs with an optional mobile set) |
| **Contents of Luxe Bath & Body Care Kit, Serenity Box, Tranquil Box** | `data/collections.ts` (see `CLIENT TO CONFIRM` notes) |
| Prices, minimum quantities, lead times, personalisation options | `price` in `data/collections.ts`; `corporateTerms` in `data/site.ts` |
| Contact email/phone, social links | `site.contact`, `site.social` in `data/site.ts` |
| Founder profiles (the section is hidden until entries exist) | `data/story.ts` |
| Privacy and terms review | `app/privacy`, `app/terms` |

Until photos arrive, each frame shows a quiet product stage with the debossed SB monogram. Set `site.showPlaceholderCaptions = true` to show, in each frame, which photograph belongs there.

## Brand

The logo is traced from `docs/brand/sacred-basil-logo-original.png` into `components/ui/logo-paths.ts` (used by `<Logo variant="monogram | wordmark | lockup" />`) and `public/brand/*.svg`. Colours come from the logo: wine `#3F0D19` and champagne `#CFC0A6`, on ivory and cream.

Product rule: photographs and `contents` must match the supplied references exactly — same packaging, same box configuration, same product count.

## Structure

```
app/                 routes (home, collections/[slug], corporate-gifting, our-story, contact, privacy, terms, api/enquiry)
components/          hero/ navigation/ sections/ collections/ gallery/ forms/ footer/ ui/
data/                site.ts, assets.ts, collections.ts, story.ts: all content
lib/                 animations.ts (reveal system), enquiry.ts, utils.ts, useMediaQuery.ts
```

Scroll reveals are declarative: add `data-reveal="fade" | "mask" | "image"` (optionally `data-reveal-delay`) or `data-parallax="6"` to any element. Everything stands down under `prefers-reduced-motion`.
