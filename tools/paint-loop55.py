#!/usr/bin/env python3
"""Loop 55: painted skyline, single boards, water, dive sign, portraits."""
from __future__ import annotations

import json
import math
import random
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
OLD = ART / "bay.png"
OLD_ATLAS = ART / "atlas.json"
SRC = Path("/opt/cursor/artifacts/assets")

KEEP = [
    "skip_walk0", "skip_walk1", "skip_walk2", "skip_walk3", "skip_walk4", "skip_walk5",
    "skip_swim0", "skip_swim1", "skip_swim2", "skip_swim3", "skip_swim4", "skip_swim5",
    "reef_walk0", "reef_walk1", "reef_walk2", "reef_walk3", "reef_walk4", "reef_walk5",
    "reef_swim0", "reef_swim1", "reef_swim2", "reef_swim3", "reef_swim4", "reef_swim5",
    "dino_walk0", "dino_walk1", "dino_walk2", "dino_walk3", "dino_walk4", "dino_walk5",
    "dino_swim0", "dino_swim1", "dino_swim2", "dino_swim3", "dino_swim4", "dino_swim5",
    "skip_stand", "skip_walk", "skip_dive",
    "reef_stand", "reef_walk", "reef_dive",
    "dino_stand", "dino_walk", "dino_dive",
] + [f"fish{i}" for i in range(13)] + [
    "maya", "nico", "jun", "cashier", "vip", "kid",
    "g0", "g1", "g2", "g3", "g4", "g5", "crown", "shades",
    "tankglass",
] + [f"bed{i}" for i in range(8)] + ["post"]


def rng(seed):
    return random.Random(seed)


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def crush(im: Image.Image, colors=110):
    rgb = im.convert("RGB")
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    out = q.convert("RGBA")
    if im.mode == "RGBA":
        out.putalpha(im.split()[-1])
    return out


def shrink(im: Image.Image, max_side=900):
    im = im.convert("RGBA")
    w, h = im.size
    m = max(w, h)
    if m > max_side:
        im = im.copy()
        im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    return im


def flood_key(im: Image.Image, max_dist=48, grow=2, max_side=1100):
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


def autocrop(im: Image.Image, pad=4):
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def fit_center(im: Image.Image, w, h):
    im = autocrop(im)
    src = im.copy()
    src.thumbnail((w - 4, h - 4), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(src, ((w - src.width) // 2, (h - src.height) // 2), src)
    return out


def fit_bottom(im: Image.Image, w, h):
    im = autocrop(im)
    src = im.copy()
    src.thumbnail((w - 4, h - 4), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(src, ((w - src.width) // 2, h - src.height - 2), src)
    return out


def crop_old(old, atlas, name):
    c = atlas[name]
    return old.crop((c["x"], c["y"], c["x"] + c["w"], c["y"] + c["h"])).convert("RGBA"), c


def paint_plank(seed, w=240, h=40):
    rnd = rng(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    families = [
        ((246, 198, 128), (214, 150, 78), (132, 78, 36), (255, 236, 186)),
        ((228, 168, 96), (176, 108, 52), (92, 50, 22), (255, 226, 170)),
        ((198, 132, 68), (148, 86, 40), (70, 38, 16), (240, 196, 130)),
        ((210, 176, 118), (160, 118, 64), (88, 56, 28), (250, 230, 186)),
        ((168, 108, 58), (118, 70, 34), (56, 30, 14), (220, 176, 110)),
        ((186, 142, 86), (140, 92, 46), (72, 42, 18), (236, 200, 140)),
        ((156, 96, 50), (108, 64, 30), (48, 26, 12), (210, 160, 96)),
        ((232, 188, 120), (188, 128, 62), (96, 54, 24), (255, 236, 190)),
    ]
    lite, mid, dark, sun = families[seed % len(families)]
    for i in range(h):
        t = i / max(1, h - 1)
        col = mix(mix(lite, sun, 0.32 * (1 - t)), dark, t * 0.46)
        d.line([(0, i), (w, i)], fill=col + (255,))
    for i in range(10):
        y = 2 + i * (h / 10) + rnd.uniform(-0.6, 0.6)
        pts = [(x, y + math.sin(x * 0.028 + seed + i) * 1.4 + math.sin(x * 0.09 + i) * 0.5)
               for x in range(0, w + 4, 3)]
        d.line(pts, fill=dark + (36 + (i % 5) * 10,), width=1 if i % 3 else 2)
    if rnd.random() < 0.9:
        kx = rnd.randint(36, w - 36)
        ky = rnd.randint(10, h - 8)
        kr = rnd.uniform(4.0, 7.4)
        d.ellipse([kx - kr * 1.3, ky - kr * 0.7, kx + kr * 1.3, ky + kr * 0.7], fill=dark + (230,))
        d.ellipse([kx - kr * 0.45, ky - kr * 0.32, kx + kr * 0.15, ky], fill=sun + (70,))
        for r in (kr * 0.4, kr * 0.7, kr):
            d.ellipse([kx - r * 1.15, ky - r * 0.62, kx + r * 1.15, ky + r * 0.62],
                      outline=mix(dark, (20, 10, 6), 0.4) + (200,), width=1)
    if rnd.random() < 0.4:
        sx = rnd.randint(20, w - 70)
        d.ellipse([sx, h * 0.28, sx + rnd.randint(24, 64), h - 1], fill=(18, 70, 72, 36))
    for nx in (12, w - 14):
        ny = 7 + (seed % 4)
        d.ellipse([nx - 2.2, ny - 2.2, nx + 2.2, ny + 2.2], fill=(40, 24, 14, 240))
        d.ellipse([nx - 1.1, ny - 1.6, nx + 0.5, ny], fill=(255, 226, 170, 180))
    d.rectangle([0, 0, w, 3], fill=sun + (80,))
    d.rectangle([0, h - 4, w, h], fill=(16, 8, 4, 100))
    d.rectangle([0, 0, 2, h], fill=dark + (110,))
    d.rectangle([w - 2, 0, w, h], fill=dark + (130,))
    return crush(im.filter(ImageFilter.GaussianBlur(0.18)), 64)


def plank_from_paint(path: Path, w=240, h=40, seed=0):
    if not path.exists():
        return paint_plank(3 + seed * 11, w, h)
    src = flood_key(Image.open(path), 28, 1, 1400)
    src = autocrop(src, 2)
    if src.width < 8 or src.height < 8:
        src = Image.open(path).convert("RGBA")
    src = src.resize((w, h), Image.Resampling.LANCZOS)
    # One board: flatten any leftover dual-seam by slight contrast, not a second strip.
    return crush(src, 78)


def paint_waterline(seed=11, w=360, h=56):
    rnd = rng(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for i in range(h):
        t = i / max(1, h - 1)
        if t < 0.38:
            col = mix((176, 118, 62), (16, 64, 80), t / 0.38)
            a = int(50 + t * 150)
        else:
            u = (t - 0.38) / 0.62
            col = mix((36, 148, 168), (210, 246, 255), u)
            a = int(210 - u * 50)
        d.line([(0, i), (w, i)], fill=col + (a,))
    for i in range(0, w, 9):
        px = i + rnd.uniform(-3, 3)
        py = 24 + math.sin(i * 0.07 + seed) * 4 + rnd.uniform(-1.5, 1.5)
        r = 5 + (i * 17) % 7
        d.ellipse([px - r, py - 3.4, px + r, py + 4.2], fill=(255, 255, 255, 165))
        d.ellipse([px - r * 0.5 + 3, py + 2, px + r * 0.45 + 4, py + 6], fill=(196, 236, 255, 70))
    return crush(im.filter(ImageFilter.GaussianBlur(0.4)), 56)


def paint_ring(w=96, h=96):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy, r = w / 2, h / 2 + 4, 28
    d.ellipse([cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8], fill=(200, 56, 48, 255))
    d.ellipse([cx - r + 7, cy - r + 7, cx + r - 7, cy + r - 7], fill=(0, 0, 0, 0))
    for a in (0.2, 1.0, 2.0, 3.3):
        d.pieslice([cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8],
                   math.degrees(a), math.degrees(a + 0.55), fill=(255, 246, 232, 255))
    d.ellipse([cx - r + 7, cy - r + 7, cx + r - 7, cy + r - 7], fill=(0, 0, 0, 0))
    d.ellipse([cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8], outline=(120, 36, 28, 255), width=3)
    d.ellipse([cx - r + 6, cy - r + 6, cx + r - 6, cy + r - 6], outline=(120, 36, 28, 255), width=2)
    return crush(im, 40)


def paint_anchor_only(w=90, h=110):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w / 2
    d.ellipse([cx - 10, 8, cx + 10, 28], outline=(90, 62, 42, 255), width=5)
    d.rectangle([cx - 4, 24, cx + 4, 78], fill=(86, 58, 38, 255))
    d.arc([cx - 28, 58, cx + 28, 104], 10, 170, fill=(86, 58, 38, 255), width=6)
    d.polygon([(cx - 26, 78), (cx - 34, 70), (cx - 18, 86)], fill=(110, 70, 40, 255))
    d.polygon([(cx + 26, 78), (cx + 34, 70), (cx + 18, 86)], fill=(110, 70, 40, 255))
    d.ellipse([cx - 5, 20, cx + 3, 26], fill=(255, 210, 140, 90))
    return crush(im, 36)


def pack(items):
    pad = 2
    x = y = pad
    row_h = 0
    max_w = 1600
    for name, img, ax, ay in items:
        if x + img.width + pad > max_w:
            x = pad
            y += row_h
            row_h = 0
        x += img.width + pad
        row_h = max(row_h, img.height + pad)
    sheet_h = y + row_h + pad
    sheet = Image.new("RGBA", (max_w, sheet_h), (0, 0, 0, 0))
    atlas = {}
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
    return sheet, atlas


def patch_atlas(atlas):
    js_path = ROOT / "game.js"
    js = js_path.read_text()
    blob = json.dumps(atlas, separators=(",", ":"))
    nxt, n = re.subn(r"const ATLAS = \{.*?\};", "const ATLAS = " + blob + ";", js, count=1)
    if n != 1:
        raise SystemExit("could not patch ATLAS in game.js")
    js_path.write_text(nxt)


def main():
    old = Image.open(OLD).convert("RGBA")
    old_at = json.loads(OLD_ATLAS.read_text())
    items = []

    def add(name, img, ax=None, ay=None):
        items.append((name, img, ax, ay))

    for name in KEEP:
        if name not in old_at:
            continue
        crop, c = crop_old(old, old_at, name)
        add(name, crop, c.get("ax"), c.get("ay"))

    for skin in ("skip", "reef", "dino"):
        src, c = crop_old(old, old_at, f"{skin}_walk0")
        card = src.copy()
        add(f"{skin}_card", card, c.get("ax", card.width / 2), c.get("ay", card.height - 8))

    skyline = SRC / "harbor-skyline.png"
    if skyline.exists():
        town = crush(shrink(Image.open(skyline), 1100), 160)
        town.thumbnail((720, 420), Image.Resampling.LANCZOS)
        add("harbortown", town, town.width / 2, town.height * 0.92)
        harbor = town.copy()
        harbor.thumbnail((520, 320), Image.Resampling.LANCZOS)
        add("harbor", harbor, harbor.width / 2, harbor.height * 0.90)
        sky = town.crop((0, 0, town.width, max(72, int(town.height * 0.42))))
        sky = crush(sky, 70)
        add("sky", sky, sky.width / 2, sky.height)
    else:
        crop, c = crop_old(old, old_at, "harbortown")
        add("harbortown", crop, c.get("ax"), crop.height * 0.92)
        crop, c = crop_old(old, old_at, "harbor")
        add("harbor", crop, c.get("ax"), crop.height * 0.90)
        if "sky" in old_at:
            crop, c = crop_old(old, old_at, "sky")
            add("sky", crop, c.get("ax"), c.get("ay"))

    painted = [
        SRC / "plank-a.png", SRC / "plank-b.png", SRC / "plank-c.png", SRC / "plank-d.png",
    ]
    names = ["plank", "plank1", "plank2", "plank3", "plank4", "plank5", "plank6", "plank7"]
    for i, name in enumerate(names):
        if i < len(painted) and painted[i].exists():
            im = plank_from_paint(painted[i], 240, 40, i)
        else:
            im = paint_plank(5 + i * 13, 240, 40)
        add(name, im, im.width / 2, im.height / 2)

    water_path = SRC / "bay-water-surface.png"
    if water_path.exists():
        water = Image.open(water_path).convert("RGBA")
        water = crush(water, 96)
        water.thumbnail((400, 200), Image.Resampling.LANCZOS)
        add("water", water, water.width / 2, water.height * 0.28)
    elif "water" in old_at:
        crop, c = crop_old(old, old_at, "water")
        add("water", crop, c.get("ax"), c.get("ay"))

    add("waterline", paint_waterline(3), 180, 38)
    add("waterline2", paint_waterline(17), 180, 38)

    dive_path = SRC / "dive-sign.png"
    if dive_path.exists():
        pad = fit_center(flood_key(Image.open(dive_path), 42, 2, 900), 220, 110)
        add("divepad", pad, pad.width / 2, pad.height * 0.86)
    elif "divepad" in old_at:
        crop, c = crop_old(old, old_at, "divepad")
        add("divepad", crop, c.get("ax"), c.get("ay"))

    add("lifering", paint_ring(), 48, 86)
    add("anchor", paint_anchor_only(), 45, 102)

    sheet, atlas = pack(items)
    out = ART / "bay.png"
    sheet.save(out, "PNG", optimize=True)
    (ART / "atlas.json").write_text(json.dumps(atlas, indent=2))
    patch_atlas(atlas)
    print(f"wrote {out} {out.stat().st_size} bytes {sheet.size} cells={len(atlas)}")


if __name__ == "__main__":
    main()
