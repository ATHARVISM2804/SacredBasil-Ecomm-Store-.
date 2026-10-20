"""Helper A extras on top of brandfix: a `clone` op.

Usage: python extra_a.py <jobs.json> [name ...]

Same job format as brandfix.py, plus:
  clone {box:[x0,y0,x1,y1] | poly:[[x,y],...], from:[dx,dy], feather}
        Replaces the box with pixels copied from (x+dx, y+dy), feathered.
        For repairing blemishes on patterned surfaces (linen, stone).
  colfill {box, strip:[y0,y1], side:[x0,x1], texbox, grain, feather}
        Repaints a label area on a cylinder from a clean row strip, shaded
        row by row like a clean side band.
  hfill {box, feather}
        Interpolates each row across the box from its left/right neighbours.
  These three run before the brandfix ops.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

import brandfix


def clone(img, op):
    dx, dy = op["from"]
    src = np.roll(img, (-dy, -dx), (0, 1)).astype(np.float32)
    m = np.zeros(img.shape[:2], np.float32)
    if "poly" in op:
        cv2.fillPoly(m, [np.int32(op["poly"])], 1)
    else:
        x0, y0, x1, y1 = op["box"]
        m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), op.get("feather", 3))[:, :, None]
    img[:] = np.clip(img * (1 - m) + src * m, 0, 255).astype(np.uint8)


def colfill(img, op):
    """Repaint a label area on a cylinder: colour per column from a clean
    strip of rows (`strip`:[y0,y1]), scaled row by row by the brightness of a
    clean side band (`side`:[x0,x1]), plus quilted grain from `texbox`."""
    x0, y0, x1, y1 = op["box"]
    s0, s1 = op["strip"]
    f = img.astype(np.float32)
    prof = np.median(f[s0:s1, x0:x1], axis=0)  # (w,3)
    a0, a1 = op["side"]
    # One brightness gain per row (per-channel ratios are noisy on dark labels).
    side = f[:, a0:a1].mean((1, 2))
    ref = side[s0:s1].mean()
    rows = np.arange(y0, y1)
    gain = np.clip(side[rows] / max(ref, 1), 0.8, 1.2).astype(np.float32)
    gain = cv2.GaussianBlur(gain.reshape(-1, 1), (1, 0), sigmaX=1e-3, sigmaY=op.get("gain_blur", 2)).reshape(-1)
    fill = prof[None, :, :] * gain[:, None, None]
    if "texbox" in op:
        fill = fill + brandfix.quilt(img, op["texbox"], fill.shape[:2], op.get("patch", 12)) * op.get("grain", 0.7)
    m = np.zeros(img.shape[:2], np.float32)
    m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), op.get("feather", 1.5))
    full = f.copy()
    full[y0:y1, x0:x1] = fill
    out = f * (1 - m[:, :, None]) + full * m[:, :, None]
    img[:] = np.clip(out, 0, 255).astype(np.uint8)


def hfill(img, op):
    """Fill a narrow box by interpolating each row between the columns just
    outside it (keeps near-horizontal lines like glass rims continuous)."""
    x0, y0, x1, y1 = op["box"]
    f = img.astype(np.float32)
    L = f[y0:y1, x0 - 2:x0].mean(1)
    R = f[y0:y1, x1:x1 + 2].mean(1)
    t = np.linspace(0, 1, x1 - x0)[None, :, None]
    fill = L[:, None, :] * (1 - t) + R[:, None, :] * t
    m = np.zeros(img.shape[:2], np.float32)
    m[y0:y1, x0:x1] = 1
    m = cv2.GaussianBlur(m, (0, 0), op.get("feather", 1.0))
    full = f.copy()
    full[y0:y1, x0:x1] = fill
    img[:] = np.clip(f * (1 - m[:, :, None]) + full * m[:, :, None], 0, 255).astype(np.uint8)


PRE = {"clone": clone, "colfill": colfill, "hfill": hfill}
_run_ops = brandfix.run


def run(job):
    clones = [op for op in job["ops"] if op["op"] in PRE]
    if not clones:
        return _run_ops(job)
    # Apply clones first on a temp copy, then hand the rest to brandfix.
    img = cv2.imread(str(brandfix.ROOT / job["src"]), cv2.IMREAD_COLOR)
    for op in clones:
        PRE[op["op"]](img, op)
    tmp = Path(__file__).resolve().parent / f".extra_a_{job['name']}.png"
    cv2.imwrite(str(tmp), img)
    rest = dict(job, src=str(tmp), ops=[op for op in job["ops"] if op["op"] not in PRE])
    before_src = job["src"]
    _run_ops(rest)
    tmp.unlink()
    return before_src


if __name__ == "__main__":
    jobs = json.loads(Path(sys.argv[1]).read_text())
    names = set(sys.argv[2:])
    for j in jobs:
        if not names or j["name"] in names:
            run(j)
