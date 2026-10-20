# Logo remake: blank labels in ChatGPT, exact logo added by us

AI image tools can't draw the SB monogram correctly, which is why the old images show the wrong logo. So the split is:

1. **You (ChatGPT):** remove the wrong logo, so the label or box is clean and naturally lit.
2. **Me:** print the official logo (`docs/inputs/sb-monogram-hq.png`) onto that clean surface, matched to the light and angle. Nothing is erased on my side, so there is no blur.

## How to run it

1. Open ChatGPT and start **one new chat per image** (a fresh chat keeps the edits tight).
2. Upload the image from `docs/regen/send/` (for example `01-aromatic-body-oil.png`).
3. Paste the **master prompt** below. If the table lists an extra line for that image, paste it too.
4. Check the result against the **Check** list. If anything else changed, reply: *"Keep everything exactly like the original; only remove the logo."*
5. Download the image and save it in `docs/regen/incoming/` with the **same filename** (for example `01-aromatic-body-oil.png`). Any size or aspect ratio is fine; I align it back to the original frame.
6. Tell me when a batch is in. You don't need to wait for all 32.

## Master prompt

```
Edit this photo. Remove ONLY the brand logo: every "SB" monogram and every small "SACRED BASIL" line printed under it, on every label, box, card and tag in the photo.
Where the logo was, leave a clean, empty surface of the same material (paper, foil board, glass label), with the same colour, texture, grain and lighting, as if that spot was never printed. No smudges, no blur, no lighter or darker patches.
Keep EVERYTHING else exactly as it is: composition, camera angle, framing, products, people, faces, props, colours, lighting, shadows, and all other printed text (product names such as "Body Scrub", "LUXE BATH & BODY CARE KIT", "Crafted for your Diwali Dawn", the lotus and divider lines, leaf branches).
Do not add anything new. Same aspect ratio as the original, highest resolution.
```

## Per-image extras

| # | File | Logos to remove | Extra line to add |
|---|---|---|---|
| 01 | aromatic-body-oil | 6 bottle labels | – |
| 02 | founders-wide | wall mark + gift box on the table | `Do not change the two women in any way: faces, hair, clothes and pose stay identical.` |
| 03 | hero-contact | box lid + card | – |
| 04 | hero-corporate | front box lid | – |
| 05 | hero-shop | box lid + floral box label | – |
| 06 | luxe-spotlight | lid + 5 product labels | `The candle inside the box must be unlit: no flame, no glow, just a short clean wick.` |
| 07 | story-hero-desktop | wall mark + box | Same line as 02 (women unchanged). |
| 08 | story-hero-mobile | wall mark + box | Same line as 02 (women unchanged). |
| 09 | festive-orders-production-table | 13 small labels | `There are many small labels; remove the SB mark from all of them.` |
| 10 | festive-ritual-organza-pouch | 3 labels | `Also remove the small Hindi line under "Aromatic Ubtan" and under "Aromatic Body Oil" (leave the label blank there).` |
| 11 | festive-ritual-set | 3 labels | Same extra line as 10. |
| 12 | founders | candle label | Same line as 02 (women unchanged). |
| 13 | luxe-kit-candle | jar label | – |
| 14 | luxe-kit-closed-premium | box lid | – |
| 15 | luxe-kit-final | lid + 5 labels | – |
| 16 | luxe-kit-foil | lid close-up | – |
| 17 | luxe-kit-open-premium | inner lid + 5 labels | Same candle line as 06. |
| 18 | luxe-kit-scrubs | 2 jar labels | – |
| 19 | scented-candle-lavender-jar | jar label | – |
| 20 | scented-candle-mahogany-jar | jar label | `Also remove the small leaf sprig drawn next to the SB.` |
| 21 | serenity-box-open-3-products | card + 3 labels + lid | – |
| 22 | tranquil-box-open-4-products | card + 4 labels | – |
| 23 | unwind-candle-tin-oudh-tabac-lit | tin lid label | – |
| 24 | unwind-candle-tin-oudh-tabac-styled | tin lid label | – |
| 25 | work-01 | 2 boxes + 6 labels | – |
| 26 | work-02 | box + 6 labels | – |
| 27 | work-03 | box label + 7 bottle and soap labels | – |
| 28 | work-04 | box label | `Do not change the hands.` |
| 29 | work-05 | 7 small labels | – |
| 30 | work-07 | 5 pouch labels | `Keep the small red lotus under each mark.` |
| 31 | work-08 | 15 small labels in the box | `There are many small labels; remove the SB mark from all of them.` |
| 32 | work-12 | kraft box label | – |

## Check before saving

- No trace of the old SB or "SACRED BASIL" anywhere: zoom in on every label.
- The cleared spot matches the surrounding surface, with no patch or blur.
- Product names and other text are unchanged and spelled correctly.
- People, faces, hands and products are unchanged; nothing added or removed.
- For 06 and 17, the candle in the box is unlit.

## What happens next (me)

1. Align each returned image to its original frame and size.
2. Print the official lockup on every label and box, using foil on the gift box and print on the jar labels, matched to the surface angle and light, at the same size as before.
3. Check every label close-up, before and after, and install the result in `public/images/`.
4. Check every page in Chrome on desktop and phone widths.
