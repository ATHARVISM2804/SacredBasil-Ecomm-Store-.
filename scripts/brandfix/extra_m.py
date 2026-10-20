"""Extra ops for small tilted labels and candles (mobile hero frames).

Usage: python extra_m.py <jobs.json> [name ...]

Adds to the brandfix ops:
  dfill    {poly:[[x,y],...], angle, texbox, grain, blur}
           Replaces the whole polygon by interpolating, along lines at
           `angle` degrees, between the clean pixels where each line leaves
           the polygon. Keeps label edges and lighting gradients straight on
           small surfaces where inpainting smears.
  unlight2 {strip:[[x,y],...], angle, wick, wick_w, wick_color, glow}
           Removes a flame with dfill (works off the jar axis), then draws a
           fresh wick and tones down the glow like brandfix's unlight.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

import brandfix as bf


def bilinear(img, xs, ys):
    h, w = img.shape[:2]
    xs = np.clip(xs, 0, w - 1.001)
    ys = np.clip(ys, 0, h - 1.001)
    x0, y0 = np.floor(xs).astype(int), np.floor(ys).astype(int)
    fx, fy = (xs - x0)[:, None], (ys - y0)[:, None]
    a, b = img[y0, x0], img[y0, x0 + 1]
    c, d = img[y0 + 1, x0], img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def ringfit(img, mask, ys, xs, op):
    """Robust quadratic colour fit to a ring around the mask; outliers (ink,
    lotus, jar beyond a label edge) are dropped before refitting."""
    ring = cv2.dilate(mask, np.ones((2 * op.get("ring", 6) + 1,) * 2, np.uint8)) - mask
    ry, rx = np.nonzero(ring)
    low = cv2.GaussianBlur(img.astype(np.float32), (0, 0), 1.2)
    cx, cy, sc = xs.mean(), ys.mean(), max(np.ptp(xs), np.ptp(ys), 1)

    def basis(x, y):
        x = (x - cx) / sc
        y = (y - cy) / sc
        return np.stack([np.ones_like(x), x, y, x * x, y * y, x * y], 1)

    B = basis(rx.astype(float), ry.astype(float))
    V = low[ry, rx]
    keep = np.ones(len(rx), bool)
    for _ in range(4):
        coef, *_ = np.linalg.lstsq(B[keep], V[keep], rcond=None)
        res = np.abs(V - B @ coef).sum(1)
        thr = max(6.0, 2.0 * np.median(res[keep]))
        keep = res < thr
    return basis(xs.astype(float), ys.astype(float)) @ coef


def dfill(img, op):
    mask = np.zeros(img.shape[:2], np.uint8)
    cv2.fillPoly(mask, [np.int32(op["poly"])], 1)
    ys, xs = np.nonzero(mask)
    if op.get("mode") == "fit":
        canvas = img.astype(np.float32).copy()
        canvas[ys, xs] = ringfit(img, mask, ys, xs, op)
        if "texbox" in op:
            x0, y0 = xs.min(), ys.min()
            g = bf.quilt(img, op["texbox"], (ys.max() - y0 + 1, xs.max() - x0 + 1), op.get("patch", 16))
            canvas[ys, xs] += g[ys - y0, xs - x0] * op.get("grain", 0.5)
        if op.get("inkonly"):
            # Replace only the old lettering (and its shadow outline); the
            # label's own texture stays everywhere else, so no patch edges.
            diff = np.abs(cv2.GaussianBlur(img.astype(np.float32), (0, 0), 0.7) - canvas).sum(2)
            ink = ((diff > op.get("thresh", 24)) & (mask > 0)).astype(np.uint8)
            g = op.get("grow", 2)
            ink = cv2.dilate(ink, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * g + 1,) * 2)) * mask
            if op.get("inpaint"):
                # Fill the letters from the label pixels right beside them.
                inp = cv2.inpaint(img, ink * 255, op.get("radius", 4), cv2.INPAINT_TELEA).astype(np.float32)
                inp = cv2.GaussianBlur(inp, (0, 0), op.get("smooth", 1.5))
                if "clamp" in op:
                    # Inpainting can drag highlights across the hole; keep it
                    # within `clamp` of the smooth surface fit.
                    c = op["clamp"]
                    inp = np.clip(inp, canvas - c, canvas + c)
                canvas = np.where(ink[:, :, None] > 0, inp, canvas)
            soft = cv2.GaussianBlur(ink.astype(np.float32), (0, 0), op.get("feather", 1.0))[:, :, None]
            soft = np.clip(soft * 1.6, 0, 1)
        else:
            soft = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), op.get("feather", 1.2))[:, :, None]
            soft = np.clip(soft * 1.5, 0, 1)
        img[:] = np.clip(img * (1 - soft) + canvas * soft, 0, 255).astype(np.uint8)
        return
    a = np.deg2rad(op.get("angle", 0))
    d = np.array([np.cos(a), np.sin(a)])
    src = cv2.GaussianBlur(img.astype(np.float32), (0, 0), op.get("sample_blur", 1.0))
    h, w = mask.shape
    ends = []
    for sgn in (1, -1):
        dist = np.full(len(xs), np.nan)
        for k in range(1, 800):
            t = k * 0.5
            px = xs + sgn * t * d[0]
            py = ys + sgn * t * d[1]
            ix = np.clip(np.round(px).astype(int), 0, w - 1)
            iy = np.clip(np.round(py).astype(int), 0, h - 1)
            out = (mask[iy, ix] == 0) & np.isnan(dist)
            dist[out] = t
            if not np.isnan(dist).any():
                break
        dist = np.nan_to_num(dist, nan=400)
        off = dist + op.get("reach", 1.5)
        col = bilinear(src, xs + sgn * off * d[0], ys + sgn * off * d[1])
        ends.append((dist, col))
    (d1, c1), (d2, c2) = ends
    fill = (c1 * d2[:, None] + c2 * d1[:, None]) / (d1 + d2)[:, None]
    canvas = img.astype(np.float32).copy()
    canvas[ys, xs] = fill
    b = op.get("blur", 0.8)
    if b:
        canvas = np.where(mask[:, :, None] > 0, cv2.GaussianBlur(canvas, (0, 0), b), canvas)
    if "texbox" in op:
        x0, y0 = xs.min(), ys.min()
        g = bf.quilt(img, op["texbox"], (ys.max() - y0 + 1, xs.max() - x0 + 1), op.get("patch", 16))
        canvas[ys, xs] += g[ys - y0, xs - x0] * op.get("grain", 0.5)
    soft = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), op.get("feather", 0.8))[:, :, None]
    soft = np.clip(soft * 1.5, 0, 1)
    out = img.astype(np.float32) * (1 - soft) + canvas * soft
    img[:] = np.clip(out, 0, 255).astype(np.uint8)


def unlight2(img, op):
    dfill(img, {"poly": op["strip"], "angle": op.get("angle", 0), "blur": op.get("blur", 0.4),
                "sample_blur": op.get("sample_blur", 0.6),
                "feather": op.get("feather", 1.0), "reach": op.get("reach", 1.0)})
    x, y = op["wick"][0], op["wick"][1]
    rest = {k: v for k, v in op.items() if k in ("wick", "wick_w", "wick_color", "glow", "lean")}
    bf.unlight(img, {"flame": [x, y, x, y], "clone": 1, **rest})


OPS = {"dfill": dfill, "unlight2": unlight2, "erase": bf.erase, "lerase": bf.lerase, "logo": bf.logo, "text": bf.text,
       "unlight": bf.unlight}


def run(job):
    img = cv2.imread(str(bf.ROOT / job["src"]), cv2.IMREAD_COLOR)
    for op in job["ops"]:
        if op["op"] == "fill":
            bf.erase(img, op, whole=True)
        else:
            OPS[op["op"]](img, op)
    out = bf.ROOT / job["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), img)
    print("wrote", job["out"])


if __name__ == "__main__":
    jobs = json.loads(Path(sys.argv[1]).read_text())
    names = set(sys.argv[2:])
    for j in jobs:
        if not names or j["name"] in names:
            run(j)
