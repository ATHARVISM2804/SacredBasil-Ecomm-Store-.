"""Build the v4 home-page films from generated stills (docs/REVAMP-PLAN.md §8.2).

Usage: python build_film.py <hero|ritual|gifts> desktop|mobile <out.mp4> [--preview]

Each shot is a still with one slow camera move, plus optional motion made in
code so it reads as film, not a slideshow:
  flicker  flames breathe: radial brightness pulses with smooth noise
  haze     steam or smoke: soft noise drifting upward inside a region
  sweep    a band of light crossing bright warm surfaces
Two shot types are drawn entirely in code from the official vectors, so the
logo is exact in every frame:
  pattern  gold SB monograms and lotuses appearing on chocolate (after
           Skandinavisk's gold icon grid)
  endcard  the SACRED BASIL lockup in gold over a darkened still
Shots overlap by XFADE and the last dissolves into the first: seamless loop.
"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

import brandfix as bf
from packlabel import lotus_mask

ROOT = bf.ROOT
RAW = ROOT / "docs/gen/raw"
FPS = 30
XFADE = 0.9
GOLD = np.array([112, 172, 214], np.float32)  # BGR
CHOC = np.array([18, 26, 42], np.float32)     # BGR, deep chocolate

SIZES = {
    "hero": {"desktop": (1920, 720), "mobile": (864, 1080)},
    "luxe": {"desktop": (1920, 960), "mobile": (864, 1080)},
    "gifts": {"desktop": (1920, 960), "mobile": (864, 1080)},
}

# focus = (x, y) in 0..1 of the still: where the camera centres (and pushes to).
LUX = "../lux2/"
# Premium, product-led films. Sources are 2x upscales (3072 px) whose labels
# were printed at full resolution by print2x.py (lux2.json), so the logo and
# names stay crisp at every zoom. `mfocus` re-centres the phone crop.
FILMS = {
    "hero": [
        {"pattern": True, "dur": 2.8},
        {"img": LUX + "box.png", "dur": 3.8, "focus": (0.65, 0.5), "zoom": (1.0, 1.05), "sweep": True},
        {"img": LUX + "flatlay.png", "dur": 3.8, "focus": (0.5, 0.5), "zoom": (1.0, 1.06), "mfocus": (0.68, 0.5)},
        {"img": LUX + "scrubs.png", "dur": 3.8, "focus": (0.7, 0.52), "zoom": (1.05, 1.0)},
        {"img": LUX + "oil.png", "dur": 3.8, "focus": (0.65, 0.48), "zoom": (1.0, 1.05), "sweep": True},
        {"img": LUX + "soap.png", "dur": 3.8, "focus": (0.66, 0.48), "zoom": (1.05, 1.0)},
        {"img": LUX + "candle.png", "dur": 3.8, "focus": (0.63, 0.5), "zoom": (1.0, 1.05),
         "flicker": [(0.638, 0.256, 0.04)]},
        {"img": LUX + "group.png", "dur": 4.2, "focus": (0.62, 0.52), "zoom": (1.0, 1.04), "sweep": True,
         "mfocus": (0.76, 0.5)},
        {"endcard": LUX + "group.png", "dur": 4.0, "focus": (0.62, 0.52)},
    ],
    "luxe": [
        {"img": LUX + "flatlay.png", "dur": 4.6, "focus": (0.5, 0.5), "zoom": (1.0, 1.05), "mfocus": (0.68, 0.5)},
        {"img": LUX + "scrubs.png", "dur": 4.6, "focus": (0.7, 0.52), "zoom": (1.05, 1.0)},
        {"img": LUX + "oil.png", "dur": 4.6, "focus": (0.65, 0.48), "zoom": (1.0, 1.05), "sweep": True},
        {"img": LUX + "candle.png", "dur": 4.6, "focus": (0.63, 0.5), "zoom": (1.05, 1.0),
         "flicker": [(0.638, 0.256, 0.04)]},
    ],
    "gifts": [
        {"img": LUX + "box.png", "dur": 4.6, "focus": (0.65, 0.5), "zoom": (1.0, 1.05), "sweep": True},
        {"img": "../../../public/images/site/hero-corporate.webp", "dur": 4.6, "focus": (0.6, 0.55),
         "zoom": (1.05, 1.0), "mfocus": (0.68, 0.55)},
        {"img": "../../../public/images/products/festive-orders-production-table.webp", "dur": 4.6,
         "focus": (0.5, 0.5), "zoom": (1.0, 1.04)},
        {"img": LUX + "group.png", "dur": 4.6, "focus": (0.62, 0.52), "zoom": (1.04, 1.0), "mfocus": (0.76, 0.5)},
    ],

}


def smooth(t):
    t = float(np.clip(t, 0, 1))
    return t * t * (3 - 2 * t)


def load(path):
    from PIL import Image
    return cv2.cvtColor(np.array(Image.open(RAW / path).convert("RGB")), cv2.COLOR_RGB2BGR)


def camera(src, focus, zoom, t, size):
    z0, z1 = zoom
    z = float(np.exp(np.log(z0) + (np.log(z1) - np.log(z0)) * t))  # constant apparent speed
    H, W = src.shape[:2]
    ow, oh = size
    cw = min(W, H * ow / oh) / z
    ch = cw * oh / ow
    x = np.clip(focus[0] * W - cw / 2, 0, W - cw)
    y = np.clip(focus[1] * H - ch / 2, 0, H - ch)
    s = ow / cw
    M = np.float32([[s, 0, -x * s], [0, s, -y * s]])
    out = cv2.warpAffine(src, M, size, flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    return out, M


def noise1(seed, t):
    """Smooth 1-D noise in about -1..1."""
    return (np.sin(t * 7.1 + seed) * 0.5 + np.sin(t * 13.3 + seed * 2.3) * 0.3 + np.sin(t * 23.7 + seed * 4.1) * 0.2)


class Haze:
    def __init__(self, size, seed=3):
        rng = np.random.default_rng(seed)
        w, h = size
        n = rng.random((h * 2 // 8, w // 8)).astype(np.float32)
        n = cv2.resize(n, (w, h * 2), interpolation=cv2.INTER_CUBIC)
        self.field = cv2.GaussianBlur(n, (0, 0), 18)
        self.field = (self.field - self.field.min()) / (np.ptp(self.field) + 1e-6)

    def frame(self, t, h):
        off = int((t * 60) % h)
        return self.field[off:off + h]


def apply_fx(img, shot, local, M, src_shape, haze):
    out = img.astype(np.float32)
    H_, W_ = img.shape[:2]
    Hs, Ws = src_shape[:2]
    to_out = lambda fx, fy: M @ np.array([fx * Ws, fy * Hs, 1.0])
    yy, xx = np.mgrid[0:H_, 0:W_].astype(np.float32)
    for k, (fx, fy, r) in enumerate(shot.get("flicker", [])):
        cx, cy = to_out(fx, fy)
        rad = r * Ws * M[0, 0]
        g = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * rad * rad)))
        amt = 0.10 + 0.07 * noise1(k * 1.7, local)
        out *= (1 + amt * g)[:, :, None]
    for (x0, y0, x1, y1, a) in shot.get("haze", []):
        p0, p1 = to_out(x0, y0), to_out(x1, y1)
        reg = np.zeros((H_, W_), np.float32)
        reg[int(max(0, p0[1])):int(min(H_, p1[1])), int(max(0, p0[0])):int(min(W_, p1[0]))] = 1
        reg = cv2.GaussianBlur(reg, (0, 0), 40)
        f = haze.frame(local, H_)
        out += (255 * a * f * reg)[:, :, None]
    if shot.get("sweep"):
        pos = -0.3 + 1.6 * smooth(local / shot["dur"])
        d = (xx / W_ + 0.35 * yy / H_) / 1.35 - pos
        band = np.exp(-(d / 0.08) ** 2)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
        warm = np.clip((lab[:, :, 0] - 110) / 80, 0, 1) * np.clip((lab[:, :, 2] - 140) / 30, 0, 1)
        out *= (1 + 0.3 * band * warm)[:, :, None]
    return np.clip(out, 0, 255).astype(np.uint8)


class Pattern:
    """Gold monograms and lotuses appearing on chocolate, drifting slowly."""

    def __init__(self, size):
        w, h = size
        rows = 4 if w > h else 6
        self.cell = h / rows
        mono = bf.load_mask("monogram")
        lot = lotus_mask()
        self.sprites = []
        rng = np.random.default_rng(5)
        cols = int(np.ceil(w / self.cell)) + 2
        for r in range(rows):
            for c in range(cols):
                kind = (r + c) % 2
                m = mono if kind == 0 else lot
                sw = self.cell * (0.42 if kind == 0 else 0.46)
                a = cv2.resize(m, (int(sw), int(sw * m.shape[0] / m.shape[1])), interpolation=cv2.INTER_AREA)
                self.sprites.append((c, r, a, rng.uniform(0, 1.6), rng.uniform(0.35, 1.0)))
        self.size = size

    def frame(self, t, dur):
        w, h = self.size
        A = np.zeros((h, w), np.float32)
        drift = -self.cell * 0.4 * (t / dur)
        for c, r, a, delay, peak in self.sprites:
            v = smooth((t - delay) / 0.7) * peak
            if v <= 0:
                continue
            cx = (c - 0.5) * self.cell + drift
            cy = (r + 0.5) * self.cell
            x0, y0 = int(cx - a.shape[1] / 2), int(cy - a.shape[0] / 2)
            xa, ya = max(0, x0), max(0, y0)
            xb, yb = min(w, x0 + a.shape[1]), min(h, y0 + a.shape[0])
            if xb <= xa or yb <= ya:
                continue
            A[ya:yb, xa:xb] = np.maximum(A[ya:yb, xa:xb], a[ya - y0:yb - y0, xa - x0:xb - x0] * v)
        yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
        shimmer = 1 + 0.12 * np.sin(6.0 * yy + t * 1.4)
        bg = np.ones((h, w, 3), np.float32) * CHOC
        vign = np.exp(-(((np.linspace(-1, 1, w)[None, :]) ** 2) * 0.6 + ((np.linspace(-1, 1, h)[:, None]) ** 2) * 0.9))
        bg *= (0.7 + 0.5 * vign)[:, :, None]
        out = bg * (1 - A[:, :, None]) + (GOLD * shimmer[:, :, None]) * A[:, :, None]
        return np.clip(out, 0, 255).astype(np.uint8)


def endcard(src, shot, local, size):
    img, _ = camera(src, shot["focus"], (1.06, 1.0), local / shot["dur"], size)
    img = (cv2.GaussianBlur(img, (0, 0), 3).astype(np.float32) * 0.32).astype(np.uint8)
    w, h = size
    lw = int(min(w * 0.22, h * 0.55))
    lock = bf.load_mask("lockup")
    a = cv2.resize(lock, (lw, int(lw * lock.shape[0] / lock.shape[1])), interpolation=cv2.INTER_AREA)
    v = smooth((local - 0.5) / 1.4)
    s = 0.96 + 0.04 * v
    a = cv2.resize(a, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    A = np.zeros((h, w), np.float32)
    y0, x0 = (h - a.shape[0]) // 2, (w - a.shape[1]) // 2
    A[y0:y0 + a.shape[0], x0:x0 + a.shape[1]] = a * v
    out = img.astype(np.float32) * (1 - A[:, :, None]) + GOLD * A[:, :, None]
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    film, kind, out = sys.argv[1], sys.argv[2], sys.argv[3]
    preview = "--preview" in sys.argv
    size = SIZES[film][kind]
    fps = 10 if preview else FPS
    if preview:
        size = (size[0] // 2, size[1] // 2)
    shots = FILMS[film]
    stills = [load(s["img"]) if "img" in s else (load(s["endcard"]) if "endcard" in s else None) for s in shots]
    if preview:
        stills = [cv2.resize(x, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA) if x is not None else None for x in stills]
    starts, t = [], 0.0
    for s in shots:
        starts.append(t)
        t += s["dur"] - XFADE
    total = t
    pattern = Pattern(size)
    haze = Haze(size)
    sharpen = lambda im: cv2.addWeighted(im, 1.12, cv2.GaussianBlur(im, (0, 0), 1.0), -0.12, 0)
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{size[0]}x{size[1]}",
           "-r", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "23", "-pix_fmt", "yuv420p",
           "-profile:v", "high", "-movflags", "+faststart", "-g", str(fps * 2), "-an", out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int(round(total * fps))
    for k in range(n):
        ts = k / fps
        layers = []
        for i, s in enumerate(shots):
            local = (ts - starts[i]) % total
            if local < s["dur"]:
                layers.append((i, local))
        layers.sort(key=lambda p: -p[1])
        frame = None
        for i, local in layers:
            s = shots[i]
            if s.get("pattern"):
                img = pattern.frame(local, s["dur"])
            elif "endcard" in s:
                img = endcard(stills[i], s, local, size)
            else:
                focus = s.get("mfocus", s["focus"]) if kind == "mobile" else s["focus"]
                img, M = camera(stills[i], focus, s["zoom"], local / s["dur"], size)
                img = sharpen(img)
                img = apply_fx(img, s, local, M, stills[i].shape, haze)
            if frame is None:
                frame = img
            else:
                a = smooth(local / XFADE)
                frame = cv2.addWeighted(frame, 1 - a, img, a, 0)
        ff.stdin.write(frame.tobytes())
    ff.stdin.close()
    ff.wait()
    print(f"{out}: {total:.1f}s, {n} frames, {size[0]}x{size[1]}")


if __name__ == "__main__":
    main()
