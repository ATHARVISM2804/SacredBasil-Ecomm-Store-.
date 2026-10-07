# Sacred Basil --- Design System

## 1. Art Direction

Sacred Basil should visually communicate:

**quiet luxury, warmth, ritual, craftsmanship and thoughtful gifting.**

The design should feel tactile and editorial.

Think:

`Indian heritage architecture` + `modern luxury editorial` +
`premium wellness` + `thoughtful gifting`

------------------------------------------------------------------------

# 2. Colour Palette

Use a restrained palette.

### Primary

Warm Ivory\
`#F4EEE5`

Cream\
`#E9DDCC`

Deep Cocoa\
`#3A241A`

Espresso\
`#241610`

Muted Gold\
`#B08A4A`

Warm Sand\
`#CDB99C`

### Supporting

Soft Sage\
`#7D8468`

Muted Terracotta\
`#A45F42`

Deep Rose\
`#713D38`

These colors should be used sparingly.

The dominant interface should remain ivory / cream / cocoa.

Gold should behave like an accent, not a primary UI color.

------------------------------------------------------------------------

# 3. Typography

Use an elegant high-contrast serif for display typography.

Possible direction:

-   Cormorant Garamond
-   Canela-like serif
-   Playfair Display only if a more accessible option is required

For body:

-   Inter
-   Manrope
-   DM Sans
-   or another restrained modern grotesk

Typography hierarchy:

### Display

Large, elegant serif.

Example:

`Wellness, thoughtfully gifted.`

### Section Heading

Medium/large serif.

### Body

Clean sans-serif with generous line-height.

### Labels

Uppercase sans-serif with tracking.

Example:

`CORPORATE GIFTING`

Use letter spacing around `0.12em–0.18em` for eyebrow labels.

------------------------------------------------------------------------

# 4. Type Scale

Desktop:

Hero: `clamp(4rem, 8vw, 8rem)`

Section heading: `clamp(2.8rem, 5vw, 5.5rem)`

Subheading: `clamp(1.5rem, 2.4vw, 2.5rem)`

Body: `1rem–1.15rem`

Small: `0.75rem–0.85rem`

Mobile should reduce scale while maintaining dramatic hierarchy.

------------------------------------------------------------------------

# 5. Spacing

Use generous whitespace.

Suggested rhythm:

`8 / 16 / 24 / 40 / 64 / 96 / 128 / 180`

Large editorial sections should have:

`padding-block: clamp(5rem, 10vw, 11rem)`

Do not compress sections just to fit more information.

------------------------------------------------------------------------

# 6. Layout

Maximum content width:

`1400px`

Use:

-   asymmetric grids
-   large image blocks
-   editorial overlaps
-   controlled whitespace
-   full-bleed photography
-   occasional narrow text columns

Avoid repetitive:

`3 cards + 3 cards + 3 cards`

layouts.

------------------------------------------------------------------------

# 7. Buttons

Primary:

Deep cocoa background\
Ivory text

Shape:

subtle rounded rectangle, not pill-shaped.

Example:

`EXPLORE GIFTING  →`

Secondary:

transparent / text-only

Example:

`CORPORATE GIFTING  →`

Hover:

-   2--4px movement
-   subtle background transition
-   arrow movement

No oversized button shadows.

------------------------------------------------------------------------

# 8. Navigation

Desktop navigation should be almost invisible over the hero.

Logo left.

Navigation centered/right.

CTA right.

Use:

-   transparent background initially
-   subtle cream/cocoa background after scrolling
-   backdrop blur only when needed

Sticky navigation should remain thin.

------------------------------------------------------------------------

# 9. Image Treatment

Every image should feel like it belongs to the same campaign.

Preferred characteristics:

-   warm highlights
-   soft shadows
-   low-to-medium contrast
-   tactile texture
-   natural skin tones
-   botanical elements
-   shallow depth
-   editorial composition

Do not aggressively color-grade the images into orange.

Keep whites creamy.

Keep packaging accurate.

------------------------------------------------------------------------

# 10. Product Photography Rules

This is critical.

The generated product photographs should preserve:

-   exact product count
-   exact packaging type
-   exact box configuration
-   exact visible product categories
-   Sacred Basil branding
-   label hierarchy

If a supplied reference contains:

`1 Ubtan + 1 Soap + 1 Body Oil`

the website image must not show:

`2 Ubtans + 2 Soaps + Candle`.

Do not invent products.

Do not change the packaging style.

Do not add random products.

------------------------------------------------------------------------

# 11. Image Composition

For website sections, favor compositions with intentional negative
space.

Examples:

Hero:

subject slightly off-center so text can sit opposite it.

Product section:

product centered/right with negative space on left.

Story:

portrait/image one side, typography opposite.

Corporate:

gift box large enough to communicate quality.

------------------------------------------------------------------------

# 12. Motion System

Motion should feel like physical paper, fabric and photography moving
slowly.

Use:

-   opacity
-   translateY
-   scale
-   clip-path
-   subtle parallax
-   pinned scroll sections

Default easing:

`power3.out`

Long cinematic transitions:

`1.0s–1.8s`

Micro interactions:

`0.3s–0.6s`

Avoid excessive spring physics.

------------------------------------------------------------------------

# 13. Cursor

Optional desktop-only custom cursor.

Keep it extremely subtle.

Possible behavior:

Normal: small dot.

Image: `VIEW`

CTA: `OPEN`

Do not use a giant flashy cursor.

Disable on mobile.

------------------------------------------------------------------------

# 14. Borders / Shadows

Prefer:

1px rgba cocoa/black borders

Very soft shadows.

Avoid:

-   strong drop shadows
-   glassmorphism
-   neon glow
-   excessive gradients

------------------------------------------------------------------------

# 15. Accessibility

Maintain accessible contrast.

Respect:

`prefers-reduced-motion`

All interactive elements need:

-   keyboard focus
-   aria labels
-   visible focus state

Do not sacrifice usability for aesthetics.

------------------------------------------------------------------------

# 16. Overall Visual Rule

If an element does not make the brand feel more premium, more
understandable, or easier to navigate:

**remove it.**
