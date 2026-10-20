# Sacred Basil revamp: the Skandinavisk standard

Studied 2026-10-20 in Chrome: skandinavisk.com home, the SKOG collection page, the SKOG 350g candle product page and About. This plan keeps what already works underneath (cart, checkout, Razorpay, accounts, admin, tests) and rebuilds the look, the film, the imagery and the page structure.

---

## 1. What makes Skandinavisk feel premium (observed, not guessed)

| Element | What they do | Measured / seen |
| --- | --- | --- |
| Hero film | A real, cinematic, **58-second** seasonal film, not a product slideshow. Story chapters: a hand strikes a match, a starry forest night, a candle on pine needles, a candle beside linen and bread, a ribbon-wrapped perfume on deep red, a hand lighting a red gift candle, a trio of lit candles, the flames blown out with smoke rising, and an end card with the wordmark over the product. Gold brand icons (their own symbols) animate as a pattern between shots. | Vimeo file "AW26_MasterVideo_1920x720": **ultra-wide 8:3 (1920×720)**, about 550 px tall on a 1470 px screen, **not full-screen**. Muted autoplay loop with a sound toggle bottom-right. No text over the film. |
| Typography | **One** custom geometric sans for everything (logo wordmark, nav, headings, body). Small and quiet: product names 14 px, section headings about 18 to 32 px, regular weight, no bold, no italics. | `Skandinavisk` font, 16 px body, weight 400. |
| Colour | Black text on white. Colour comes only from photography and the product glass. Small badges: gold `#BA8E23` "NEW LIMITED EDITION", black "BESTSELLER", green "SAVE £10". Black announcement bar and buttons. | |
| Header | Two rows: wordmark left with search, account and bag icons right; then category nav left (Candles & Diffuser, Body, Eau de Parfum, Scent Collections, Gifts, Bundles, Archive) and brand nav right (Store, About, Voices Journal). Mega menus with image tiles. | 93 px tall. |
| Product grids | **Edge to edge, four across, no gutters.** Packshots on a pale grey studio background, all the same angle and scale. Name and price centred underneath, small. "Add to cart" appears on hover. | |
| Storytelling tiles | 50/50 full-bleed photo pairs (Home collection / Body collection, Scent library / Sustainability) with a small pale label box in the middle. Wide lifestyle banners with a headline and one button on the left ("Introducing HYGGE for the skin"). | |
| Collection worlds | Each scent is a world (SKOG = forest, HAV = sea, FJORD …): a full-bleed landscape hero with name and tagline, a short centred intro ("Lose yourself in the forest"), the full product grid, then **the word and its meaning** ("SKOG ['skuːg], Swedish/Norwegian for 'forest'"), scent notes and a cross-sell. | |
| Product page | Left: big packshot slider on grey. Right: small tagline, title, 3–4 plain bullets (feeling, scent notes, special edition, size and burn time), price and badge, a full-width black **Add to cart**, three ticks (free shipping, free sample, secure payments), then accordions: **Ingredients, Materials, How to use, Sustainability**. Below that: landscape image, "Scent notes" text and a lifestyle photo in three panels, then "You may also like". A **sticky add-to-cart bar** follows you down the page. | |
| Community | "As seen on the socials" grid of creator photos; a "Voices Journal" of three dated articles; a newsletter popup ("Join the inner circle", 10% off first order) and a footer newsletter. | |
| Trust | B Corp badge, sustainability page, materials spelled out. | |

**In one line:** quiet type, one font, big honest photography, edge-to-edge grids, every product belongs to a "world" with a story and a word.

---

## 2. Sacred Basil translation

We borrow the **system**, not the Nordic look. Sacred Basil's world is Indian, Ayurvedic, handmade and festive: brass, stone, marigold, tulsi, sandalwood, turmeric, rose, diya light, dawn. The logo and the chocolate-and-gold box stay the brand anchors.

| Skandinavisk | Sacred Basil equivalent |
| --- | --- |
| Scent worlds (SKOG, HAV, FJORD) | **Ritual worlds**: **Snaan** (bath: scrubs, ubtan, bath salt, soap), **Abhyanga** (body oil), **Deepa** (light: candles, wax sachets), **Utsav** (festive gift sets). Built only from products that exist; the names are real Sanskrit/Hindi words. |
| SKOG ['skuːg] "forest" | **तुलसी Tulsi** "holy basil, the brand's namesake"; **अभ्यंग Abhyanga** "the Ayurvedic ritual of warm-oil massage"; **उबटन Ubtan** "a traditional herbal cleansing paste"; **दीप Deepa** "lamp, light". Same layout: Devanagari, transliteration, meaning. |
| Pale grey packshot grid | Packshots on warm **sand `#EFE7DC`**, same angle and scale for every product. |
| Gold icon pattern in the film | The **SB monogram + lotus** as an animated gold-foil pattern, built in code from our exact vector, so the logo is always correct. |
| Black UI | **Deep chocolate `#2E1E16`** UI (bar, buttons) with gold `#B8904A` badges. |
| B Corp / sustainability | "Doctor-led, handmade in Pune, small batch". Only claims the client confirms. |
| Voices Journal | **Rituals Journal**: Diwali gifting guides, how to use ubtan, the founders' story. Optional at launch. |
| As seen on the socials | Instagram grid from the client's account (needs the handle). |

### Design system v4
- **Type:** one family carries the site, like Skandinavisk. Recommended: **Jost** (already loaded; geometric, very close to their face) at 400 for everything, with sizes 13 / 14 / 16 / 20 / 28 / 40. Cormorant is retired from the UI and kept only inside the logo. *(Decision D2.)*
- **Colour:** white `#FFFFFF` page, sand `#EFE7DC` image backgrounds, chocolate `#2E1E16` text and buttons, gold `#B8904A` badges and accents only, marigold `#D9822B` reserved for one festive moment.
- **Layout:** edge-to-edge grids (0 gutter, 4 / 2 / 1 columns), 50/50 full-bleed tiles, generous whitespace only around text blocks. Square corners.
- **Motion:** almost none: image fade-in, a gentle hover zoom on tiles, mega-menu fade. The current scroll-reveal choreography is removed (it reads "template").
- **Badges:** NEW, BESTSELLER, LIMITED (Diwali), BULK PRICE.

---

## 3. The hero film: "Diwali Dawn"

Same structure as theirs: cinematic, about 45–60 seconds, **ultra-wide 8:3 on desktop (1920×720)**, **4:5 on mobile (1080×1350)**, muted autoplay loop, sound toggle, no text over the film.

### Storyboard (12 shots, about 4–5 s each)
1. **Dark.** A hand strikes a matchstick; the flame flares. *(Echoes their opening.)*
2. Dawn light through a jali screen onto a stone floor; dust in the light.
3. Macro: tulsi leaves with dew, swaying.
4. A brass diya being lit; marigold petals scattered on travertine.
5. **Gold monogram pattern transition**, made in code with our exact SB + lotus vector, gold foil shimmer.
6. Hands pour golden body oil into a small brass bowl (slow motion).
7. Hands mix ubtan paste in a stone bowl: turmeric, sandalwood powder.
8. Rose-petal soap bar on wet stone, water droplets.
9. The chocolate Luxe box: a hand lifts the lid; warm light spills out. *Logo must show: see the rule below.*
10. Products in the box, slow push-in (the corrected still with a camera move).
11. A hand ties a gold ribbon on a gift box; the candle flame is gently blown out, smoke curls *(their ending, on a candle outside the box)*.
12. **End card:** the SACRED BASIL lockup in gold foil over the product group, made in code.

### The logo rule (why the old film failed)
AI video cannot draw the SB monogram. So:
- **Live or AI footage only shows unbranded moments**: hands, ingredients, light, textures, labels turned away or out of focus.
- **Every shot where the logo is visible** (9, 10, 12, plus transition 5) is either built from our corrected stills with camera moves (current method), or animated in code from the vector.
- Result: the logo is 100% correct in every frame.

### How we make the footage *(Decision D1)*
- **A. Real shoot (recommended for authenticity).** A half-day with a phone (iPhone 15 Pro or better, 4K 24/25 fps, Cinematic or Log) at the founders' studio, with the shot list and lighting notes I will write. This gives real hands and real products, the "handmade" truth the brand stands on.
- **B. AI footage.** Google Flow / Veo 3, Kling or Runway for shots 1–4, 6–8 and 11 only; I write every prompt. Costs credits; I check every clip frame by frame.
- **C. Hybrid.** Shoot what's easy (hands, oil, ubtan, soap); AI for atmosphere (dawn light, tulsi dew).

I then edit, grade (warm, deep shadows, gold highlights), build the transitions and end card, and export desktop 1920×720 and mobile 1080×1350 in H.264 and WebM under 8 MB each, plus posters.

---

## 4. Site map and page designs

### Header (rebuilt)
- Row 1: announcement bar (chocolate, admin-editable), already wired.
- Row 2: **SACRED BASIL** wordmark left (the monogram appears in the footer and favicon); search, account and bag right.
- Row 3: **Bath & Body · Candles & Home · Gift Sets · Corporate Gifting · Ritual Worlds** left; **Our Story · Journal · Contact** right.
- Mega menus with two image tiles each. Mobile: a full-screen menu with the same groups.

### Home
1. Hero film (8:3), with a sound toggle.
2. **Diwali Gifting Collection**: four gift sets in an edge-to-edge grid, gold "LIMITED" badge, then "Shop all gift sets".
3. **Full-bleed 50/50 tiles**: "Bath & Body" / "Candles & Home".
4. **Wide banner**: "Introducing the Luxe Bath & Body Care Kit" with one button, on a lifestyle photo.
5. **Favourites** carousel: best-selling products across the range.
6. **Ritual worlds strip**: four landscape tiles (Snaan, Abhyanga, Deepa, Utsav).
7. **Corporate gifting** wide banner: "Gifting for 100 to 5,000", with a quote button.
8. **As seen on Instagram** grid.
9. **Rituals Journal**: three articles (optional at launch).
10. Two tiles: "Our ingredients" / "Our story".
11. Footer: support, about, newsletter (10% off if approved), payment and trust row.

### Shop / category (Bath & Body, Candles & Home, Gift Sets)
A small header (name and one line), then filter chips (type, price), then a 4-column edge-to-edge packshot grid. Sold by quantity tiers where they apply.

### Ritual world page (like SKOG)
Full-bleed landscape hero with the world name and tagline, a centred intro paragraph, the product grid, the **Devanagari word + meaning** panel, an "ingredients" panel (from the client's sheet), and a cross-sell.

### Product page (rebuilt like theirs)
- Left: packshot slider (sand background) plus lifestyle images.
- Right: ritual tagline, name, 3–4 bullets (what it is, key ingredients, size, handmade in Pune), price and badges, quantity tier table (gift sets), a full-width **Add to bag**, three ticks (dispatch time, gift-ready packaging, secure payment), then accordions: **Ingredients · How to use · Contents & size · Shipping & returns**.
- Below: ingredient panel (macro photo + notes + lifestyle), "You may also like", and a **sticky add-to-bag bar**.

### Corporate Gifting
A wide film still hero, "Gifting for teams", logos of past clients (if allowed), the four sets with bulk tiers, previous work gallery (the corrected images), a process in four steps, and the enquiry form (existing).

### Our Story
Split layout like their About: text left, founders' photo right. Then a wide studio photo, "Doctor-led. Handmade. Small batch." and a vision statement. Founders' real photos only.

### Journal (phase 2), Contact / Store, policy pages
Restyled to the new system.

---

## 5. Imagery plan (all images replaced)

Every image is in the same visual language: warm daylight, stone and brass, sand backgrounds, chocolate and gold.

| Set | Count | Use | How |
| --- | --- | --- | --- |
| **Packshots** | 1 per product (4 sets + about 10 studio items) and 1 per variant | Grids, product pages | Best: real product photos on a sand sweep (phone, a daylight window, white card bounce); I cut out, colour-match and set them on an identical background. AI fallback: blank-label render plus logo printed by our pipeline. |
| **Product page galleries** | 3–4 per product | Detail, open box, texture, in hand | Same as above. |
| **Lifestyle banners** | 6 | Home tiles and banners | AI or shoot, logo rule applies. |
| **Ritual world heroes** | 4 | Snaan: water on stone; Abhyanga: oil and brass; Deepa: diya light; Utsav: marigold and gift | Landscape or texture photos with no products; AI is safe here (no logo). |
| **Ingredient macros** | 6–8 | Tulsi, rose, turmeric, sandalwood, oils, soy wax | AI or stock; no logo. |
| **Corporate** | 3 | Stacks of boxes, a gifting table | Existing corrected images, regraded. |
| **Founders / studio** | 2–4 | Our Story | Real photos only (the current ones are AI; I recommend replacing them). |

The 32 ChatGPT logo remakes (`docs/regen/`) still apply to anything we keep. New images follow the same rule: **the logo is never left to AI**.

---

## 6. Build phases

| Phase | Work | Check |
| --- | --- | --- |
| **R0 Decisions** | D1–D6 below | Answers in this file |
| **R1 Design system** | Tokens (type, colour, spacing), new Button, Badge, ProductTile, EdgeGrid, SplitTiles, WideBanner, Accordion, StickyBar; remove the reveal choreography | Style page at `/styleguide`; Lighthouse on mobile |
| **R2 Header, footer, menus** | Two-row header, mega menus, mobile menu, new footer with newsletter | Keyboard and screen reader; phone and desktop in Chrome |
| **R3 Catalogue structure** | Categories and ritual worlds in data (and the Supabase seed); studio items become products if D3 = yes | e2e: every category lists its products |
| **R4 Pages** | Home, category, ritual world, product page, corporate, story, contact, policies | e2e updated; visual check at 390 / 768 / 1440 |
| **R5 Imagery** | Packshots, galleries, banners, world heroes, ingredient macros | Every image reviewed; logo correct; WebP/AVIF under budget |
| **R6 Hero film** | Shoot or AI generation, edit, grade, code-built transitions and end card, exports | Frame-by-frame logo check; loop seam; mobile and desktop files |
| **R7 Polish and launch** | Newsletter (Resend), Instagram grid, journal (optional), SEO per page, performance budget (LCP < 2.5 s on mobile) | Lighthouse ≥ 90; Playwright suite green |

Commerce work from `docs/PLAN.md` (Supabase, Razorpay test, GST, policies) continues in parallel. The revamp doesn't change it.

---

## 7. Decisions needed

- **D1 Film footage:** A real shoot (recommended), B AI, or C hybrid?
- **D2 Type:** one sans for everything like Skandinavisk (recommended), or keep the Cormorant serif for big headings?
- **D3 Catalogue:** sell the studio range online (bath salt, ubtan, candles, wax sachets, glycerine soap)? A Skandinavisk-style shop needs more than four products; prices are required.
- **D4 Ritual world names:** Snaan / Abhyanga / Deepa / Utsav, or plain English (Bath, Body, Light, Festive)?
- **D5 Newsletter offer:** 10% off the first order, yes or no?
- **D6 Real photos:** can the client photograph the products and the founders (I'll send a one-page shot guide)? This lifts the site more than anything else.

---

## 8. Execution v2 (2026-10-20): "same as Skandinavisk, with the Sacred Basil essence"

### 8.1 Product photography: packshots on white
Skandinavisk lists every product as a **packshot**: the product alone, centred, on a seamless pale background, same camera height, same light, a soft contact shadow, no props. We copy this exactly.

- **Background:** warm off-white `#F3F1EE` seamless sweep, the same for every product. **Light:** large soft key from the front-left, gentle fill, soft shadow under the product. **Camera:** eye level, slight top-down (about 10°), 100 mm. **Frame:** 4:5, product filling about 60% of the height, centred.
- **Labels and boxes are generated BLANK** (plain chocolate label, plain lid). I then print the exact official logo, product name and lid text with our pipeline (`scripts/brandfix`). That way no AI logo ever ships.
- **Shot list:**
  - **Gift sets:** Luxe box closed; Luxe box open with its 5 pieces; Tranquil Box; Serenity Box; Festive Ritual Box; Festive Ritual Pouch.
  - **Pieces** (product-page galleries and "what's inside"): Body Scrub; Face Scrub; Body Oil 30 ml; Artisanal Soap; Scented Candle; Aromatic Body Oil 35 ml; Aromatic Ubtan.
  - **Studio range:** Bath Salt Rose Valley; Lavender jar candle; Mahogany jar candle; Rose candle tin; Unwind tin; Glycerine soap; Wax sachets.
- **Lifestyle** (mood photos on product pages and banners): the generated world, ingredient and making photos (`public/images/v4`), plus 1 or 2 lifestyle shots per gift set.

### 8.2 Films (the home page has 3, like Skandinavisk)
1. **Hero film "Diwali Dawn"** (8:3 desktop, 4:5 phone, about 40 s loop): match strike, tulsi at dawn, lota water, oil ritual, ubtan, soap, diyas, gold SB-pattern transition, ribbon on the box, Luxe kit packshot, end card.
2. **Ritual film** (Skandinavisk's "woman with perfume" slot): the Abhyanga oil ritual, close and slow.
3. **"Gift sets" banner film** (their "Bundles and duos" slot): hands tying the ribbon, the boxes, the open kit.

**Method:** no video generator is connected. Each film is built from generated stills with slow camera moves, code-made motion (flame flicker, steam, light sweep, petals), dissolves, and the logo animated from our vector. Shots that need real motion (pouring, hands) are also written as Veo/Flow prompts in `docs/gen/VIDEO-PROMPTS.md`; if those clips are made, they drop into the same edit.

### 8.3 Pages, in build order
1. Shop listing (`/collections`): a packshot grid exactly like theirs (4 across, edge to edge, name and price centred, badge, "Add to bag" on hover).
2. Product page: packshot slider on white, tagline, bullets, price and badge, black Add to bag, three ticks, folding sections, ritual panel (photo + notes + lifestyle), "You may also like", add-to-bag bar that follows the page.
3. Home: swap the tiles to packshots, add films 2 and 3.
4. Ritual world pages, Our Story, Corporate.
