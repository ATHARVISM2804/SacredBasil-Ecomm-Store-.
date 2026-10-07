# Sacred Basil hero film: Google Flow prompts

Product: **The Tranquil Box**. Reference: brochure page 5 (`docs/inputs/pdf-pages/page-06.png`).
Exact contents: 1 Artisanal Soap (75 g approx), 1 Aromatic Ubtan (50 g), 1 Aromatic Body Oil (35 ml), 1 Scented Candle. Cream floral magnet-closure box with a square SB label.
Target: a 10-second film played by scroll, in two versions: 16:9 desktop and 9:16 mobile.

---

## Step 0: The frames

Received in `public/16:9 Images/`: 12 files, **11 unique** ("Sacred Basil Golden-Hour Ritual" and "… (1)" are identical). In story order in `docs/hero-film/frames/`:

| # | File | Source file | Shot |
|---|---|---|---|
| 01 | 01-mood.png | Golden Temple Courtyard Fountain | Linen, jasmine, fountain, carved arches |
| 02 | 02-fountain.png | Golden Temple Fountain Ritual | Water falling into the stone basin |
| 03 | 03-box-appears.png | Sacred Basil in Golden Courtyard | Closed Tranquil Box by the fountain |
| 04 | 04-box-opening.png | Sacred Basil Golden-Hour Spa Gift Box | Hand lifting the lid |
| 05 | 05-full-set.png | Sacred Basil Golden Hour Spa Gift Box | Open box, products inside |
| 06 | 06-soap.png | Sacred Basil Artisanal Soap Ritual | Artisanal Soap |
| 07 | 07-body-oil.png | Sacred Basil Body Oil Ritual | Aromatic Body Oil |
| 08 | 08-ubtan.png | Aromatic Ubtan in Golden Courtyard | Aromatic Ubtan |
| 09 | 09-candle.png | Sacred Basil Candle in a Golden Courtyard | Scented Candle |
| 10 | 10-collection.png | Sacred Basil Golden Hour Spa Collection | All four products before the box |
| 11 | 11-final.png | Sacred Basil Golden-Hour Ritual | Closing frame: box and pouch |

**Fix before animating** (ChatGPT image edit; attach the frame plus brochure page 5):

| Frame | Problem | Fix prompt |
|---|---|---|
| 04, 05 | A rolled jute cloth sits inside the box as a fifth item; the Tranquil Box holds exactly four | `Remove the rolled jute cloth from inside the box and fill that space with the same white crinkle-paper filler. Exactly four products remain: Aromatic Ubtan, Artisanal Soap, Aromatic Body Oil, Scented Candle. Keep everything else pixel-identical.` |
| 05, 06, 10 | Soap label says "70 g approx."; the Tranquil Box soap is 75 g (70 g is the Serenity Box) | `Edit only the soap label weight so it reads "75 g approx." Keep everything else identical.` |
| 09 | Candle is a clear glass tumbler; in frames 05 and 10 it is a short glass jar with a gold lid, so the product would change shape mid-film | `Replace the candle vessel with a short glass jar with a gold metal lid, exactly matching the reference image, same cream SB label "Scented Candle / Soy Wax / Burn Time 15 hrs", lit flame. Keep scene, light and framing identical.` |
| 11 | The SB jute drawstring pouch is not in the brochure range (the festive pouch is white organza) | If it isn't a real product: `Remove the jute pouch and let the closed Sacred Basil Tranquil Box stand alone on the stone plinth, slightly angled, with jasmine and petals at its base. Keep the archway, jaali, brass and lighting identical.` |

## Step 1: Style block, pasted at the end of every prompt

```
Style: luxury Indian wellness commercial, warm golden-hour sunlight, cream and honey tones, soft film grain, shallow depth of field, gentle lens bloom, slow and graceful, 24fps cinematic. Carved sandstone jaali, brass bowls, jasmine and marigold petals.
Rules: keep every product, label, logo and the box design exactly as in the frames. Do not add, remove, duplicate or reshape any product. No new text, no warped letters, no hands except where shown, no people, no camera shake, no cuts, no fast motion.
```

---

## Step 2: Desktop clips (16:9), Flow → Frames to Video

Use Veo, 16:9, 8 s per clip. Start = first frame, End = second frame. I speed each clip into its slot (10 s total) when assembling, so ask for slow, continuous motion.

**Clip 1 · 01 → 02 (0.0–1.0 s): setting the mood**
```
Slow dolly forward over the soft linen and jasmine toward the stone fountain. Water begins to trickle and sparkle in the low sun; a jasmine petal drifts down; brass lamp flames flicker. The light warms as we approach.
```

**Clip 2 · 02 → 03 (1.0–2.0 s): the box appears**
```
Camera glides right past the falling water and the brass bowl of rose petals; focus racks from the water to the cream Sacred Basil gift box resting among jasmine. A soft sun flare sweeps across its lid.
```

**Clip 3 · 03 → 04 (2.0–3.0 s): the hand arrives**
```
Slow push-in toward the closed box as a hand enters gently from the right and begins to lift the magnetic lid. Calm, deliberate, weighted motion. Jaali shadows slide slowly across the lid.
```

**Clip 4 · 04 → 05 (3.0–4.0 s): the box opens**
```
The lid lifts fully open in one smooth motion and the hand withdraws out of frame; the camera eases back and rises a little, revealing the products resting on white crinkle paper as warm light spills inside.
```

**Clip 5 · 05 → 06 (4.0–5.0 s): soap detail**
```
Slow macro push toward the Artisanal Soap until it fills the frame; depth of field narrows; turmeric powder and jasmine glow softly around it.
```

**Clip 6 · 06 → 07 (5.0–6.0 s): body oil detail**
```
Gentle lateral slide right from the soap to the Aromatic Body Oil bottle; sunlight glints through the amber oil; jasmine sways in a light breeze.
```

**Clip 7 · 07 → 08 (6.0–7.0 s): ubtan detail**
```
Slow arc left to the Aromatic Ubtan packet beside a brass bowl of golden powder; a fine haze of powder lifts and catches the light.
```

**Clip 8 · 08 → 09 (7.0–8.0 s): candle detail**
```
Smooth slide right to the lit Scented Candle; the flame breathes and flickers, its warm glow blooming on the label; marigold petals in soft focus.
```

**Clip 9 · 09 → 10 (8.0–9.0 s): the collection**
```
Slow pull-back and slight rise from the candle to reveal all four products standing together before the cream gift box, brass lamps and carved jaali behind. Composed and still.
```

**Clip 10 · 10 → 11 (9.0–10.0 s): final hero frame**
```
Graceful drift left and pull back as the scene settles on the closed gift box in the sunlit carved courtyard; light rays move slowly through the jaali; hold still for the final second.
```

On desktop the headline sits over the left side of the final frame, so keep the left 40% of frame 11 soft and uncluttered.

## Step 3: Mobile version (9:16)

**3a. Re-frame each image to vertical** (ChatGPT image edit, one frame at a time, size 1080 × 1920):
```
Extend this image to a vertical 9:16 composition. Keep the existing scene exactly as it is and continue it naturally above and below: more warm sky, carved sandstone and jasmine above, more stone surface and petals below. Place the main subject in the lower 60% of the frame, centred. Do not change, move or redraw any product, label or logo.
```
For frame 11 add: `Leave the top 35% as soft, uncluttered warm light for a headline.`

**3b. Animate:** use the same 10 clip prompts in Frames to Video with 9:16 selected, and add to each:
```
Vertical 9:16 framing. Keep the subject centred in the lower part of the frame throughout the move.
```

---

## Step 4: Hand back to me

Put the clips here and I'll do the rest: join them, retime to 10 s, match colour, export the MP4 and poster, cut the scroll frames (about 120 desktop and 90 mobile, WebP) and wire them into the hero.
```
docs/hero-film/desktop/clip-01.mp4 … clip-10.mp4
docs/hero-film/mobile/clip-01.mp4 … clip-10.mp4
```
After that we can score it with Palmier Pro.
