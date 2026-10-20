"""Helper-B extension: robust label erase for small curved jar labels.

Op `rerase` (same keys as erase: poly|box, thresh, grow, texbox, patch) fills
the masked ink with a quadratic colour field fitted only to a thin ring of
label pixels just outside the mask, rejecting outliers (nearby lettering,
glass, edges), so the fill follows the label's own shading.

Usage: python extra_b.py <jobs.json> [name ...]  (other ops pass through).
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

import brandfix as bf


def rerase(img, op):
    pts = np.array(op["poly"]) if "poly" in op else None
    if pts is not None:
        x0, y0 = pts.min(0)
        x1, y1 = pts.max(0)
    else:
        x0, y0, x1, y1 = op["box"]
    pad = op.get("ring", 8) + 6
    X0, Y0 = max(0, x0 - pad), max(0, y0 - pad)
    X1, Y1 = min(img.shape[1], x1 + pad), min(img.shape[0], y1 + pad)
    crop = img[Y0:Y1, X0:X1].copy()
    L = bf.lum(crop)
    inner = np.zeros(L.shape, np.uint8)
    if pts is not None:
        cv2.fillPoly(inner, [np.int32(pts - [X0, Y0])], 1)
    else:
        inner[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = 1
    inner = inner.astype(bool)
    med = cv2.GaussianBlur(cv2.medianBlur(L.astype(np.uint8), op.get("stroke", 21) | 1).astype(np.float32), (0, 0), 3)
    ink = np.abs(L - med) > op.get("thresh", 7)
    mask = (ink & inner).astype(np.uint8) * 255
    g = op.get("grow", 2)
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * g + 1, 2 * g + 1)))
    mask[~inner] = 0
    # Fit region: the polygon's own non-ink pixels plus a thin ring outside it.
    r = op.get("ring", 8)
    near = cv2.dilate(inner.astype(np.uint8), np.ones((2 * r + 1, 2 * r + 1), np.uint8)).astype(bool)
    fit = near & (mask == 0) & ~cv2.dilate(ink.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    if "fitbox" in op:
        fb = np.zeros_like(fit)
        a0, b0, a1, b1 = op["fitbox"]
        fb[max(0, b0 - Y0):max(0, b1 - Y0), max(0, a0 - X0):max(0, a1 - X0)] = True
        fit &= fb
    yy, xx = np.mgrid[0:crop.shape[0], 0:crop.shape[1]].astype(np.float32)
    xx /= crop.shape[1]
    yy /= crop.shape[0]
    basis = np.stack([np.ones_like(xx), xx, yy, xx * xx, yy * yy, xx * yy], -1)
    low = cv2.GaussianBlur(crop.astype(np.float32), (0, 0), 1.5)
    sel = fit.copy()
    for _ in range(3):
        coef, *_ = np.linalg.lstsq(basis[sel], low[sel], rcond=None)
        res = np.abs(low - np.einsum("hwk,kc->hwc", basis, coef)).sum(-1)
        s = np.median(res[sel]) * 2.5 + 2
        sel = fit & (res < s)
    filled = np.einsum("hwk,kc->hwc", basis, coef)
    if "texbox" in op:
        grain = bf.quilt(img, op["texbox"], crop.shape[:2], op.get("patch", 12)) * op.get("grain", 0.85)
    else:
        grain = 0
    soft = cv2.GaussianBlur(mask, (0, 0), op.get("feather", 1.5)).astype(np.float32)[:, :, None] / 255
    soft = np.clip(soft * 1.6, 0, 1)
    out = crop * (1 - soft) + (filled + grain) * soft
    img[Y0:Y1, X0:X1] = np.clip(out, 0, 255).astype(np.uint8)


def remesh(img, op):
    """Re-lay a see-through fabric (tulle) over `box`: adds quilted texture
    from the clean `texbox` on top of whatever was painted there."""
    x0, y0, x1, y1 = op["box"]
    if "tex" in op:
        # Same fabric, shifted copy from a clean neighbouring area (keeps the weave).
        dx, dy = op["tex"]
        src = img[y0 + dy:y1 + dy, x0 + dx:x1 + dx].astype(np.float32)
        hp = src - cv2.GaussianBlur(src, (0, 0), op.get("sigma", 1.5))
        base = img[y0:y1, x0:x1].astype(np.float32)
        # Threads are light: they show most over dark ink (screen-like blend).
        g = np.clip(hp, 0, None) * op.get("grain", 1.0) * (1 + op.get("screen", 2.0) * (1 - base / 255)) + np.clip(hp, None, 0) * 0.5
    else:
        g = bf.quilt(img, op["texbox"], (y1 - y0, x1 - x0), op.get("patch", 10)) * op.get("grain", 1.0)
    m = np.zeros((y1 - y0, x1 - x0), np.float32)
    m[3:-3, 3:-3] = 1
    m = cv2.GaussianBlur(m, (0, 0), 2)[:, :, None]
    img[y0:y1, x0:x1] = np.clip(img[y0:y1, x0:x1].astype(np.float32) + g * m, 0, 255).astype(np.uint8)


def clogo(img, op):
    """Logo op clipped to a rectangle `clip` (for marks partly hidden behind something)."""
    op = bf.as_lockup(op)
    alpha = bf.downsample_mask(bf.load_mask(op.get("kind", "lockup"), word_w=op.get("word", bf.WORD_W), target_w=op["w"]), op["w"])
    A = bf.place_alpha(img, alpha, op)
    c0, d0, c1, d1 = op["clip"]
    keep = np.zeros_like(A)
    keep[d0:d1, c0:c1] = 1
    keep = cv2.GaussianBlur(keep, (0, 0), 0.6)
    bf.paint(img, A * keep, op)


def utext(img, op):
    """Shaped text (Devanagari etc.) via raqm: font path, size, cx, cy, color, angle."""
    from PIL import Image, ImageDraw, ImageFont
    font = ImageFont.truetype(op["font"], op["size"] * 4, index=op.get("index", 0),
                              layout_engine=ImageFont.Layout.RAQM)
    l, t, r, b = font.getbbox(op["text"])
    canvas = Image.new("L", (r - l + 16, b - t + 16), 0)
    ImageDraw.Draw(canvas).text((8 - l, 8 - t), op["text"], font=font, fill=255)
    a = np.asarray(canvas, np.float32) / 255
    ys, xs = np.nonzero(a > 0.03)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    a = cv2.resize(a, (max(1, a.shape[1] // 4), max(1, a.shape[0] // 4)), interpolation=cv2.INTER_AREA)
    o = dict(op)
    o["w"] = op.get("w", a.shape[1])
    A = bf.place_alpha(img, a, o)
    bf.paint(img, A, {**op, "finish": "print", "soften": op.get("soften", 0.3)})


def run(job):
    img = cv2.imread(str(bf.ROOT / job["src"]), cv2.IMREAD_COLOR)
    before = img.copy()
    for op in job["ops"]:
        t = op["op"]
        if t == "rerase":
            rerase(img, op)
        elif t == "erase":
            bf.erase(img, op)
        elif t == "fill":
            bf.erase(img, op, whole=True)
        elif t == "lerase":
            bf.lerase(img, op)
        elif t == "logo":
            bf.logo(img, op)
        elif t == "text":
            bf.text(img, op)
        elif t == "unlight":
            bf.unlight(img, op)
        elif t == "remesh":
            remesh(img, op)
        elif t == "clogo":
            clogo(img, op)
        elif t == "automark":
            automark(img, op)
        elif t == "utext":
            utext(img, op)
    out = bf.ROOT / job["out"]
    from PIL import Image
    if out.suffix == ".webp":
        Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).save(out, quality=job.get("quality", 88), method=6)
    else:
        cv2.imwrite(str(out), img)
    if job.get("preview"):
        a, b = before, img
        if job.get("crop"):
            x0, y0, x1, y1 = job["crop"]
            a, b = a[y0:y1, x0:x1], b[y0:y1, x0:x1]
        cv2.imwrite(job["preview"], np.hstack([a, np.full((a.shape[0], 6, 3), 255, np.uint8), b]))
    print("wrote", job["out"])




def automark(img, op):
    """Find the old dark mark (SB + small name line) inside `win`, erase it and
    place the official lockup over the same bounding box.
    op: win:[x0,y0,x1,y1], thresh, angle, color (RGB), clip:[x0,y0,x1,y1]."""
    x0, y0, x1, y1 = op["win"]
    crop = img[y0:y1, x0:x1].copy()
    L = bf.lum(crop)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    bg = cv2.GaussianBlur(cv2.morphologyEx(L, cv2.MORPH_CLOSE, k), (0, 0), 2)
    ink = (bg - L) > op.get("thresh", 18)
    # Drop ink components touching the window border (neighbouring text).
    n, lab, st, _ = cv2.connectedComponentsWithStats(ink.astype(np.uint8), 8)
    h, w_ = ink.shape
    for i in range(1, n):
        x, y, ww, hh, area = st[i]
        if x == 0 or y == 0 or x + ww >= w_ or y + hh >= h or area < op.get("minarea", 3):
            ink[lab == i] = False
    ys, xs = np.nonzero(ink)
    bx0, bx1, by0, by1 = xs.min() + x0, xs.max() + x0 + 1, ys.min() + y0, ys.max() + y0 + 1
    print("  mark bbox", [int(bx0), int(by0), int(bx1), int(by1)])
    er = {"box": [int(bx0) - 2, int(by0) - 2, int(bx1) + 2, int(by1) + 2], "ink": "dark",
          "thresh": op.get("ethresh", 10), "grow": op.get("grow", 1), "stroke": op.get("stroke", 11),
          "fit": 1, "grain": op.get("grain", 0.25), "feather": 1.0}
    bf.erase(img, er)
    color = op.get("color")
    if color is None:
        c = crop.reshape(-1, 3)[ink.reshape(-1)]
        color = list(np.percentile(c, 15, axis=0)[::-1].round().astype(int))
        color = [int(v) for v in color]
    w = (bx1 - bx0) * op.get("wscale", 1.0)
    lop = {"kind": "lockup", "cx": (bx0 + bx1) / 2 + op.get("dx", 0), "cy": (by0 + by1) / 2 + op.get("dy", 0),
           "w": w, "angle": op.get("angle", 0), "color": color, "finish": "print", "soften": op.get("soften", 0.35)}
    alpha = bf.downsample_mask(bf.load_mask("lockup", target_w=w), w)
    A = bf.place_alpha(img, alpha, lop)
    if "clip" in op:
        c0, d0, c1, d1 = op["clip"]
        keep = np.zeros_like(A)
        keep[d0:d1, c0:c1] = 1
        A *= keep
    bf.paint(img, A, lop)


if __name__ == "__main__":
    jobs = json.loads(Path(sys.argv[1]).read_text())
    names = set(sys.argv[2:])
    for j in jobs:
        if not names or j["name"] in names:
            run(j)
