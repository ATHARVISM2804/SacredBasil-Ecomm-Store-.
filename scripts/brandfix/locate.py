"""Find ink groups (letters, marks) inside a region and print their boxes.

Usage: python locate.py <image> x0 y0 x1 y1 [bright|dark] [thresh] [gap]

Pixels that differ from the local surface by more than `thresh` are grouped
(dilated by `gap` px) into blobs; each line prints a blob's box, size, ink
colour and its orientation (angle of the long axis, degrees).
"""
import sys

import cv2
import numpy as np

path = sys.argv[1]
x0, y0, x1, y1 = map(int, sys.argv[2:6])
ink = sys.argv[6] if len(sys.argv) > 6 else "bright"
thresh = float(sys.argv[7]) if len(sys.argv) > 7 else 25
gap = int(sys.argv[8]) if len(sys.argv) > 8 else 3

img = cv2.imread(path)
crop = img[y0:y1, x0:x1]
L = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB)[:, :, 0].astype(np.float32)
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
bg = cv2.morphologyEx(L, cv2.MORPH_OPEN if ink == "bright" else cv2.MORPH_CLOSE, k)
d = L - bg if ink == "bright" else bg - L
m = (d > thresh).astype(np.uint8)
grp = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_RECT, (2 * gap + 1, 2 * gap + 1)))
n, lab, stats, _ = cv2.connectedComponentsWithStats(grp)
rows = []
for i in range(1, n):
    x, y, w, h, area = stats[i]
    if area < 12:
        continue
    sel = (lab == i) & (m > 0)
    ys, xs = np.nonzero(sel)
    if len(xs) < 5:
        continue
    col = crop[sel].mean(0)[::-1].round().astype(int).tolist()
    (cx, cy), (rw, rh), ang = cv2.minAreaRect(np.column_stack([xs, ys]).astype(np.float32))
    if rw < rh:
        ang += 90
    if ang > 90:
        ang -= 180
    rows.append((y0 + ys.min(), x0 + xs.min(), x0 + xs.max(), y0 + ys.max(), len(xs), col, ang, x0 + cx, y0 + cy))
for r in sorted(rows):
    ytop, xa, xb, yb, npx, col, ang, cx, cy = r
    print(f"box [{xa},{ytop},{xb},{yb}] size {xb - xa + 1}x{yb - ytop + 1} centre ({cx:.0f},{cy:.0f}) "
          f"px {npx} rgb {col} angle {ang:.1f}")
