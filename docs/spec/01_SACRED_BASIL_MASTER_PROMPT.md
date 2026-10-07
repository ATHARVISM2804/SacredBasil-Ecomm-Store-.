# Sacred Basil --- Complete Website Build Prompt

## Role

You are an elite product designer, art director, and senior frontend
engineer building the official website for **Sacred Basil**, a premium
handcrafted wellness and gifting brand.

Build the website as a **premium digital brand experience**, not as a
generic Shopify-style store.

The visual direction should feel:

-   Aesthetic
-   Premium
-   Elegant
-   Warm
-   Calm
-   Luxurious
-   Indian / Ayurvedic in spirit without looking stereotypically
    "Ayurvedic"
-   Editorial and tactile
-   High-end gifting focused

The website must make the products feel desirable before the visitor
reads the copy.

------------------------------------------------------------------------

# 1. Core Creative Direction

The brand world is built around:

**Handcrafted wellness × Indian ritual × premium gifting × thoughtful
presentation**

Use visual references from the supplied Sacred Basil product photographs
and packaging references.

The photography language should consistently use:

-   warm golden-hour light
-   cream / ivory textiles
-   deep brown packaging
-   muted gold/brass accents
-   natural stone
-   carved Indian architectural textures
-   botanical greenery
-   jasmine / marigold / rose petals
-   candles and soft flames
-   shallow depth of field
-   cinematic shadows
-   subtle film-like warmth
-   tactile materials
-   generous negative space

Do NOT make the website colorful, loud, glossy, overly modern, clinical,
or "spa template" looking.

Do NOT use generic stock photos.

The supplied Sacred Basil product images should be treated as the
primary visual language.

------------------------------------------------------------------------

# 2. Brand Mark / Logo Rules

The brand is:

**SACRED BASIL**

Use the supplied Sacred Basil logo/wordmark wherever possible.

Important:

-   Never invent a new logo.
-   Never distort the logo.
-   Never place a decorative duplicate logo in random corners of
    photographs.
-   Product packaging should retain the actual Sacred Basil branding.
-   Website logo should remain clean and restrained.
-   Use the logo with sufficient breathing room.

------------------------------------------------------------------------

# 3. Website Experience

The first screen should feel like entering a luxury editorial campaign.

The homepage should have a cinematic hero with either:

1.  a carefully selected Sacred Basil hero photograph, or
2.  a short looping hero video made from the generated image sequence.

Recommended hero structure:

**Small eyebrow** `SACRED BASIL`

**Large headline** `Wellness, thoughtfully gifted.`

**Supporting line**
`Handcrafted rituals, beautifully curated for meaningful moments.`

Primary CTA: `Explore Gifting`

Secondary CTA: `Corporate Gifting`

Keep the text minimal.

The hero image/video must remain the dominant element.

------------------------------------------------------------------------

# 4. Homepage Structure

## Section 01 --- Hero

Full viewport.

Use cinematic image/video with slow movement.

Visual treatment:

-   full bleed
-   subtle dark/cream gradient only where required for readability
-   extremely restrained text
-   no huge UI chrome
-   elegant navigation over the image

Navigation:

`Sacred Basil`

Links:

`Collections` `Our Story` `Corporate Gifting` `About`

Right side:

`Enquire`

Mobile navigation should become a clean fullscreen/overlay menu.

------------------------------------------------------------------------

## Section 02 --- Brand Introduction

Transition from dark/warm hero into an ivory editorial section.

Headline:

`A ritual worth gifting.`

Short copy explaining that Sacred Basil brings together handcrafted
wellness products and considered presentation for personal and corporate
gifting.

Use one large product image with generous whitespace.

Do not overfill the section with text.

------------------------------------------------------------------------

## Section 03 --- Gifting Collections

Large editorial product cards.

Show the actual collections/products from the supplied brand material.

Possible collection names visible in the provided material include:

-   Luxe Bath & Body Care Kit
-   Serenity Box
-   Tranquil Box
-   Festive / Diwali gifting sets
-   Custom / Corporate gifting

Each card should feel like a magazine spread rather than a standard
ecommerce card.

Interaction:

-   image slightly scales on hover
-   subtle cursor interaction
-   product title
-   short descriptor
-   `View Collection`

Avoid excessive badges, discount labels, ratings, or noisy UI.

------------------------------------------------------------------------

## Section 04 --- Product Ritual

Create a horizontal / pinned storytelling section.

As the visitor scrolls, move through the product ritual:

`Cleanse → Exfoliate → Nourish → Unwind`

Use Sacred Basil product imagery.

This section can use GSAP ScrollTrigger.

The animation should be slow and premium.

No aggressive parallax.

------------------------------------------------------------------------

## Section 05 --- The Sacred Basil Philosophy

Large typography.

Headline:

`Rooted in ritual. Made for modern moments.`

Use four minimal principles:

`Handcrafted` `Thoughtful` `Wellness` `Beautifully Gifted`

Each principle should appear through subtle scroll-based reveals.

Avoid generic corporate icon grids.

------------------------------------------------------------------------

## Section 06 --- Visual Story / Editorial Gallery

Use a masonry / asymmetric gallery of the supplied product images.

Images should have different aspect ratios and generous spacing.

Interaction:

-   slow image scale
-   subtle image reveal
-   optional fullscreen lightbox

This section should feel like a luxury campaign / editorial lookbook.

------------------------------------------------------------------------

## Section 07 --- Corporate Gifting

This is a major business section, not a footer CTA.

Headline:

`Thoughtful gifting, made for teams.`

Supporting copy:

`Curated wellness experiences for employees, clients, celebrations and meaningful occasions.`

CTA:

`Create a Corporate Gift`

Include:

-   curated gifting
-   personalised presentation
-   branded gifting possibilities where applicable
-   bulk enquiries
-   custom requirements

Use a large premium gift-box image.

Add a simple enquiry form.

Fields:

-   Name
-   Company
-   Email
-   Phone
-   Number of gifts
-   Occasion
-   Preferred collection
-   Message

Do not invent unsupported minimum quantities, prices, delivery promises
or turnaround times. Put those in a CMS/config object if the client
later confirms them.

------------------------------------------------------------------------

## Section 08 --- Story / Founders

Create an editorial founder/story section.

Headline:

`Made with intention.`

Use the actual founder/story material supplied by the client.

Layout:

large portrait/image + text

The story should feel personal and human rather than corporate.

------------------------------------------------------------------------

## Section 09 --- Gifting Moments

Create visual moments such as:

`Festivals` `Celebrations` `Thank You` `Client Gifting`
`Employee Gifting` `Personal Rituals`

Use imagery rather than icons.

------------------------------------------------------------------------

## Section 10 --- Final CTA

Large quiet section.

Headline:

`Give something that feels personal.`

CTA:

`Start a Conversation`

Secondary:

`Explore Collections`

Use a warm, almost empty background with a beautiful product still life.

------------------------------------------------------------------------

## Footer

Keep it elegant and minimal.

Include:

-   Sacred Basil logo
-   short brand statement
-   Collections
-   Our Story
-   Corporate Gifting
-   Contact
-   Instagram / social links if supplied
-   Privacy
-   Terms

Avoid a huge multi-column ecommerce footer.

------------------------------------------------------------------------

# 5. Product Detail Experience

Product pages should feel like luxury editorial product pages.

Layout:

Left: large product photography

Right: product name short description contents price only where
confirmed CTA

Use expandable sections:

`What's Inside` `The Ritual` `Packaging` `Corporate / Bulk Enquiry`

For gift boxes, clearly show the exact contents.

Never change the number of products inside a referenced gift set.

The visual representation must match the supplied reference packaging.

------------------------------------------------------------------------

# 6. Animation Direction

Use animation as atmosphere, not decoration.

Recommended:

-   Lenis smooth scrolling
-   GSAP ScrollTrigger
-   subtle image reveals
-   text mask reveals
-   slow scale from 1.02 → 1
-   pinned product storytelling
-   horizontal gallery movement
-   soft opacity transitions
-   elegant hover states

Avoid:

-   bouncing
-   excessive blur
-   neon gradients
-   huge rotating 3D elements
-   fast card animations
-   unnecessary loading animations

Animation timing should generally feel slow and deliberate.

------------------------------------------------------------------------

# 7. Technical Stack

Use:

-   Next.js
-   TypeScript
-   Tailwind CSS
-   GSAP + ScrollTrigger
-   Lenis for smooth scrolling
-   Lucide icons only where necessary
-   semantic HTML
-   responsive image optimization
-   next/image
-   reusable components
-   clean data-driven product collections

Suggested structure:

`app/` `components/` `components/sections/` `components/ui/` `data/`
`public/images/` `lib/`

Build reusable components rather than one enormous page component.

------------------------------------------------------------------------

# 8. Responsive Design

Desktop:

Editorial, spacious, cinematic.

Tablet:

Preserve hierarchy and photography.

Mobile:

Do NOT simply stack the desktop design.

Recompose each section intentionally.

The mobile version should still feel premium.

Hero should retain strong image composition.

Product grids should become horizontal scroll / carefully stacked cards.

Corporate form should be extremely easy to use.

------------------------------------------------------------------------

# 9. Performance

The site should be visually rich without becoming slow.

Implement:

-   responsive image sizes
-   WebP/AVIF where appropriate
-   lazy loading below the fold
-   priority loading only for hero media
-   poster image for hero video
-   avoid loading every large image immediately
-   reduced-motion support
-   avoid huge JS bundles
-   optimize fonts

------------------------------------------------------------------------

# 10. SEO

Implement:

-   metadata
-   Open Graph image
-   semantic headings
-   descriptive image alt text
-   sitemap
-   robots
-   canonical URLs
-   structured data where appropriate

Brand name must always be spelled:

**Sacred Basil**

Never:

Sacred Basils SacredBasil Sacred Basil Wellness unless supplied by the
client.

------------------------------------------------------------------------

# 11. Quality Bar

The final website should look like it could belong to a premium Indian
luxury wellness/gifting brand.

Reference feeling:

**quiet luxury + Indian craftsmanship + modern editorial design**

It should NOT feel like:

-   a generic skincare template
-   a generic Ayurveda website
-   a SaaS landing page
-   a basic ecommerce theme
-   a Canva website
-   an over-animated award-site clone

Prioritize:

**photography → typography → whitespace → composition → subtle motion →
conversion**

in that order.

Build the site as a polished production-ready experience, not a
prototype.
