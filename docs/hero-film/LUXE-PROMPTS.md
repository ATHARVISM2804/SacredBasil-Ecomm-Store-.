# Hero film v2: The Luxe Bath & Body Care Kit

Workflow: **ChatGPT (images) → Google Flow (video) → me (stitch, frames, website)**.
Result: a 10-second scroll film in 16:9 (desktop) and 9:16 (mobile).

---

## 1. The product (must stay exact in every frame)

From brochure pages 1–2:

- **Box:** deep chocolate-maroon magnetic box, matte, gold-foil SB monogram, "SACRED BASIL", "LUXE BATH & BODY CARE KIT", "Crafted for your Diwali Dawn", gold-foil leaf branches in two corners.
- **Inside the lid:** gold text: "Experience the essence of Diwali with our handcrafted rituals made to nourish the body, calm the mind and uplift the spirit. Happy Diwali!"
- **Insert:** cream, with 5 cut-outs in two rows. Top: Body Scrub, Face Scrub, Body Oil. Bottom: Scented Candle, Artisanal Soap.
- **Exactly 5 products, all with chocolate-brown labels, white SB logo and serif names:**
  1. **Body Scrub:** clear glass jar, gold screw lid, beige scrub (40 g)
  2. **Face Scrub:** clear glass jar, gold screw lid, pink-brown scrub (25 g)
  3. **Body Oil:** amber glass bottle, black cap (30 ml)
  4. **Artisanal Soap:** square cream bar with pink rose-petal inclusions, label on the front (75 g)
  5. **Scented Candle:** short clear glass jar, gold lid resting beside it, cream soy wax, lit flame

**Attach these reference images to every ChatGPT prompt:**
`docs/inputs/pdf-pages/page-01.png` (products and box), `page-02.png` (open box) and `page-03.png` (closed box).

---

## 2. Style rules (paste at the end of every image and video prompt)

The look: **quiet luxury still life.** A clean, seamless backdrop, one material surface, sculpted light, a lot of empty space. Think Aesop or Diptyque campaigns, warmed with Indian festive gold.

```
Style: premium minimalist still-life photography. Seamless warm ivory-to-sand backdrop (#EFE6DA to #D9C8B0) with a soft gradient, no visible horizon line or clutter. Products stand on a single honed travertine plinth with soft rounded edges. One warm key light from the upper left like late golden-hour sun, with a long soft shadow and a gentle rim light on the glass and gold. Very restrained props: at most one small sprig of dried gypsophila and a single marigold head or a few petals, never more. Large areas of calm negative space. Shot on a medium-format camera, 85 mm lens, f/4, shallow depth of field, creamy highlights, rich chocolate shadows, subtle film grain. Colour palette: ivory, sand, chocolate brown, brushed gold.
Rules: the box, labels, logo and products must match the reference images exactly. Exactly five products: Body Scrub, Face Scrub, Body Oil, Artisanal Soap, Scented Candle. Do not add, remove, duplicate or reshape anything. No extra text, no misspelt labels, no people, no hands, no busy patterns, no fabric piles, no bowls or lanterns, no glossy CGI look, no oversaturated orange.
```

## 3. Make the frames in ChatGPT (16:9, 1920 × 1080)

Make them **in order, in one chat**, attaching the previous frame each time so the scene stays the same.

**F1 · Mood (empty set)**
```
16:9 wide shot of an empty, minimal studio set: a seamless warm ivory-to-sand backdrop and a single honed travertine plinth slightly right of centre. Long golden light falls across the plinth from the upper left, casting a soft diagonal shadow. One small sprig of dried gypsophila at the far right edge. Nothing else. Calm, airy, premium.
```

**F2 · The box arrives**
```
Same set and light as the previous image. The closed Sacred Basil Luxe Bath & Body Care Kit box (exactly as in the reference) now rests on the travertine plinth at a slight angle, its gold foil catching the light, a long soft shadow behind it. Everything else unchanged.
```

**F3 · Gold-foil close-up**
```
Close-up of the lid of the same closed box: the gold-foil SB monogram, "SACRED BASIL", "LUXE BATH & BODY CARE KIT" and "Crafted for your Diwali Dawn" in sharp focus, gold leaf branch on the right corner. A thin raking beam of warm light skims across the matte surface so the foil glints. Background falls off to soft sand.
```

**F4 · The box opens**
```
The same box, now open on the travertine plinth, three-quarter view from above: the inside lid shows its gold Diwali message, and the cream insert holds exactly five products in their cut-outs. Top row: Body Scrub, Face Scrub, Body Oil. Bottom row: Scented Candle, Artisanal Soap. Exactly as in the open-box reference. Clean sand backdrop, nothing else in frame.
```

**F5 · Scrubs**
```
Close-up of the Body Scrub and Face Scrub jars standing on the travertine plinth, gold lids glowing with rim light, chocolate labels sharp, the clean sand backdrop softly out of focus.
```

**F6 · Oil and soap**
```
Close-up of the Body Oil amber bottle with black cap beside the Artisanal Soap bar with pink rose-petal inclusions on the travertine plinth; warm light glows through the amber glass and casts an amber shadow on the stone. Clean backdrop.
```

**F7 · Candle**
```
Close-up of the lit Sacred Basil Scented Candle in its clear jar on the travertine plinth, gold lid resting against it, flame glowing, two or three marigold petals on the stone. Slightly darker, intimate light; clean sand backdrop.
```

**F8 · Final hero frame**
```
Final still life on the right half of the frame: the closed Luxe box standing upright on the travertine plinth, with all five products arranged in a staggered group before it (Body Scrub and Face Scrub jars, Body Oil, Artisanal Soap, the lit candle), one marigold head on the stone and a single gypsophila sprig. The left 45% of the frame is clean, empty warm ivory backdrop for a headline. Golden light from the left, long soft shadows.
```

Check each frame: five products only, labels spelt correctly, and the box design the same in every frame.

---

## 4. Animate in Google Flow (Frames to Video, Veo, 16:9, 8 s each)

Start = first frame, End = second frame. I retime each clip into its slot.

**Clip 1 · F1 → F2 (0–1.4 s)**
```
Slow, steady dolly forward toward the travertine plinth as the closed Luxe box comes into view; the golden light gently warms and the shadow lengthens; a single gypsophila sprig sways almost imperceptibly.
```

**Clip 2 · F2 → F3 (1.4–2.8 s)**
```
Smooth push-in toward the box lid until the gold-foil logo and lettering fill the frame; a soft streak of light glides across the foil.
```

**Clip 3 · F3 → F4 (2.8–4.2 s)**
```
Camera pulls back and rises as the magnetic lid swings open slowly and settles, revealing the gold Diwali message inside the lid and the five products in the cream insert.
```

**Clip 4 · F4 → F5 (4.2–5.6 s)**
```
Slow descent and push toward the Body Scrub and Face Scrub jars; the gold lids catch the light; depth of field narrows.
```

**Clip 5 · F5 → F6 (5.6–7.0 s)**
```
Gentle slide right to the Body Oil bottle and the petal-flecked Artisanal Soap; light glows through the amber glass.
```

**Clip 6 · F6 → F7 (7.0–8.4 s)**
```
Smooth slide to the lit Scented Candle; the flame breathes and flickers; warm glow blooms on the label.
```

**Clip 7 · F7 → F8 (8.4–10.0 s)**
```
Graceful pull-back to the full composition of five products before the stacked box; light settles; hold still for the last second.
```

Then add the style rules from section 2.

---

## 5. Mobile (9:16)

In ChatGPT, for each frame: `Recompose this exact image as vertical 9:16 (1080 × 1920). Extend the scene above and below naturally. Keep every product, label and the box identical. Place the subject in the lower 60%.` For F8 add `Keep the top 35% soft and empty for a headline.`
Then run the same 7 clips in Flow with 9:16 selected, adding: `Vertical framing; keep the subject in the lower part of the frame throughout.`

---

## 6. Hand back

Save the frames to `docs/hero-film/luxe/frames/F1.png … F8.png` and the clips to `docs/hero-film/luxe/desktop/clip-1.mp4 … clip-7.mp4` (and `mobile/`). I'll check the frames for accuracy, then stitch, colour-match, export the poster, MP4 and scroll frames, and wire them into the hero. After that we can score it with Palmier Pro.
