"""Replace AI-drawn "SB" marks with the official Sacred Basil logo.

Usage: python brandfix.py <jobs.json> [name ...]

Each job reads `src`, applies `ops` in order and writes `out` (plus a
side-by-side `preview` if given). Ops:

  erase   {box:[x0,y0,x1,y1] | poly:[[x,y],...], ink:"bright"|"dark"|"both",
           thresh, grow, stroke, fit, texbox:[x0,y0,x1,y1], tex:[dx,dy]}
          Masks ink pixels inside the box/polygon (brighter/darker than the
          surface; "both" also catches drop shadows) and fills them. `fit`
          fills with a smooth colour fit of the surface (best on labels and
          lids); otherwise inpaints. Grain comes from `texbox` (a clean patch
          of the same surface, randomly quilted) or `tex` (offset copy).
  fill    same as erase but masks the whole box.
  unlight {flame:[x0,y0,x1,y1], clone, feather, wick:[x,y_top,y_bottom],
           wick_w, wick_color, glow:[x,y,r,amount]}
          Removes a flame by cloning the strip from either side (works on
          the jar axis), then draws a fresh wick.
  logo    {kind:"lockup"|"monogram"|"wordmark", cx, cy, w, angle, color,
           finish:"foil"|"print", light, foil_grain, opacity,
           angle, vangle, vscale, quad:[[x,y]*4] (optional)}
          Paints the official mark. angle = baseline rotation; vangle/vscale
          shear and foreshorten for tilted surfaces; `quad` (TL,TR,BR,BL)
          gives full perspective.
  text    {text, font, size, cx, cy, color, angle, tracking}
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
LOGOS = {k: HERE / "masks" / f"sb-{k}.png" for k in ("lockup", "monogram", "wordmark")}
FONTS = HERE / "fonts"


# Packaging lockup, as printed on the real box (brochure p.11) and in the
# brochure layouts: "SACRED BASIL" a little wider than the monogram, so it
# stays legible on small labels. Ratios are of the monogram's width/height.
WORD_W = 1.2
WORD_GAP = 0.12
# Below this cap height (output px) the hairline wordmark goes faint, so its
# strokes are thickened by up to WORD_BOLD px, as ink spread does in print.
WORD_MIN_H = 10
WORD_BOLD = 0.35


def load_mask(kind, word_w=WORD_W, gap=WORD_GAP, target_w=None, bold=1.0):
    if kind == "lockup":
        mono, word = load_mask("monogram"), load_mask("wordmark")
        mw = mono.shape[1]
        ww = int(round(mw * word_w))
        word = cv2.resize(word, (ww, int(round(word.shape[0] * ww / word.shape[1]))), interpolation=cv2.INTER_AREA)
        if target_w:
            px = max(mw, ww) / target_w            # mask px per output px
            h = word.shape[0] / px                 # wordmark height in output px
            r = bold * WORD_BOLD * float(np.clip((WORD_MIN_H - h) / WORD_MIN_H, 0, 1)) * px
            if r >= 1:
                k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * int(r) + 1,) * 2)
                word = cv2.dilate(word, k)
        g = int(round(mono.shape[0] * gap))
        W = max(mw, ww)
        out = np.zeros((mono.shape[0] + g + word.shape[0], W), np.float32)
        out[:mono.shape[0], (W - mw) // 2:(W - mw) // 2 + mw] = mono
        out[mono.shape[0] + g:, (W - ww) // 2:(W - ww) // 2 + ww] = word
        return out
    m = cv2.imread(str(LOGOS[kind]), cv2.IMREAD_UNCHANGED)
    alpha = m[:, :, 3] if m.shape[2] == 4 else 255 - cv2.cvtColor(m, cv2.COLOR_BGR2GRAY)
    ys, xs = np.nonzero(alpha > 8)
    return alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1].astype(np.float32) / 255


def lum(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2LAB)[:, :, 0].astype(np.float32)


def erase(img, op, whole=False):
    if "poly" in op:
        pts = np.array(op["poly"])
        x0, y0 = pts.min(0)
        x1, y1 = pts.max(0)
    else:
        x0, y0, x1, y1 = op["box"]
    pad = 12
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(img.shape[1], x1 + pad), min(img.shape[0], y1 + pad)
    crop = img[Y0:Y1, X0:X1].copy()
    L = lum(crop)
    inner = np.zeros(L.shape, np.uint8)
    if "poly" in op:
        cv2.fillPoly(inner, [np.int32(pts - [X0, Y0])], 1)
    else:
        inner[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = 1
    inner = inner.astype(bool)
    if whole:
        mask = inner
    else:
        # Background = morphological open/close with a kernel wider than the
        # strokes, so thick foil letters don't leak into the estimate.
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (op.get("stroke", 31),) * 2)
        ink = op.get("ink", "bright")
        if ink == "both":
            # Letters with drop shadows: median of the surface, either direction.
            bg = cv2.GaussianBlur(cv2.medianBlur(L.astype(np.uint8), op.get("stroke", 31) | 1).astype(np.float32), (0, 0), 4)
            d = np.abs(L - bg)
        else:
            bright = ink == "bright"
            bg = cv2.morphologyEx(L, cv2.MORPH_OPEN if bright else cv2.MORPH_CLOSE, k)
            bg = cv2.GaussianBlur(bg, (0, 0), 4)
            d = L - bg if bright else bg - L
        mask = (d > op.get("thresh", 10)) & inner
    mask = mask.astype(np.uint8) * 255
    g = op.get("grow", 3)
    if g:
        mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * g + 1, 2 * g + 1)))
    mask[~inner] = 0
    m3 = (mask > 0)[:, :, None]
    if op.get("fit"):
        # Flat surfaces (labels, lids): fit a smooth quadratic colour field to
        # the clean pixels and use it under the mask. No streaks, no blotches.
        yy, xx = np.mgrid[0:crop.shape[0], 0:crop.shape[1]].astype(np.float32)
        xx /= crop.shape[1]
        yy /= crop.shape[0]
        basis = np.stack([np.ones_like(xx), xx, yy, xx * xx, yy * yy, xx * yy], -1)
        clean = cv2.erode((mask == 0).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        if "fitbox" in op:
            fb = np.zeros_like(clean)
            a0, b0, a1, b1 = op["fitbox"]
            fb[max(0, b0 - Y0):b1 - Y0, max(0, a0 - X0):a1 - X0] = True
            clean &= fb
        lowpass = cv2.GaussianBlur(crop.astype(np.float32), (0, 0), 3)
        coef, *_ = np.linalg.lstsq(basis[clean], lowpass[clean], rcond=None)
        filled = np.einsum("hwk,kc->hwc", basis, coef)
    else:
        filled = cv2.inpaint(crop, mask, op.get("radius", 7), cv2.INPAINT_TELEA)
        # Smooth out inpainting streaks; texture is added back below.
        smooth = cv2.GaussianBlur(filled, (0, 0), op.get("smooth", 5))
        filled = np.where(m3, smooth, filled)
    # Put back surface grain. Prefer real texture: `tex` = [dx, dy] offset to a
    # clean area, or `texbox` = a clean rectangle tiled (mirrored) over the area.
    if "texbox" in op:
        grain = quilt(img, op["texbox"], crop.shape[:2], op.get("patch", 24)) * op.get("grain", 0.85)
    elif "tex" in op:
        dx, dy = op["tex"]
        src = img[Y0 + dy:Y1 + dy, X0 + dx:X1 + dx].astype(np.float32)
        grain = (src - cv2.GaussianBlur(src, (0, 0), 3)) * op.get("grain", 1.0)
    else:
        ring = (~inner)
        hp = crop.astype(np.float32) - cv2.GaussianBlur(crop, (0, 0), 2).astype(np.float32)
        sigma = hp[ring].std(axis=0) if ring.any() else np.zeros(3)
        rng = np.random.default_rng(7)
        noise = rng.normal(0, 1, crop.shape[:2]).astype(np.float32)
        noise = cv2.GaussianBlur(noise, (0, 0), 0.7)
        noise /= noise.std() + 1e-6
        grain = noise[:, :, None] * sigma[None, None, :] * op.get("grain", 0.9)
    soft = cv2.GaussianBlur(mask, (0, 0), op.get("feather", 2.0)).astype(np.float32)[:, :, None] / 255
    soft = np.clip(soft * 1.6, 0, 1)
    out = filled.astype(np.float32) + grain * soft
    out = crop * (1 - soft) + out * soft
    img[Y0:Y1, X0:X1] = np.clip(out, 0, 255).astype(np.uint8)


def lerase(img, op):
    """Local erase for small labels: mask the old letters (plus halo, either
    polarity, against a median of the surface), fill them with a membrane
    (Laplace) interpolation of the pixels around them so gloss and shading
    gradients carry straight through, then put back grain copied from the
    cleanest nearby offset of the same surface. Only masked pixels change.
    op: box|poly, ink "both"|"bright"|"dark", thresh, grow, stroke, grain, reach"""
    if "poly" in op:
        pts = np.array(op["poly"])
        x0, y0 = pts.min(0)
        x1, y1 = pts.max(0)
    else:
        x0, y0, x1, y1 = op["box"]
    x0, y0, x1, y1 = int(np.floor(x0)), int(np.floor(y0)), int(np.ceil(x1)), int(np.ceil(y1))
    reach = op.get("reach", 40)
    X0, Y0 = max(0, x0 - reach), max(0, y0 - reach)
    X1, Y1 = min(img.shape[1], x1 + reach), min(img.shape[0], y1 + reach)
    crop = img[Y0:Y1, X0:X1].astype(np.float32)
    L = lum(img[Y0:Y1, X0:X1])
    inner = np.zeros(L.shape, np.uint8)
    if "poly" in op:
        cv2.fillPoly(inner, [np.int32(pts - [X0, Y0])], 1)
    else:
        inner[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = 1
    med = cv2.medianBlur(L.astype(np.uint8), op.get("stroke", 21) | 1).astype(np.float32)
    ink = op.get("ink", "both")
    d = np.abs(L - med) if ink == "both" else (L - med if ink == "bright" else med - L)
    m = ((d > op.get("thresh", 10)) & (inner > 0)).astype(np.uint8)
    g = op.get("grow", 2)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * g + 1,) * 2)) & inner
    mb = m.astype(bool)
    fill = cv2.inpaint(np.clip(crop, 0, 255).astype(np.uint8), m * 255, 3, cv2.INPAINT_NS).astype(np.float32)
    kern = np.float32([[0, .25, 0], [.25, 0, .25], [0, .25, 0]])
    for _ in range(op.get("iters", 400)):
        avg = cv2.filter2D(fill, -1, kern, borderType=cv2.BORDER_REPLICATE)
        fill[mb] = avg[mb]
    # Grain: the masked shape shifted onto the quietest clean area nearby
    # (lowest high-pass energy = no letters, edges or highlights).
    hp = crop - cv2.GaussianBlur(crop, (0, 0), 1.5)
    energy = np.abs(cv2.GaussianBlur(crop, (0, 0), 1.0) - cv2.GaussianBlur(crop, (0, 0), 4)).sum(2)
    ys, xs = np.nonzero(mb)
    grain = np.zeros_like(crop)
    if len(ys):
        best = None
        for dist in range(8, reach + 1, 4):
            for ang in range(0, 360, 30):
                dx = int(round(dist * np.cos(np.deg2rad(ang))))
                dy = int(round(dist * np.sin(np.deg2rad(ang))))
                sy, sx = ys + dy, xs + dx
                if sy.min() < 0 or sx.min() < 0 or sy.max() >= L.shape[0] or sx.max() >= L.shape[1]:
                    continue
                if mb[sy, sx].mean() > 0.02:
                    continue
                e = energy[sy, sx].mean() + 0.05 * dist
                if best is None or e < best[0]:
                    best = (e, dx, dy)
        if best:
            _, dx, dy = best
            grain[ys, xs] = hp[ys + dy, xs + dx]
    out = fill + grain * op.get("grain", 1.0)
    soft = cv2.GaussianBlur(m.astype(np.float32), (0, 0), op.get("feather", 0.7))
    soft = np.clip(soft * 1.5, 0, 1)[:, :, None]
    out = crop * (1 - soft) + out * soft
    img[Y0:Y1, X0:X1] = np.clip(out, 0, 255).astype(np.uint8)


def quilt(img, box, shape, p):
    """Fill `shape` with high-pass texture from random patches of `box`,
    cross-faded so there are no seams or repeats."""
    a0, b0, a1, b1 = box
    src = img[b0:b1, a0:a1].astype(np.float32)
    src = src - cv2.GaussianBlur(src, (0, 0), 3)
    p = min(p, src.shape[0] - 1, src.shape[1] - 1)
    ov = max(2, p // 4)
    step = p - ov
    H, W = shape
    acc = np.zeros((H + p, W + p, 3), np.float32)
    wsum = np.zeros((H + p, W + p, 1), np.float32)
    ramp = np.minimum(np.minimum(np.arange(p) + 1, p - np.arange(p)), ov).astype(np.float32) / ov
    win = (ramp[:, None] * ramp[None, :])[:, :, None]
    rng = np.random.default_rng(11)
    for y in range(0, H + 1, step):
        for x in range(0, W + 1, step):
            sy = rng.integers(0, src.shape[0] - p + 1)
            sx = rng.integers(0, src.shape[1] - p + 1)
            acc[y:y + p, x:x + p] += src[sy:sy + p, sx:sx + p] * win
            wsum[y:y + p, x:x + p] += win
    out = acc / np.maximum(wsum, 1e-6)
    # Blending averages patches and lowers contrast; restore the source level.
    return out[:H, :W] * (src.std() / (out[:H, :W].std() + 1e-6))


def place_alpha(img, alpha, op):
    """Warp a 0..1 alpha into image space; returns full-size alpha."""
    h, w = alpha.shape
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    if "quad" in op:
        dst = np.float32(op["quad"])
    else:
        W = op["w"]
        H = W * h / w * op.get("vscale", 1.0)
        a = np.deg2rad(op.get("angle", 0))
        # Plane axes: u along the text baseline, v "down" the surface
        # (vangle lets v lean for surfaces seen at an angle).
        va = np.deg2rad(op.get("vangle", op.get("angle", 0) + 90))
        u = np.array([np.cos(a), np.sin(a)])
        v = np.array([np.cos(va), np.sin(va)])
        C = np.array([op["cx"], op["cy"]])
        dst = np.float32([C + sx * W / 2 * u + sy * H / 2 * v for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
    # Supersample: warp at SS x resolution inside the target's bounding box,
    # then area-downscale, so curves come out smooth instead of stair-stepped.
    SS = 4
    bx0, by0 = np.floor(dst.min(0)).astype(int) - 2
    bx1, by1 = np.ceil(dst.max(0)).astype(int) + 2
    M = cv2.getPerspectiveTransform(src, np.float32((dst - [bx0, by0]) * SS))
    big = cv2.warpPerspective(alpha, M, ((bx1 - bx0) * SS, (by1 - by0) * SS), flags=cv2.INTER_LINEAR)
    small = cv2.resize(big, (bx1 - bx0, by1 - by0), interpolation=cv2.INTER_AREA)
    full = np.zeros(img.shape[:2], np.float32)
    H_, W_ = full.shape
    cx0, cy0, cx1, cy1 = max(bx0, 0), max(by0, 0), min(bx1, W_), min(by1, H_)
    full[cy0:cy1, cx0:cx1] = small[cy0 - by0:cy1 - by0, cx0 - bx0:cx1 - bx0]
    return full


def downsample_mask(alpha, target_w):
    scale = max(1, int(alpha.shape[1] / (target_w * 8)))
    if scale > 1:
        alpha = cv2.resize(alpha, (alpha.shape[1] // scale, alpha.shape[0] // scale), interpolation=cv2.INTER_AREA)
    return alpha


def paint(img, A, op):
    """Composite colour through alpha A (full-size, 0..1) with a finish."""
    color = np.array(op.get("color", [190, 160, 110])[::-1], np.float32)  # RGB -> BGR
    A = A * op.get("opacity", 1.0)
    blur = op.get("soften", 0.3)
    if blur:
        A = cv2.GaussianBlur(A, (0, 0), blur)
    base = img.astype(np.float32)
    finish = op.get("finish", "print")
    if finish == "foil":
        # Foil: metallic colour that follows scene light, slight highlight
        # sweep and a hairline debossed shadow under the strokes.
        ys, xs = np.nonzero(A > 0.05)
        if len(ys):
            y0, y1 = ys.min(), ys.max() + 1
            t = np.zeros(A.shape, np.float32)
            t[y0:y1] = np.linspace(0, 1, y1 - y0)[:, None]
            light = op.get("light", 0.18)
            col = color[None, None, :] * (1 + light * (0.5 - t))[:, :, None]
        else:
            col = color[None, None, :] * np.ones_like(A)[:, :, None]
        # Foil is stamped into the paper, so it keeps some of the surface grain.
        hp = base - cv2.GaussianBlur(base, (0, 0), 2.5)
        col = col + hp * op.get("foil_grain", 0.6)
        sh = np.roll(A, (1, 1), (0, 1)) * (1 - A)
        base = base * (1 - 0.25 * sh[:, :, None])
    else:
        col = color[None, None, :] * np.ones_like(A)[:, :, None]
        # Ink picks up the surface shading underneath.
        L = cv2.GaussianBlur(lum(img), (0, 0), 6)
        ref = op.get("shade_ref")
        if ref:
            col = col * np.clip(L / ref, 0.6, 1.3)[:, :, None]
    out = base * (1 - A[:, :, None]) + col * A[:, :, None]
    img[:] = np.clip(out, 0, 255).astype(np.uint8)


def as_lockup(op):
    """Jobs give `w` as the monogram's width; the lockup is `word` (default
    WORD_W) times wider. Use word=1.0 on curved labels to keep the wordmark
    on the flat, evenly lit front."""
    if op.get("kind", "lockup") == "lockup" and "w" in op:
        return {**op, "w": op["w"] * max(1.0, op.get("word", WORD_W))}
    return op


def logo(img, op):
    op = as_lockup(op)
    tw = op.get("w") or np.linalg.norm(np.subtract(op["quad"][1], op["quad"][0]))
    alpha = load_mask(op.get("kind", "lockup"), word_w=op.get("word", WORD_W), target_w=tw, bold=op.get("bold", 1.0))
    alpha = downsample_mask(alpha, tw)
    paint(img, place_alpha(img, alpha, op), op)


def text(img, op):
    font = ImageFont.truetype(str(FONTS / op["font"]), op["size"] * 4)
    tracking = op.get("tracking", 0) * 4
    chars = op["text"]
    widths = [font.getlength(ch) for ch in chars]
    W = int(sum(widths) + tracking * (len(chars) - 1)) + 8
    asc, desc = font.getmetrics()
    canvas = Image.new("L", (W, asc + desc + 8), 0)
    d = ImageDraw.Draw(canvas)
    x = 4
    for ch, cw in zip(chars, widths):
        d.text((x, 4), ch, font=font, fill=255)
        x += cw + tracking
    alpha = np.asarray(canvas, np.float32) / 255
    ys, xs = np.nonzero(alpha > 0.03)
    alpha = alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    alpha = cv2.resize(alpha, (max(1, alpha.shape[1] // 4), max(1, alpha.shape[0] // 4)), interpolation=cv2.INTER_AREA)
    o = dict(op)
    o["w"] = alpha.shape[1]
    paint(img, place_alpha(img, alpha, o), {**op, "soften": op.get("soften", 0.3)})


def unlight(img, op):
    """Put out a candle: inpaint flame + charred wick, then draw a short fresh
    cotton wick standing in unmelted wax.
    flame: [x0,y0,x1,y1] box around flame and old wick
    wick: [x, y_top, y_bottom], wick_w, wick_color (RGB)"""
    x0, y0, x1, y1 = op["flame"]
    # Rebuild the strip from copies shifted left and right (`clone` px): near
    # a jar's axis the glass rim and wax look the same a few px either side.
    dx = op.get("clone", 24)
    src = img.astype(np.float32)
    left = np.roll(src, dx, 1)
    right = np.roll(src, -dx, 1)
    fill = (left + right) / 2
    m = np.zeros(img.shape[:2], np.float32)
    m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), op.get("feather", 2.5))[:, :, None]
    out = src * (1 - m) + fill * m
    glow = op.get("glow")
    if glow:
        gx, gy, gr, amt = glow
        yy, xx = np.mgrid[0:img.shape[0], 0:img.shape[1]]
        w = np.exp(-(((xx - gx) ** 2 + (yy - gy) ** 2) / (2 * gr * gr)))[:, :, None]
        out = out * (1 - amt * w)
    img[:] = np.clip(out, 0, 255).astype(np.uint8)
    if "wick" in op:
        x, yt, yb = op["wick"]
        wcol = op.get("wick_color", [96, 80, 66])
        A = np.zeros(img.shape[:2], np.float32)
        SS = 4
        big = np.zeros(((yb - yt + 8) * SS, 16 * SS), np.uint8)
        cv2.line(big, (8 * SS, 4 * SS), (8 * SS + int(op.get("lean", 0) * SS), (yb - yt + 4) * SS), 255,
                 int(op.get("wick_w", 2) * SS), cv2.LINE_AA)
        small = cv2.resize(big, (16, yb - yt + 8), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
        A[yt - 4:yb + 4, x - 8:x + 8] = small
        paint(img, A, {"color": wcol, "finish": "print", "soften": 0.3})


def run(job):
    img = cv2.imread(str(ROOT / job["src"]), cv2.IMREAD_COLOR)
    before = img.copy()
    for op in job["ops"]:
        t = op["op"]
        if t == "erase":
            erase(img, op)
        elif t == "fill":
            erase(img, op, whole=True)
        elif t == "lerase":
            lerase(img, op)
        elif t == "logo":
            logo(img, op)
        elif t == "text":
            text(img, op)
        elif t == "unlight":
            unlight(img, op)
    out = ROOT / job["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix == ".webp":
        Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).save(out, quality=job.get("quality", 88), method=6)
    else:
        cv2.imwrite(str(out), img)
    if job.get("preview"):
        crop = job.get("crop")
        a, b = before, img
        if crop:
            x0, y0, x1, y1 = crop
            a, b = a[y0:y1, x0:x1], b[y0:y1, x0:x1]
        cv2.imwrite(job["preview"], np.hstack([a, np.full((a.shape[0], 6, 3), 255, np.uint8), b]))
    print("wrote", job["out"])


if __name__ == "__main__":
    jobs = json.loads(Path(sys.argv[1]).read_text())
    names = set(sys.argv[2:])
    for j in jobs:
        if not names or j["name"] in names:
            run(j)
