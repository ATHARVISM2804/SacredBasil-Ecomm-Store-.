"""Print Sacred Basil label artwork onto a blank label in a generated packshot.

Usage: python packlabel.py <specs.json> [name ...]

Each spec: {name, src, out, label: {...}, art: {...}}
  label  where the blank label is. Either `auto: true` (largest dark-brown
         region, optionally inside `within: [x0,y0,x1,y1]`) or an explicit
         box `box: [x0,y0,x1,y1]`; plus `shape`: "cylinder" (jar, bottle,
         candle) or "flat" (soap, box lid). `inset` (0..1) keeps the art off
         the label edges; `sag` overrides the measured curvature (px).
  art    the artwork, stacked top to bottom and centred:
         lockup (official monogram + wordmark, `lockup_w` = fraction of the
         printable width), ornament (hairline, lotus, hairline), `name`
         (Cormorant, "\n" for two lines), `sub` (small Jost caps line).
         `ink` RGB, `scale` overall size (fraction of label height used).

The artwork is drawn flat at high resolution, wrapped onto the label (arc
length mapping on a cylinder seen from slightly above), then shaded by the
label's own lighting so it reads as printed, not pasted.
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

import brandfix as bf

HERE = Path(__file__).resolve().parent
LOTUS = HERE / "masks" / "lotus.png"
LOTUS_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24" fill="none" stroke="#000" stroke-width="1.1">'
    '<path d="M20 21c-2.6-3-3.4-7.6 0-13 3.4 5.4 2.6 10 0 13Z"/>'
    '<path d="M19.4 21c-4.4-.8-8-4.2-8.6-9.4 4.6 1 7.6 4.4 8.6 9.4Z"/>'
    '<path d="M20.6 21c4.4-.8 8-4.2 8.6-9.4-4.6 1-7.6 4.4-8.6 9.4Z"/>'
    '<path d="M18.6 21.2c-5.6.8-10.6-1.4-14-5.6 5.2-.8 10.2 1 14 5.6Z"/>'
    '<path d="M21.4 21.2c5.6.8 10.6-1.4 14-5.6-5.2-.8-10.2 1-14 5.6Z"/></svg>'
)


def lotus_mask():
    if not LOTUS.exists():
        svg = Path(tempfile.mkdtemp()) / "lotus.svg"
        svg.write_text(LOTUS_SVG)
        js = "require('sharp')(process.argv[1],{density:1200}).ensureAlpha().png().toFile(process.argv[2])"
        subprocess.run(["node", "-e", js, str(svg), str(LOTUS)], check=True, cwd=bf.ROOT)
    a = cv2.imread(str(LOTUS), cv2.IMREAD_UNCHANGED)[:, :, 3].astype(np.float32) / 255
    ys, xs = np.nonzero(a > 0.03)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def fit_w(a, w):
    h = max(1, int(round(a.shape[0] * w / a.shape[1])))
    return cv2.resize(a, (int(w), h), interpolation=cv2.INTER_AREA)


def text_mask(text, font, px, tracking=0.0):
    f = ImageFont.truetype(str(bf.FONTS / font), int(px))
    lines = text.split("\n")
    rows = []
    for line in lines:
        widths = [f.getlength(c) for c in line]
        pad = int(px * 0.5)   # room for glyph overhang (italic tails, swashes)
        W = int(sum(widths) + tracking * px * max(0, len(line) - 1)) + 2 * pad
        asc, desc = f.getmetrics()
        im = Image.new("L", (W, asc + desc + pad), 0)
        d = ImageDraw.Draw(im)
        x = pad
        for c, cw in zip(line, widths):
            d.text((x, 5), c, font=f, fill=255)
            x += cw + tracking * px
        a = np.asarray(im, np.float32) / 255
        ys, xs = np.nonzero(a > 0.03)
        rows.append(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    gap = int(px * 0.18)
    W = max(r.shape[1] for r in rows)
    out = np.zeros((sum(r.shape[0] for r in rows) + gap * (len(rows) - 1), W), np.float32)
    y = 0
    for r in rows:
        x = (W - r.shape[1]) // 2
        out[y:y + r.shape[0], x:x + r.shape[1]] = r
        y += r.shape[0] + gap
    return out


def compose_art(art, W, H):
    """Flat artwork alpha, W x H (the printable area), elements centred."""
    parts = []  # (alpha, gap_after as fraction of H)
    if art.get("lockup", True):
        lw = W * art.get("lockup_w", 0.42)
        parts.append((bf.load_mask("lockup", word_w=art.get("word", bf.WORD_W)), lw, art.get("gap_lockup", 0.07)))
    if art.get("ornament", True):
        lot = lotus_mask()
        ow = W * art.get("ornament_w", 0.5)
        lh = ow * 0.11
        lw = lh * lot.shape[1] / lot.shape[0]
        canvas = np.zeros((int(lh) + 2, int(ow)), np.float32)
        l = fit_w(lot, lw)
        x0 = (canvas.shape[1] - l.shape[1]) // 2
        canvas[:l.shape[0], x0:x0 + l.shape[1]] = l
        y = int(l.shape[0] * 0.92)
        t = max(1, int(round(ow * 0.004)))
        canvas[y - t:y, : max(0, x0 - int(lw * 0.15))] = 0.85
        canvas[y - t:y, x0 + l.shape[1] + int(lw * 0.15):] = 0.85
        parts.append((canvas, ow, art.get("gap_ornament", 0.06)))
    if art.get("name"):
        nm = text_mask(art["name"], art.get("font", "Cormorant.ttf"), 400)
        parts.append((nm, W * art.get("name_w", 0.7), art.get("gap_name", 0.04)))
    if art.get("tagline"):
        tg = text_mask(art["tagline"], "Cormorant.ttf", 300)
        parts.append((tg, W * art.get("tag_w", 0.55), art.get("gap_tag", 0.05)))
    if art.get("sub"):
        sb = text_mask(art["sub"].upper(), "Jost.ttf", 200, tracking=0.12)
        parts.append((sb, W * art.get("sub_w", 0.45), 0))
    scaled = []
    for a, w, g in parts:
        a2 = fit_w(a, min(w, a.shape[1] * 8))
        scaled.append((a2, g))
    total = sum(a.shape[0] for a, _ in scaled) + sum(g * H for _, g in scaled[:-1])
    k = min(1.0, H * art.get("scale", 0.86) / total)
    out = np.zeros((H, W), np.float32)
    y = (H - total * k) / 2
    for a, g in scaled:
        a = cv2.resize(a, (max(1, int(a.shape[1] * k)), max(1, int(a.shape[0] * k))), interpolation=cv2.INTER_AREA)
        x = (W - a.shape[1]) // 2
        yi = int(round(y))
        out[yi:yi + a.shape[0], x:x + a.shape[1]] = np.maximum(out[yi:yi + a.shape[0], x:x + a.shape[1]], a)
        y += a.shape[0] + g * H * k
    return out


def find_label(img, lab):
    """Largest dark-brown region (the blank label), or with tone "light" the
    largest near-white, low-chroma region (white paper labels). Returns its mask."""
    L = bf.lum(img)
    Lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    if lab.get("tone") == "light":
        x0, y0, x1, y1 = lab["within"]
        top = np.percentile(L[y0:y1, x0:x1], 97)
        chroma = np.hypot(Lab[:, :, 1] - 128, Lab[:, :, 2] - 128)
        brown = (L > top - lab.get("tol", 14)) & (chroma < lab.get("max_chroma", 12))
    else:
        brown = (L < lab.get("max_l", 105)) & (Lab[:, :, 1] > 128) & (Lab[:, :, 2] > 128)
    if "within" in lab:
        x0, y0, x1, y1 = lab["within"]
        keep = np.zeros_like(brown)
        keep[y0:y1, x0:x1] = True
        brown &= keep
    m = cv2.morphologyEx(brown.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, labl, st, _ = cv2.connectedComponentsWithStats(m)
    i = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    if lab.get("rect"):
        # Paper labels are rectangles: use the component's box, slightly inset
        # so the art never touches a shadowed edge.
        x, y, w, h = st[i, :4]
        e = lab.get("edge", 3)
        out = np.zeros(labl.shape, bool)
        out[y + e:y + h - e, x + e:x + w - e] = True
        return out
    return labl == i


def print_quad(img, lab, art):
    """Flat label seen in perspective: `quad` = TL, TR, BR, BL corners."""
    q = np.float32(lab["quad"])
    c = q.mean(0)
    inset = lab.get("inset", 0.1)
    qi = c + (q - c) * (1 - 2 * inset)
    W = int(np.linalg.norm(qi[1] - qi[0]))
    H = int(np.linalg.norm(qi[3] - qi[0]))
    SS = 3
    flat = compose_art(art, W * SS, H * SS)
    src = np.float32([[0, 0], [W * SS, 0], [W * SS, H * SS], [0, H * SS]])
    M = cv2.getPerspectiveTransform(src, qi)
    A = cv2.warpPerspective(flat, M, (img.shape[1], img.shape[0]), flags=cv2.INTER_AREA)
    mask = np.zeros(img.shape[:2], np.uint8)
    cv2.fillPoly(mask, [np.int32(q)], 1)
    return A * mask, mask.astype(bool)


def print_label(img, spec):
    lab, art = spec["label"], spec["art"]
    if "quad" in lab:
        A, mask = print_quad(img, lab, art)
        composite(img, A, mask, art)
        return
    if lab.get("auto"):
        mask = find_label(img, lab)
    else:
        x0, y0, x1, y1 = lab["box"]
        mask = np.zeros(img.shape[:2], bool)
        mask[y0:y1, x0:x1] = True
    ys, xs = np.nonzero(mask)
    x0, x1 = xs.min(), xs.max()
    cx, R = (x0 + x1) / 2, (x1 - x0) / 2
    # Top/bottom edge per column, to measure height and the ellipse sag.
    cols = np.arange(x0, x1 + 1)
    tops = np.array([ys[xs == c].min() if (xs == c).any() else np.nan for c in cols])
    bots = np.array([ys[xs == c].max() if (xs == c).any() else np.nan for c in cols])
    u = (cols - cx) / R
    core = np.abs(u) < 0.8
    shape = lab.get("shape", "cylinder")
    if shape == "cylinder":
        # top(u) = t0 + sag * sqrt(1 - u^2): least squares on the clean middle.
        A = np.stack([np.ones(core.sum()), np.sqrt(1 - u[core] ** 2)], 1)
        (t0, sag_t), *_ = np.linalg.lstsq(A, tops[core], rcond=None)
        (b0, sag_b), *_ = np.linalg.lstsq(A, bots[core], rcond=None)
        sag = lab.get("sag", (sag_t + sag_b) / 2)
        top_c, bot_c = t0 + sag, b0 + sag   # edges at the centre column
    else:
        sag = 0
        top_c, bot_c = np.nanmedian(tops[core]), np.nanmedian(bots[core])
    Hc = bot_c - top_c
    inset = lab.get("inset", 0.12)
    # Printable area: front arc of +-phi (cylinder) or the inset box (flat).
    phi = np.deg2rad(lab.get("arc", 50))
    if shape == "cylinder":
        Wart = 2 * phi * R * (1 - inset)
    else:
        Wart = (x1 - x0) * (1 - 2 * inset)
    Hart = Hc * (1 - 2 * inset)
    SS = 3
    flat = compose_art(art, int(Wart * SS), int(Hart * SS))
    # Map every output pixel back to the flat artwork.
    H_, W_ = img.shape[:2]
    gy, gx = np.mgrid[0:H_, 0:W_].astype(np.float32)
    uu = np.clip((gx - cx) / R, -0.999, 0.999)
    if shape == "cylinder":
        s = np.arcsin(uu) * R                  # arc length from the centre
        yy = gy - sag * (np.sqrt(1 - uu ** 2) - 1)
    else:
        s = gx - cx
        yy = gy
    v = yy - (top_c + Hc * inset)
    mapx = ((s + Wart / 2) * SS).astype(np.float32)
    mapy = (v * SS).astype(np.float32)
    A = cv2.remap(flat, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    A = cv2.GaussianBlur(A, (0, 0), 0.35 * SS / SS) * mask
    composite(img, A, mask, art)


def composite(img, A, mask, art):
    # Ink follows the label's lighting (brighter where the label is lit).
    L = cv2.GaussianBlur(bf.lum(img), (0, 0), 5)
    ref = np.median(L[mask])
    shade = np.clip(L / max(ref, 1), 0.65, 1.35)[:, :, None]
    ink = np.array(art.get("ink", [226, 205, 168])[::-1], np.float32)[None, None, :] * shade
    base = img.astype(np.float32)
    out = base * (1 - A[:, :, None]) + ink * A[:, :, None]
    img[:] = np.clip(out, 0, 255).astype(np.uint8)


def run(spec):
    img = cv2.imread(str(bf.ROOT / spec["src"]), cv2.IMREAD_COLOR)
    for lab_spec in spec.get("labels", [spec]) if "labels" in spec else [spec]:
        print_label(img, lab_spec)
    out = bf.ROOT / spec["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix == ".webp":
        Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).save(out, quality=88, method=6)
    else:
        cv2.imwrite(str(out), img)
    print("wrote", spec["out"])


if __name__ == "__main__":
    specs = json.loads(Path(sys.argv[1]).read_text())
    names = set(sys.argv[2:])
    for s in specs:
        if not names or s["name"] in names:
            run(s)
