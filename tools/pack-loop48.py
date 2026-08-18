#!/usr/bin/env python3
"""Loop 48 reshoot: crush newly invented drawings into art/bay.png."""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
SRC = Path("/opt/cursor/artifacts/assets")


def shrink(im: Image.Image, max_side=420):
    im = im.convert("RGBA")
    w, h = im.size
    m = max(w, h)
    if m > max_side:
        im = im.copy()
        im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    return im


def flood_key(im: Image.Image, max_dist=42, grow=2, max_side=520):
    im = shrink(im, max_side)
    w, h = im.size
    px = im.load()
    samples = [
        px[2, 2][:3], px[w - 3, 2][:3], px[2, h - 3][:3], px[w - 3, h - 3][:3],
        px[w // 2, 2][:3], px[2, h // 2][:3], px[w - 3, h // 2][:3],
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


def fit_bottom(im: Image.Image, w, h):
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


def crush_rgb(im: Image.Image, colors=160):
    rgb = im.convert("RGB")
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    return q.convert("RGBA")


def cut_grid(path: Path, cols, rows, picks, tw, th, center=True, pad=4, dist=48, max_side=800):
    sheet = flood_key(Image.open(path), max_dist=dist, grow=1, max_side=max_side)
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    cells = []
    for col, row in picks:
        x0 = int(col * cw) + pad
        y0 = int(row * ch) + pad
        x1 = int((col + 1) * cw) - pad
        y1 = int((row + 1) * ch) - pad
        cell = autocrop(sheet.crop((x0, y0, x1, y1)), 2)
        cells.append(fit_center(cell, tw, th) if center else fit_bottom(cell, tw, th))
    return cells


def cut_row(path: Path, n, tw, th, dist=42, max_side=800):
    sheet = flood_key(Image.open(path), max_dist=dist, grow=1, max_side=max_side)
    w, h = sheet.size
    # drop the painted dock strip so feet stay readable
    y1 = int(h * 0.88)
    cells = []
    cw = w / n
    for i in range(n):
        x0 = int(i * cw) + 6
        x1 = int((i + 1) * cw) - 6
        cell = autocrop(sheet.crop((x0, int(h * 0.04), x1, y1)), 3)
        cells.append(fit_bottom(cell, tw, th))
    return cells


def paint_crown():
    im = Image.new("RGBA", (40, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(4, 22), (6, 6), (14, 14), (20, 4), (26, 14), (34, 6), (36, 22)], fill=(255, 210, 74, 255), outline=(48, 28, 12, 255))
    d.rectangle([4, 20, 36, 28], fill=(232, 176, 48, 255), outline=(48, 28, 12, 255))
    d.ellipse([17, 3, 23, 9], fill=(232, 93, 76, 255), outline=(48, 28, 12, 255))
    d.ellipse([10, 16, 15, 20], fill=(255, 246, 232, 180))
    return im


def paint_shades():
    im = Image.new("RGBA", (40, 20), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([2, 4, 18, 16], radius=4, fill=(28, 36, 52, 255), outline=(16, 12, 10, 255))
    d.rounded_rectangle([22, 4, 38, 16], radius=4, fill=(28, 36, 52, 255), outline=(16, 12, 10, 255))
    d.line([(18, 8), (22, 8)], fill=(16, 12, 10, 255), width=2)
    d.rectangle([4, 6, 12, 10], fill=(90, 140, 170, 90))
    d.rectangle([24, 6, 32, 10], fill=(90, 140, 170, 90))
    return im


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
        stand = fit_bottom(flood_key(Image.open(SRC / f"{skin}-stand.png"), 40, 2), 128, 176)
        walk = fit_bottom(flood_key(Image.open(SRC / f"{skin}-walk.png"), 40, 2), 128, 176)
        dive = fit_center(flood_key(Image.open(SRC / f"{skin}-dive.png"), 44, 1), 176, 96)
        add(f"{skin}_stand", stand, 64, 168)
        add(f"{skin}_walk", walk, 64, 168)
        add(f"{skin}_dive", dive, 96, 48)

    fish_picks = [
        (0, 0), (1, 0), (2, 0), (3, 0),
        (0, 1), (1, 1), (2, 1), (3, 1),
        (0, 2), (1, 2), (2, 2), (3, 2),
    ]
    for i, cell in enumerate(cut_grid(SRC / "animals-sheet.png", 4, 4, fish_picks, 112, 72, True, 8, 52)):
        add(f"fish{i}", cell, 62, 36)
    whale = fit_center(flood_key(Image.open(SRC / "whale.png"), 44, 1, 640), 112, 72)
    add("fish12", whale, 62, 36)

    harbor_src = shrink(Image.open(SRC / "harbor.png"), 720)
    harbor = crush_rgb(harbor_src, 150)
    harbor.thumbnail((560, 320), Image.Resampling.LANCZOS)
    add("harbor", harbor, harbor.width / 2, harbor.height * 0.72)

    plank_src = crush_rgb(shrink(Image.open(SRC / "plank.png"), 640), 70)
    plank = plank_src.resize((256, 56), Image.Resampling.LANCZOS)
    add("plank", plank, 128, 28)

    names_a = ("maya", "nico", "jun", "cashier", "vip", "kid")
    for name, cell in zip(names_a, cut_row(SRC / "people-a.png", 6, 96, 140, 40)):
        add(name, cell, 48, 132)
    names_b = ("g0", "g1", "g2", "g3", "g4", "g5")
    for name, cell in zip(names_b, cut_row(SRC / "people-b.png", 6, 96, 140, 40)):
        add(name, cell, 48, 132)

    post = fit_bottom(flood_key(Image.open(SRC / "post.png"), 40, 2), 36, 88)
    add("post", post, 18, 86)

    add("crown", paint_crown(), 20, 28)
    add("shades", paint_shades(), 20, 12)

    sky = crush_rgb(shrink(Image.open(SRC / "sky.png"), 640), 80)
    sky.thumbnail((360, 120), Image.Resampling.LANCZOS)
    add("sky", sky, sky.width / 2, sky.height)

    water = crush_rgb(shrink(Image.open(SRC / "water.png"), 640), 80)
    water.thumbnail((360, 140), Image.Resampling.LANCZOS)
    add("water", water, water.width / 2, water.height * 0.4)

    tank = fit_center(flood_key(Image.open(SRC / "tankglass.png"), 38, 1), 140, 110)
    add("tankglass", tank, 70, 55)

    bed_picks = [(c, r) for r in range(2) for c in range(4)]
    for i, cell in enumerate(cut_grid(SRC / "beds.png", 4, 2, bed_picks, 120, 56, True, 10, 46)):
        add(f"bed{i}", cell, 60, 40)

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
    prev = Image.new("RGBA", sheet.size, (10, 72, 88, 255))
    prev.paste(sheet, (0, 0), sheet)
    prev.save(ART / "preview.png", "PNG", optimize=True)
    print(f"wrote {out} {out.stat().st_size} bytes {sheet.size} cells={len(atlas)}")


if __name__ == "__main__":
    main()
