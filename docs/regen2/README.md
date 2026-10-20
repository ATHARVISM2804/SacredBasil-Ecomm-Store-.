# White-background listing photos from your real products

This makes the Skandinavisk-style product grid: every product alone on the same soft off-white background. It is made from **your real photos**, so the packaging stays exactly as it is.

## How to run it (ChatGPT or Gemini)
1. Start **one new chat per photo**.
2. Upload the photo from `docs/regen2/send/` (for example `06-bath-salt.png`).
3. Paste the **master prompt** below, plus the extra line for that photo from the table.
4. Check the result:
   - The packaging, labels, colours and text are identical to the photo you uploaded.
   - Nothing is added.
5. Save it in `docs/regen2/incoming/` with the **same filename**, then tell me. I'll check every label against your original and install it.

## Master prompt
```
Product photography edit. Keep the product in this photo EXACTLY as it is: same packaging, same shape, same colours, same labels, same logo and every word of printed text unchanged and perfectly sharp. Do not redesign, redraw or add anything to the product.
Remove the background, hands, props and surface, and place the product alone, centred, on a seamless warm off-white studio background (#F3F1EE), like a premium Scandinavian e-commerce catalogue: soft even light from the front-left, a gentle natural contact shadow beneath, product upright and facing the camera, filling about 60% of the frame height.
Portrait 4:5, highest resolution, crisp focus.
```

## Extra line per photo

| File | Add this line |
|---|---|
| 01-luxe-kit | `Show only the chocolate-brown Luxe Bath & Body Care Kit box, closed, lid facing the camera, exactly as printed.` |
| 02-tranquil-box | `Show the open floral gift box with its card and four products exactly as arranged; remove the candles and flowers around it.` |
| 03-serenity-box | `Show the open floral gift box with its card and three products exactly as arranged; remove the candles and flowers around it.` |
| 04-festive-ritual-box | `Show one festive box standing upright, front facing the camera.` |
| 05-festive-ritual-pouch | `Show the organza pouch with its three products standing on its own (no hand).` |
| 06-bath-salt | – |
| 07-ubtan | – |
| 08-unwind-candle | `Show the closed rose-gold tin with its round label facing the camera.` |
| 09-lavender-candle | – |
| 10-mahogany-candle | `Show the jar standing on its own, no hand.` |
| 11-rose-candle | `Show the open red tin with the rose candle inside, unlit.` |
| 12-glycerine-soap | `Show the soap bar lying on its own, no hand.` |
| 13-wax-sachets | `Show three of the wax sachets standing in a neat fan.` |
| 14-favour-pouches | `Show three pouches with their tags facing the camera.` |
