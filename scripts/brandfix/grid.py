"""Crop a region of an image, enlarge it and draw a labelled pixel grid (for locating logos)."""
import sys
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
x0, y0, x1, y1 = map(int, sys.argv[3:7])
step = int(sys.argv[7]) if len(sys.argv) > 7 else 20
im = Image.open(src).convert("RGB").crop((x0, y0, x1, y1))
scale = max(1, 1400 // max(im.size))
im = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
d = ImageDraw.Draw(im)
for x in range((x0 // step + 1) * step, x1, step):
    X = (x - x0) * scale
    d.line([(X, 0), (X, im.height)], fill=(0, 255, 255), width=1)
    d.text((X + 2, 2), str(x), fill=(255, 255, 0))
for y in range((y0 // step + 1) * step, y1, step):
    Y = (y - y0) * scale
    d.line([(0, Y), (im.width, Y)], fill=(0, 255, 255), width=1)
    d.text((2, Y + 2), str(y), fill=(255, 255, 0))
im.save(out)
