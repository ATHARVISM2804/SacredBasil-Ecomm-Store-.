# Sacred Basil — Build Plan

Status: **approved 2026-10-03**. Phases run in order; each ends with a review before the next begins.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |
| Payments | Razorpay (INR, UPI, cards, net-banking, wallets) |
| Hero film | AI image-to-video generated from real product photos, then converted to frames |
| Customer accounts | Guest checkout, with optional login for order history and saved addresses |

## Where we are

A Next.js 16 marketing site with the real SB logo, the wine/champagne palette, six homepage sections, collection and product pages, corporate enquiry, and a scroll-reveal system. There's no database, no cart and no payments. Product photography is still missing, and the contents of three sets are unconfirmed.

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
