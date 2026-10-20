# Sacred Basil — Build Plan

Status: **approved 2026-10-03**. Phases run in order; each ends with a review before the next begins.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Payments | Razorpay (INR, UPI, cards, net-banking, wallets) |
| Hero film | AI image-to-video generated from real product photos, then converted to frames |
| Customer accounts | Guest checkout, with optional login for order history and saved addresses |

## Where we are (audited 2026-10-19)

Most of the store is built in code but switched off. The Supabase anon/service keys, the Razorpay keys and the Resend key are empty in `.env.local`. So the storefront serves the static `data/catalog.ts`, `/admin` shows the setup screen, and checkout shows "Online payment coming soon".

| Phase | Status |
| --- | --- |
| 0 Inputs and accounts | Partial: brochure and logo only; no product sheet; keys empty |
| 1 Art direction v3 | Partial: no Ingredients or Made-by-hand sections, no botanical line art |
| 2 Hero film | Done as a looping MP4 (desktop and mobile) with the official logo |
| 3 Data layer | Partial: core tables, RLS and seed exist; no reviews/collections/ingredients/audit tables; no RLS tests |
| 4 Admin catalogue | Mostly done: products CRUD, image upload, stock, settings; announcement bar never rendered on the storefront |
| 5 Storefront commerce | Partial: cart, drawer, wishlist, gift message; no filters/search/related/reviews |
| 6 Checkout and payments | Built (server pricing, Razorpay order, signature verify, webhook, idempotent paid); never run in test mode; no GST line or stock reservation |
| 7 Accounts and orders admin | Mostly done: OTP login, orders, addresses; admin orders, coupons, customers, enquiries; refunds manual; no GST invoice |
| 8 Essentials | Partial: policies exist but terms/privacy/returns are outdated; sitemap, robots and JSON-LD done; no lifecycle emails, analytics or consent |
| 9 QA and launch | Not started |

## Completion roadmap

Ordered so the site can take real orders as early as possible. Each step ends with a check.

### A. Brand imagery (in progress)
1. Remake the 32 images that carry the AI logo. Follow `docs/regen/README.md`: blank labels in ChatGPT, then `scripts/brandfix/regen.py` prints the official logo. **Check:** before/after review of every label; every page in Chrome on desktop and phone.
2. Commit the logo, hero and image work.

### B. Switch the store on (needs client accounts)
1. Supabase: create the project, add the keys, apply `supabase/migrations`, run the seed, promote the admin profile. **Check:** `/admin` logs in, products load from the database, RLS blocks anonymous writes.
2. Razorpay test keys plus webhook secret; Resend key with a verified domain. **Check:** a test payment succeeds, fails and retries, a webhook replay is ignored, and both emails arrive.
3. Render the announcement bar from settings on the storefront.

### C. Correct commerce gaps
1. GST breakdown at checkout and on the invoice (GSTIN, HSN, tax lines). Needs whether prices include GST.
2. Reserve stock at checkout and expire stale pending orders.
3. Rewrite the terms and privacy pages for online orders, accounts, payments and cookies; publish the real return and refund policy. Needs the client's policy.

### D. Product depth (Phase 1 and 5 leftovers)
1. Ingredients and how-to-use fields on product pages; Ingredients and Made-by-hand homepage sections. Needs client content.
2. Shop filters, sort and search; related products.
3. Reviews: decide whether they are wanted at launch.

### E. Launch readiness
1. Lifecycle emails (shipped, delivered); analytics behind a cookie-consent banner (if wanted).
2. Rate limits on enquiry, checkout and coupon APIs; security review.
3. Playwright end-to-end tests (browse, cart, checkout in test mode, admin fulfilment); Lighthouse and accessibility pass on mobile.
4. Razorpay live (KYC), Vercel domain, go live.
5. Housekeeping: update `README.md`; remove unused `data/assets.ts` and `components/ui/EditorialImage.tsx` if confirmed dead.

### Inputs needed from the client
- Product sheet for the four sets: confirmed contents, sizes, SKU, HSN/GST rate, stock, ingredients, how to use.
- Whether the studio range (bath salt, ubtan, candles, wax sachets) sells online, with prices.
- Legal name, GSTIN, registered address; shipping regions and rates; return, refund and cancellation policy; whether prices include GST.
- Accounts: Supabase, Razorpay (KYC for live), Resend domain, Vercel domain.
- Yes or no: Google sign-in, GA4/Meta pixel, newsletter, reviews at launch, gift wrap.

## What the finished site is

A premium, authentic D2C store for handmade natural wellness products. It should feel like Aesop or Forest Essentials, but warmer and more homemade:

- **Natural and handmade first.** Ingredients, small-batch making, hands, raw materials (tulsi, turmeric, sandalwood, rose, oils), paper and linen textures. The wine logo stays the anchor; botanical greens and earth tones support it.
- **Truthful.** Every ingredient, benefit and claim comes from the client. No invented certifications or "100% organic" unless proven.
- **Shoppable.** Real prices, a cart, checkout and payments, with corporate gifting kept as a major enquiry flow.
- **Self-run.** An admin panel manages products, stock, orders, customers, coupons and enquiries without a developer.

## Stack

| Need | Recommendation | Why |
| --- | --- | --- |
| Database, auth, file storage | **Supabase** (Postgres + Auth + Storage, with RLS) | One service for products, orders, customer login and product image uploads |
| Payments | **Razorpay** | UPI, cards, net-banking and wallets in INR; webhooks; refunds API |
| Email | **Resend** | Order confirmations, admin alerts, enquiry notifications |
| Shipping | Manual first (admin enters tracking), **Shiprocket** later | Ships without blocking launch |
| Hosting | **Vercel** + custom domain | Native to Next.js |
| Hero film | Image-to-video from real product photos, then a frame sequence | Packaging must match the real product |

## Phases

### Phase 0 — Inputs and accounts (client + us)
**Goal:** everything the build depends on.
- Product photography of every product and set, plus 4–6 "making" shots (hands, ingredients, process).
- Product sheet: name, price, size/weight, ingredients, how to use, contents of each set, stock, SKU, HSN/GST rate.
- Business details: legal name, GSTIN, address, support email/phone, shipping regions and rates, return/refund policy.
- Accounts: Supabase, Razorpay (test mode first), Resend, Vercel, domain.

**Done when** the product sheet and photos are in `docs/inputs/` and test keys are in `.env.local`.

### Phase 1 — Art direction v3: natural and homemade
**Goal:** the visual language matches handmade natural products.
- Add botanical and earth tones alongside wine/champagne, plus paper-grain texture and hand-drawn botanical line illustrations (ingredients rather than icons).
- New homepage sections: **Ingredients** (what goes in, sourced from the client's sheet) and **Made by hand** (process story).
- Product card and product page redesign for real photography.
- Lock down the type, spacing and motion rules.

**Done when** the homepage reads as natural, handmade and premium, signed off on desktop and mobile.

### Phase 2 — Hero scroll film
**Goal:** a cinematic background that plays as you scroll.
1. Generate a 6–8s film from the real product photos (image-to-video), using a slow camera move, golden light, botanicals and the product's packaging exactly as it is.
2. Extract frames with ffmpeg: about 120 frames at 1920w desktop and about 90 at 828w mobile portrait, in AVIF/WebP, under 6 MB per set.
3. Draw the frames on a canvas mapped to scroll (the `HeroMedia` component already supports this), with a poster image, progressive preloading and a reduced-motion fallback.

**Done when** the hero scrubs smoothly at 60fps on desktop and mid-range mobile, and LCP stays under 2.5s.

### Phase 3 — Data layer
**Goal:** the store runs on a real database.
- Schema: `products`, `product_variants`, `product_images`, `ingredients`, `collections`, `inventory`, `customers`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `coupons`, `reviews`, `enquiries`, `settings`, `admin_audit_log`.
- RLS policies, plus a seed from the client's product sheet.
- Storefront pages read from the database (cached and revalidated when admin edits).

**Done when** every product page renders from the database and RLS tests pass.

### Phase 4 — Admin panel, catalogue
**Goal:** the client manages the catalogue themselves.
- `/admin` behind Supabase Auth with an admin role.
- Products: create and edit, variants, prices, image upload and reorder, ingredients, publish/unpublish.
- Collections and gift sets with exact contents and quantities.
- Inventory with stock levels and low-stock flags.
- Settings: announcement bar, homepage featured products, shipping rates.

**Done when** the client can add a product end-to-end and see it live without a developer.

### Phase 5 — Storefront commerce
**Goal:** browsing and cart.
- Shop page with filters (collection, ingredient, price) and sorting.
- Product page: gallery, variants, quantity, ingredients, how to use, delivery info, reviews and related products.
- **Cart drawer and cart page**: persists across visits, merges a guest cart into an account on login, applies stock limits.
- Search, wishlist, gift options (gift note, gift wrap if offered) and recently viewed.

**Done when** add-to-cart works from every product surface and the cart survives a reload and a login.

### Phase 6 — Checkout and payments
**Goal:** taking money safely.
- Checkout: contact, address, shipping method, coupon, then an order summary with GST.
- The server creates the Razorpay order, then Razorpay Checkout opens. The payment signature is verified, and the **webhook is the source of truth**.
- Idempotent order creation, stock reserved at checkout and released on failure, and a failed or retry flow.
- Order confirmation page plus email to the customer and the admin.

**Done when** test-mode payments, failures, refunds and webhook replays all behave correctly.

### Phase 7 — Customer accounts and orders admin
**Goal:** the full order lifecycle.
- Customer: sign-in (email OTP or Google), order history, order status/tracking, saved addresses, wishlist.
- Admin: orders list and detail, status changes (paid → packed → shipped → delivered), tracking number, refunds via Razorpay, GST invoice PDF, customers, coupons, reviews moderation, corporate enquiries inbox, and a dashboard (sales, orders, low stock).

**Done when** an order can be taken from payment to delivered to refunded entirely in the admin.

### Phase 8 — E-commerce essentials
- Transactional emails (shipped, delivered, abandoned cart).
- Shiprocket integration (optional).
- Policies Razorpay requires: shipping, returns, refund, privacy, terms and contact.
- SEO: product schema with offers, sitemap, Open Graph images per product.
- Analytics (GA4, Meta pixel) behind cookie consent.
- Newsletter sign-up, WhatsApp chat link, reviews on product pages.

### Phase 9 — QA, security and launch
- Playwright end-to-end: browse → cart → checkout (Razorpay test) → admin fulfilment.
- Accessibility pass, Lighthouse performance budget, mobile device testing.
- Security review: RLS, admin route protection, webhook signature checks, rate limits, secrets.
- Switch Razorpay to live, connect the domain, go live.

## Ground rules carried over

- Never invent products, quantities, prices, ingredients, certifications or claims; the admin panel is where real values live.
- Product imagery must match the real packaging and contents.
- Spell the brand as **Sacred Basil**.
- Reduced motion, keyboard access and readable contrast throughout.
