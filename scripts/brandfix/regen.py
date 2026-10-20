"""Finish the ChatGPT blank-label images: align each one back to its original
frame, then print the official logo (and any label text) exactly where the
existing jobs place it. No erase ops run: ChatGPT has already removed the old
marks, so the surface stays untouched apart from the new print.

Usage: python regen.py [NN-name ...]     (default: everything in incoming/)

Reads docs/regen/incoming/NN-<name>.png, matches <name> to its job in
jobs-a/b/c.json, writes the job's `out` (public/images/...) and a
before/after preview to docs/regen/preview/.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import brandfix as bf
import extra_b

HERE = Path(__file__).resolve().parent
REGEN = bf.ROOT / "docs/regen"
PRINT_OPS = {"logo", "clogo", "text", "utext"}


def jobs_by_name():
    out = {}
    for f in ("jobs-a.json", "jobs-b.json", "jobs-c.json"):
        for j in json.loads((HERE / f).read_text()):
            out[Path(j["out"]).stem] = j
    return out


def align(img, ref):
    """Warp `img` onto `ref`'s frame: ORB features + RANSAC homography,
    refined with ECC. Falls back to a plain resize if matching fails."""
    h, w = ref.shape[:2]
    g1 = cv2.cvtColor(cv2.resize(img, (w, int(img.shape[0] * w / img.shape[1]))), cv2.COLOR_BGR2GRAY)
    s = w / img.shape[1]
    g2 = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
    orb = cv2.ORB_create(6000)
    k1, d1 = orb.detectAndCompute(g1, None)
    k2, d2 = orb.detectAndCompute(g2, None)
    H = None
    if d1 is not None and d2 is not None:
        m = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2)
        m = sorted(m, key=lambda x: x.distance)[:1500]
        if len(m) >= 30:
            p1 = np.float32([k1[x.queryIdx].pt for x in m])
            p2 = np.float32([k2[x.trainIdx].pt for x in m])
            H, inl = cv2.findHomography(p1, p2, cv2.RANSAC, 3.0)
            if H is not None and inl.sum() < 25:
                H = None
    if H is None:
        print("  ! feature match failed, resizing only")
        return cv2.resize(img, (w, h), interpolation=cv2.INTER_LANCZOS4), 0.0
    S = np.diag([s, s, 1.0])
    out = cv2.warpPerspective(img, H @ S, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    cover = cv2.warpPerspective(np.ones(g1.shape, np.uint8), H, (w, h)).mean()
    if cover < 0.995:
        print(f"  ! ChatGPT's image covers only {cover:.1%} of the original frame; edges are padded, check them")
    # Report alignment quality: median edge offset via ECC on a downscale.
    try:
        warp = np.eye(2, 3, dtype=np.float32)
        a = cv2.resize(cv2.cvtColor(out, cv2.COLOR_BGR2GRAY), (w // 2, h // 2)).astype(np.float32)
        b = cv2.resize(g2, (w // 2, h // 2)).astype(np.float32)
        cc, warp = cv2.findTransformECC(b, a, warp, cv2.MOTION_TRANSLATION,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 100, 1e-5), None, 5)
        shift = 2 * np.hypot(warp[0, 2], warp[1, 2])
        if shift > 0.3:
            M = np.float32([[1, 0, -2 * warp[0, 2]], [0, 1, -2 * warp[1, 2]]])
            out = cv2.warpAffine(out, M, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    except cv2.error:
        cc = 0.0
    return out, cc


def finish(path, job):
    ref = cv2.cvtColor(np.array(Image.open(bf.ROOT / job["src"]).convert("RGB")), cv2.COLOR_RGB2BGR)
    new = cv2.imread(str(path), cv2.IMREAD_COLOR)
    img, cc = align(new, ref)
    print(f"{path.name}: aligned (ECC {cc:.3f})")
    for op in job["ops"]:
        if op["op"] not in PRINT_OPS:
            continue
        {"logo": bf.logo, "text": bf.text, "clogo": extra_b.clogo, "utext": extra_b.utext}[op["op"]](img, op)
    out = bf.ROOT / job["out"]
    Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).save(out, quality=job.get("quality", 88), method=6)
    prev = REGEN / "preview" / f"{path.stem}.jpg"
    prev.parent.mkdir(exist_ok=True)
    pair = np.hstack([ref, np.full((ref.shape[0], 8, 3), 255, np.uint8), img])
    z = min(1.0, 2400 / pair.shape[1])
    cv2.imwrite(str(prev), cv2.resize(pair, None, fx=z, fy=z, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("  wrote", job["out"])


def main():
    jobs = jobs_by_name()
    files = sorted((REGEN / "incoming").glob("*.png")) + sorted((REGEN / "incoming").glob("*.jp*g")) + \
        sorted((REGEN / "incoming").glob("*.webp"))
    want = set(sys.argv[1:])
    for p in files:
        if want and p.stem not in want:
            continue
        name = p.stem.split("-", 1)[1]
        if name not in jobs:
            print("no job for", p.name)
            continue
        finish(p, jobs[name])


if __name__ == "__main__":
    main()
