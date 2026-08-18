#!/usr/bin/env python3
"""Cut and crush the painted target-look drawings into art/bay.png."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
SRC = Path("/opt/cursor/artifacts/assets")
OLD = ART / "bay.png"
OLD_ATLAS = ART / "atlas.json"


def flood_key(im: Image.Image, max_dist=38, grow=2):
    """Remove background by flooding from the edges. Keeps interior teal clothes."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    samples = [
        px[2, 2][:3], px[w - 3, 2][:3], px[2, h - 3][:3], px[w - 3, h - 3][:3],
        px[w // 2, 2][:3], px[2, h // 2][:3],
    ]
    bg = tuple(sum(s[i] for s in samples) // len(samples) for i in range(3))

    def close(c):
        return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) <= max_dist

    seen = [[False] * h for _ in range(w)]
    stack = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))
    kill = []
    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or seen[x][y]:
            continue
        seen[x][y] = True
        r, g, b, a = px[x, y]
        if a < 8 or close((r, g, b)):
            kill.append((x, y))
            stack.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    for x, y in kill:
        px[x, y] = (0, 0, 0, 0)
    if grow:
        mask = Image.new("L", (w, h), 0)
        mp = mask.load()
        for x, y in kill:
            mp[x, y] = 255
        mask = mask.filter(ImageFilter.MaxFilter(grow * 2 + 1))
        mp = mask.load()
        for y in range(h):
            for x in range(w):
                if mp[x, y] > 180 and close(px[x, y][:3]):
                    r, g, b, a = px[x, y]
                    px[x, y] = (r, g, b, 0)
    return im


def autocrop(im: Image.Image, pad=6):
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def fit(im: Image.Image, w, h):
    im = autocrop(im)
    src = im.copy()
    src.thumbnail((w - 4, h - 4), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(src, ((w - src.width) // 2, h - src.height - 2), src)
    return out


def fit_center(im: Image.Image, w, h):
    im = autocrop(im)
    src = im.copy()
    src.thumbnail((w - 4, h - 4), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(src, ((w - src.width) // 2, (h - src.height) // 2), src)
    return out


def cut_animals(path: Path):
    sheet = flood_key(Image.open(path), max_dist=48, grow=1)
    w, h = sheet.size
    cells = []
    cw, ch = w / 4, h / 4
    order = [
        (0, 0), (1, 0), (2, 0), (3, 0),
        (0, 1), (1, 1), (2, 1), (3, 1),
        (0, 2), (1, 2), (2, 2), (3, 2),
        (1.5, 3),
    ]
    for col, row in order:
        x0 = int(col * cw) + 4
        y0 = int(row * ch) + 4
        x1 = int((col + 1) * cw) - 4
        y1 = int((row + 1) * ch) - 4
        if col == 1.5:
            x0 = int(1.15 * cw)
            x1 = int(2.85 * cw)
            y0 = int(3 * ch) + 2
            y1 = h - 4
        cell = autocrop(sheet.crop((x0, y0, x1, y1)), 2)
        cells.append(fit_center(cell, 112, 72))
    return cells


def crush_rgb(im: Image.Image, colors=180):
    """Quantize an opaque painting to keep the sheet small."""
    rgb = im.convert("RGB")
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    return q.convert("RGBA")


def patch_atlas(atlas):
    js_path = ROOT / "game.js"
    js = js_path.read_text()
    blob = json.dumps(atlas, separators=(",", ":"))
    nxt, n = re.subn(r"const ATLAS = \{.*?\};", "const ATLAS = " + blob + ";", js, count=1)
    if n != 1:
        raise SystemExit("could not patch ATLAS in game.js")
    js_path.write_text(nxt)


def main():
    ART.mkdir(exist_ok=True)
    atlas = {}
    items = []

    def add(name, img, ax=None, ay=None):
        items.append((name, img, ax, ay))

    for skin in ("skip", "reef", "dino"):
        stand = fit(flood_key(Image.open(SRC / f"{skin}-stand.png")), 128, 176)
        walk = fit(flood_key(Image.open(SRC / f"{skin}-walk.png")), 128, 176)
        dive = fit_center(flood_key(Image.open(SRC / f"{skin}-dive.png"), max_dist=42), 176, 96)
        add(f"{skin}_stand", stand, 64, 168)
        add(f"{skin}_walk", walk, 64, 168)
        add(f"{skin}_dive", dive, 96, 48)

    for i, cell in enumerate(cut_animals(SRC / "animals-sheet.png")):
        add(f"fish{i}", cell, 62, 36)

    harbor_src = Image.open(SRC / "harbor.png").convert("RGBA")
    harbor = crush_rgb(harbor_src.copy(), 140)
    harbor.thumbnail((480, 270), Image.Resampling.LANCZOS)
    add("harbor", harbor, harbor.width / 2, harbor.height * 0.72)

    plank = crush_rgb(harbor_src.crop((180, 820, 820, 1000)), 64)
    plank = plank.resize((256, 56), Image.Resampling.LANCZOS)
    add("plank", plank, 128, 28)

    people = ("maya", "nico", "jun", "cashier", "vip", "kid",
              "g0", "g1", "g2", "g3", "g4", "g5")
    for name in people:
        src = SRC / f"{name}-stand.png"
        if not src.exists():
            continue
        add(name, fit(flood_key(Image.open(src), max_dist=42), 96, 140), 48, 132)

    if OLD.exists() and OLD_ATLAS.exists():
        old = Image.open(OLD).convert("RGBA")
        old_at = json.loads(OLD_ATLAS.read_text())
        for name in ("post", "crown", "shades"):
            c = old_at.get(name)
            if not c:
                continue
            crop = old.crop((c["x"], c["y"], c["x"] + c["w"], c["y"] + c["h"]))
            add(name, crop, c.get("ax", c["w"] / 2), c.get("ay", c["h"] * 0.85))

    pad = 2
    x = y = pad
    row_h = 0
    max_w = 1480
    for name, img, ax, ay in items:
        if x + img.width + pad > max_w:
            x = pad
            y += row_h
            row_h = 0
        x += img.width + pad
        row_h = max(row_h, img.height + pad)
    sheet_h = y + row_h + pad
    sheet = Image.new("RGBA", (max_w, sheet_h), (0, 0, 0, 0))
    x = y = pad
    row_h = 0
    for name, img, ax, ay in items:
        if x + img.width + pad > max_w:
            x = pad
            y += row_h
            row_h = 0
        sheet.paste(img, (x, y), img)
        atlas[name] = {
            "x": x, "y": y, "w": img.width, "h": img.height,
            "ax": ax if ax is not None else img.width / 2,
            "ay": ay if ay is not None else img.height * 0.72,
        }
        x += img.width + pad
        row_h = max(row_h, img.height + pad)

    bbox = sheet.getbbox()
    if bbox:
        sheet = sheet.crop((0, 0, min(max_w, bbox[2] + 4), min(sheet_h, bbox[3] + 4)))
    out = ART / "bay.png"
    sheet.save(out, "PNG", optimize=True)
    (ART / "atlas.json").write_text(json.dumps(atlas, indent=2))
    patch_atlas(atlas)
    print(f"wrote {out} {out.stat().st_size} bytes {sheet.size} cells={len(atlas)}")


if __name__ == "__main__":
    main()
