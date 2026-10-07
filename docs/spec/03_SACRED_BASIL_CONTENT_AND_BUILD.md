# Sacred Basil --- Content, Assets & Implementation Specification

## 1. Build Objective

Create a complete production-ready Sacred Basil website using the
supplied brand/product material and generated photography.

The website should communicate two primary things:

1.  Sacred Basil offers beautifully presented handcrafted wellness
    gifting.
2.  Sacred Basil can support personal and corporate gifting enquiries.

The website must remain premium and visually led.

------------------------------------------------------------------------

# 2. Content Architecture

## Main Navigation

-   Home
-   Collections
-   Our Story
-   Corporate Gifting
-   Contact

Optional: - About

Primary CTA: `Enquire`

------------------------------------------------------------------------

# 3. Homepage Content

## Hero

Eyebrow:

`SACRED BASIL`

Headline:

`Wellness, thoughtfully gifted.`

Supporting copy:

`Handcrafted rituals, beautifully curated for meaningful moments.`

Buttons:

`Explore Gifting` `Corporate Gifting`

Keep this copy short.

------------------------------------------------------------------------

## Brand Introduction

Heading:

`A ritual worth gifting.`

Copy direction:

Sacred Basil brings together handcrafted wellness essentials and
considered gifting experiences, created for moments that deserve thought
and care.

Do not make unsupported medical or therapeutic claims.

------------------------------------------------------------------------

## Collections

Heading:

`Curated rituals.`

Supporting line:

`Wellness experiences, thoughtfully brought together.`

Collection categories should be populated from the confirmed
brand/product material.

Use the exact names supplied by the client.

------------------------------------------------------------------------

# 4. Known Product / Gift Set References

The supplied reference material includes examples such as:

### Luxe Bath & Body Care Kit

The visual reference shows a larger collection of wellness products.

When recreating its visual representation, preserve the exact number of
products shown in the reference.

### Smaller Gift Box

The supplied cream floral Sacred Basil reference shows:

-   Aromatic Ubtan / Aromatic Powder
-   Artisanal Soap
-   Aromatic Body Oil

Do not add a fourth product.

### Larger Cream Gift Box

The supplied reference shows:

-   Aromatic Ubtan
-   Artisanal Soap
-   Aromatic Body Oil
-   Scented Candle

Do not change this quantity.

### Festive / Diwali Gift Set

The supplied colorful reference shows:

-   one upright festive outer box
-   stacked matching boxes in the background
-   one organza pouch
-   Aromatic Ubtan
-   Artisanal Soap
-   Aromatic Body Oil

Do not add a candle to this particular three-product pouch.

------------------------------------------------------------------------

# 5. Product Data Structure

Use a data-driven structure.

Example:

``` ts
type ProductCollection = {
  slug: string
  name: string
  shortDescription: string
  description?: string
  image: string
  contents: {
    name: string
    quantity: number
  }[]
  price?: string
  enquiryOnly?: boolean
}
```

Do not hard-code product cards throughout JSX.

------------------------------------------------------------------------

# 6. Corporate Gifting

Create a dedicated page:

`/corporate-gifting`

Hero:

`Thoughtful gifting, made for teams.`

Supporting copy:

`Curated wellness experiences for employees, clients and meaningful occasions.`

Sections:

### Why Corporate Gifting

Explain the gifting experience in a concise editorial format.

### Curated Sets

Display relevant gift sets.

### Personalisation

Only describe custom branding, packaging, tags, cards or other options
if confirmed by the client.

### Enquiry

Form fields:

-   Name
-   Company
-   Email
-   Phone
-   Quantity
-   Occasion
-   Budget / preferred collection
-   Delivery location
-   Message

Submit button:

`SEND ENQUIRY`

After submission, show a refined success state.

Do not claim an enquiry has been received unless the backend actually
processes it.

------------------------------------------------------------------------

# 7. Our Story

Page:

`/our-story`

Structure:

Hero image

Headline:

`Made with intention.`

Then:

-   Sacred Basil story
-   philosophy
-   founders
-   handcrafted approach
-   gifting philosophy

Use the client's supplied wording wherever available.

Do not invent founder biographies, qualifications, manufacturing claims
or certifications.

------------------------------------------------------------------------

# 8. Gallery

Create:

`/collections`

and optionally:

`/gallery`

Use a cinematic editorial gallery.

Recommended layout:

-   full-width hero image
-   2-column asymmetric row
-   portrait image
-   wide image
-   close-up product image
-   gift-set image

Add subtle hover zoom.

Clicking an image can open a fullscreen lightbox.

------------------------------------------------------------------------

# 9. Generated Asset Direction

The generated imagery should live under:

`/public/images/sacred-basil/`

Suggested naming:

``` text
hero-sacred-basil.jpg
ritual-body-scrub.jpg
ritual-soap.jpg
ritual-body-oil.jpg
ritual-candle.jpg
luxury-gift-box.jpg
corporate-gifting.jpg
diwali-gift-set-01.jpg
diwali-gift-set-02.jpg
diwali-gift-set-03.jpg
editorial-product-01.jpg
editorial-product-02.jpg
```

If the actual generated files use different names, create a central
asset map instead of renaming everything.

Example:

``` ts
export const sacredBasilAssets = {
  hero: '/images/sacred-basil/hero-sacred-basil.jpg',
  bodyScrub: '/images/sacred-basil/ritual-body-scrub.jpg',
  bodyOil: '/images/sacred-basil/ritual-body-oil.jpg',
  soap: '/images/sacred-basil/ritual-soap.jpg',
  candle: '/images/sacred-basil/ritual-candle.jpg',
}
```

------------------------------------------------------------------------

# 10. Hero Video / Scroll Sequence

The user plans to create a hero video / scrolling image sequence.

Build the hero component so it supports both:

### Option A

MP4/WebM video.

### Option B

Frame sequence.

Recommended API:

``` tsx
<HeroMedia
  video="/media/sacred-basil-hero.mp4"
  frames={heroFrames}
/>
```

For frame sequence:

-   preload only the first few frames
-   use canvas for smooth playback
-   map scroll progress to frame index
-   clamp progress
-   support mobile frame set
-   fallback to poster image
-   respect reduced motion

The website should work even if the video is not yet available.

------------------------------------------------------------------------

# 11. Recommended Folder Structure

``` text
app/
  page.tsx
  collections/
    page.tsx
    [slug]/
      page.tsx
  our-story/
    page.tsx
  corporate-gifting/
    page.tsx
  contact/
    page.tsx

components/
  navigation/
  hero/
  sections/
  collections/
  gallery/
  forms/
  footer/
  ui/

data/
  products.ts
  collections.ts
  site.ts

lib/
  animations.ts
  utils.ts

public/
  images/
    sacred-basil/
  video/
    sacred-basil/
```

------------------------------------------------------------------------

# 12. Recommended Components

Create reusable components:

`SiteHeader` `MobileMenu` `Hero` `HeroMedia` `SectionHeading`
`EditorialImage` `CollectionCard` `CollectionGrid` `ProductShowcase`
`ScrollStory` `GalleryMasonry` `CorporateGiftingSection` `EnquiryForm`
`StorySection` `Footer`

------------------------------------------------------------------------

# 13. GSAP Sections

Use GSAP only where it creates a meaningful storytelling effect.

Recommended:

### Hero

Subtle entrance animation.

### Collection cards

Reveal on scroll.

### Ritual section

Pinned horizontal movement.

### Gallery

Staggered image reveal.

### Corporate section

Gift-box image slow parallax.

Do not animate every text node independently.

------------------------------------------------------------------------

# 14. Form Handling

The first version can use a clean client-side form with an abstraction:

``` ts
async function submitEnquiry(data: EnquiryData) {
  // connect to API / email service later
}
```

Keep the form architecture ready for:

-   Resend
-   Formspree
-   custom API
-   CRM webhook

Do not hard-code a fake email endpoint.

------------------------------------------------------------------------

# 15. SEO Copy Direction

Title:

`Sacred Basil — Thoughtfully Gifted Wellness`

Description:

`Discover thoughtfully curated handcrafted wellness gifts from Sacred Basil, created for personal moments, celebrations and corporate gifting.`

Use page-specific metadata for collections and corporate gifting.

Avoid keyword stuffing.

------------------------------------------------------------------------

# 16. UX Requirements

The visitor should understand within approximately 5 seconds:

-   what Sacred Basil is
-   that it is premium
-   that gifting is central
-   where to explore products
-   where to enquire for corporate gifting

Do not force visitors through animations before allowing navigation.

Every major section should have a clear visual purpose.

------------------------------------------------------------------------

# 17. Mobile Requirements

Mobile is not a reduced desktop version.

On mobile:

-   hero remains cinematic
-   typography stays dramatic
-   cards become horizontal scroll where appropriate
-   images remain large
-   enquiry form becomes single column
-   navigation becomes a clean overlay
-   animation is reduced where necessary

Test at:

`390px` `430px` `768px` `1024px` `1440px`

------------------------------------------------------------------------

# 18. Final QA Checklist

Before declaring the site complete:

### Visual

-   [ ] Sacred Basil branding is correct
-   [ ] Product quantities match references
-   [ ] No invented products
-   [ ] No random logos added to photography
-   [ ] Typography feels premium
-   [ ] Images have consistent warmth
-   [ ] No generic ecommerce appearance
-   [ ] Mobile composition is intentional

### UX

-   [ ] Navigation works
-   [ ] All buttons work
-   [ ] Collection pages work
-   [ ] Product details work
-   [ ] Corporate enquiry works
-   [ ] Contact works
-   [ ] Mobile menu works
-   [ ] Reduced motion works

### Technical

-   [ ] No console errors
-   [ ] Images optimized
-   [ ] Good loading performance
-   [ ] Semantic HTML
-   [ ] Accessible buttons/forms
-   [ ] SEO metadata
-   [ ] Open Graph metadata
-   [ ] Responsive at all target widths

### Content

-   [ ] No unsupported claims
-   [ ] No invented prices
-   [ ] No invented certifications
-   [ ] No invented founders/details
-   [ ] Exact product quantities preserved
-   [ ] Sacred Basil spelling consistent

------------------------------------------------------------------------

# 19. Final Instruction to Claude Code

Do not rush into writing components immediately.

First:

1.  Inspect the supplied assets.
2.  Inspect all Sacred Basil reference images.
3.  Create the visual system.
4.  Create the content/data model.
5.  Build the homepage.
6.  Build collection/product pages.
7.  Build corporate gifting.
8.  Build story/contact pages.
9.  Add animation.
10. Optimize responsive behavior.
11. Run a visual and technical QA pass.
12. Refine spacing, typography and image composition until the site
    feels genuinely premium.

The final result should feel like a **luxury editorial brand website
that happens to sell wellness gifts**, not a product catalogue with a
luxury skin.
