"""Print crisp label artwork on 2x-upscaled generated photographs.

Usage: python print2x.py <specs.json> [name ...]

Specs give each label's approximate box in ORIGINAL (1x) pixels; this script
works on the <name>@2x.png upscale, snaps every box to the label's exact
edges (refine), then prints with packlabel at full 2x resolution, so the
logo and product name are sharp vector art even after film zooms.
Each label: {approx:[x0,y0,x1,y1], tone:"dark"|"light", shape, art, quad?, inset, arc, sag}
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import brandfix as bf
import packlabel as pl

S = 2


def refine(img, approx, tone):
    """Exact label rectangle near `approx` (2x pixels)."""
    x0, y0, x1, y1 = [int(v * S) for v in approx]
    w, h = x1 - x0, y1 - y0
    X0, Y0 = max(0, x0 - w // 4), max(0, y0 - h // 4)
    X1, Y1 = min(img.shape[1], x1 + w // 4), min(img.shape[0], y1 + h // 4)
    L = bf.lum(img[Y0:Y1, X0:X1])
    inner = L[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
    ref = np.median(inner)
    tol = 22
    m = (np.abs(L - ref) < tol).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    cy, cx = (y0 + y1) // 2 - Y0, (x0 + x1) // 2 - X0
    i = lab[cy, cx]
    if i == 0:
        return [x0, y0, x1, y1]
    comp = lab == i
    rows = comp.sum(1)
    cols = comp.sum(0)
    ry = np.nonzero(rows > 0.6 * rows.max())[0]
    rx = np.nonzero(cols > 0.6 * cols.max())[0]
    box = [X0 + rx[0], Y0 + ry[0], X0 + rx[-1] + 1, Y0 + ry[-1] + 1]
    # Guard: refine must stay close to the approximate box.
    if abs((box[2] - box[0]) - w) > 0.35 * w or abs((box[3] - box[1]) - h) > 0.35 * h:
        return [x0, y0, x1, y1]
    return box


def run(spec):
    src = bf.ROOT / spec["src"]
    img = cv2.imread(str(src.with_name(src.stem + "@2x.png")))
    for l in spec["labels"]:
        lab = {k: v for k, v in l.items() if k not in ("approx", "art", "quad", "edge")}
        if "quad" in l:
            lab["quad"] = [[x * S, y * S] for x, y in l["quad"]]
        else:
            box = refine(img, l["approx"], l.get("tone", "dark"))
            e = l.get("edge", 2)
            lab["box"] = [box[0] + e, box[1] + e, box[2] - e, box[3] - e]
            if "sag" in lab:
                lab["sag"] *= S
        art = dict(l["art"])
        pl.print_label(img, {"label": lab, "art": art})
        print(f"  {spec['name']}: {art.get('name', 'lockup')!r} -> {lab.get('box', 'quad')}")
    out = bf.ROOT / spec["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), img)


if __name__ == "__main__":
    specs = json.loads(Path(sys.argv[1]).read_text())
    names = set(sys.argv[2:])
    for s in specs:
        if not names or s["name"] in names:
            run(s)
