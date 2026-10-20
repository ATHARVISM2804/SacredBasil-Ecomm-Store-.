"""Build the hero film from the brand-corrected key frames.

Usage: python build_hero.py desktop|mobile <out.mp4> [--preview]

Each shot is one still (docs/hero-film/luxe/<frames>/F1..F8.png) with a single
slow camera move at constant speed, so the logo and labels stay exactly as
corrected in every frame. Shots overlap by XFADE seconds and the last shot
dissolves back into the first, so the file loops without a cut.
"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
FPS = 30
SHOT = 5.0     # seconds each still is on screen (including both dissolves)
XFADE = 1.2    # dissolve length; shots start every SHOT - XFADE seconds
STEP = SHOT - XFADE

# Camera per shot: (zoom_start, zoom_end, (cx0, cy0), (cx1, cy1)) with the
# centre in 0..1 of the frame. Pushes and pans alternate so consecutive
# shots never move the same way.
MOVES = {
    "desktop": [
        (1.00, 1.06, (0.50, 0.52), (0.55, 0.54)),   # F1 empty plinth: drift towards where the box lands
        (1.02, 1.09, (0.56, 0.42), (0.58, 0.38)),   # F2 box arrives: push in on the lid
        (1.10, 1.10, (0.44, 0.47), (0.56, 0.45)),   # F3 foil close-up: slow lateral glide
        (1.00, 1.07, (0.60, 0.50), (0.60, 0.56)),   # F4 open box: push in towards the products
        (1.09, 1.09, (0.56, 0.52), (0.46, 0.52)),   # F5 scrubs: glide right to left
        (1.00, 1.07, (0.52, 0.52), (0.52, 0.50)),   # F6 oil + soap: push in
        (1.08, 1.01, (0.55, 0.50), (0.52, 0.52)),   # F7 candle: gentle pull back
        (1.00, 1.05, (0.62, 0.50), (0.62, 0.48)),   # F8 final group: slow settle
    ],
    "mobile": [
        (1.00, 1.06, (0.50, 0.62), (0.50, 0.60)),
        (1.02, 1.09, (0.50, 0.60), (0.50, 0.58)),
        (1.10, 1.10, (0.44, 0.62), (0.56, 0.60)),
        (1.00, 1.07, (0.50, 0.62), (0.50, 0.65)),
        (1.09, 1.09, (0.56, 0.64), (0.44, 0.64)),
        (1.00, 1.07, (0.50, 0.64), (0.50, 0.62)),
        (1.08, 1.01, (0.50, 0.62), (0.50, 0.62)),
        (1.00, 1.05, (0.50, 0.62), (0.50, 0.60)),
    ],
}
SIZE = {"desktop": (1600, 900), "mobile": (720, 1280)}
FRAMES = {"desktop": "frames-fixed", "mobile": "mobile-frames-fixed"}
SWEEP_SHOT = 2  # F3: a soft band of light travels across the gold foil


def smooth(t):
    return t * t * (3 - 2 * t)


def render_shot(src, move, t, size):
    """Frame of a shot at progress t (0..1). Zoom is interpolated in log
    space so its apparent speed is constant."""
    z0, z1, c0, c1 = move
    z = float(np.exp(np.log(z0) + (np.log(z1) - np.log(z0)) * t))
    cx = c0[0] + (c1[0] - c0[0]) * t
    cy = c0[1] + (c1[1] - c0[1]) * t
    H, W = src.shape[:2]
    ow, oh = size
    # Largest crop of the output aspect that fits the source, divided by zoom.
    cw = min(W, H * ow / oh) / z
    ch = cw * oh / ow
    # Keep the crop inside the frame.
    x = np.clip(cx * W - cw / 2, 0, W - cw)
    y = np.clip(cy * H - ch / 2, 0, H - ch)
    s = ow / cw
    M = np.float32([[s, 0, -x * s], [0, s, -y * s]])
    return cv2.warpAffine(src, M, size, flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)


def sweep(frame, t):
    """Light sweep: a soft diagonal band, applied only where the image is
    already bright and warm (the foil), so paper and shadows don't glow."""
    h, w = frame.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    pos = -0.3 + 1.6 * smooth(t)
    d = (xx / w + 0.35 * yy / h) / 1.35 - pos
    band = np.exp(-(d / 0.07) ** 2)
    f = frame.astype(np.float32)
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB).astype(np.float32)
    foil = np.clip((lab[:, :, 0] - 120) / 80, 0, 1) * np.clip((lab[:, :, 2] - 140) / 30, 0, 1)
    gain = 1 + 0.35 * (band * foil)[:, :, None]
    return np.clip(f * gain, 0, 255).astype(np.uint8)


def main():
    kind, out = sys.argv[1], sys.argv[2]
    preview = "--preview" in sys.argv
    size = SIZE[kind]
    folder = ROOT / "docs/hero-film/luxe" / FRAMES[kind]
    stills = [cv2.imread(str(folder / f"F{i}.png")) for i in range(1, 9)]
    moves = MOVES[kind]
    n = len(stills)
    total = n * STEP                      # loop length
    nframes = int(round(total * FPS))
    fps = FPS if not preview else 10
    if preview:
        size = (size[0] // 2, size[1] // 2)
        nframes = int(round(total * fps))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
           "-s", f"{size[0]}x{size[1]}", "-r", str(fps), "-i", "-",
           "-c:v", "libx264", "-preset", "slow", "-crf", "24" if kind == "desktop" else "25",
           "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart",
           "-g", str(fps * 2), "-an", out]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k in range(nframes):
        tsec = k / fps
        # Shot i covers [i*STEP, i*STEP + SHOT); the last one wraps to 0.
        layers = []
        for i in range(n):
            start = i * STEP
            local = (tsec - start) % total
            if local < SHOT:
                layers.append((i, local))
        layers.sort(key=lambda p: -p[1])  # older shot first, newer on top
        frame = None
        for i, local in layers:
            img = render_shot(stills[i], moves[i], local / SHOT, size)
            if i == SWEEP_SHOT:
                img = sweep(img, np.clip((local - XFADE) / (SHOT - 2 * XFADE), 0, 1))
            if frame is None:
                frame = img
            else:
                a = smooth(min(1.0, local / XFADE))
                frame = cv2.addWeighted(frame, 1 - a, img, a, 0)
        ff.stdin.write(frame.tobytes())
    ff.stdin.close()
    ff.wait()
    print(f"{out}: {total:.1f}s loop, chapters at", [round(i * STEP + XFADE / 2, 2) for i in range(n)])


if __name__ == "__main__":
    main()
