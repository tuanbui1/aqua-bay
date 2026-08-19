#!/usr/bin/env python3
"""Loop 53: redraw walk/swim as clean painted frames; unique boards; dock props."""
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
    "skip_stand", "skip_walk", "skip_dive",
    "reef_stand", "reef_walk", "reef_dive",
    "dino_stand", "dino_walk", "dino_dive",
] + [f"fish{i}" for i in range(13)] + [
    "maya", "nico", "jun", "cashier", "vip", "kid",
    "g0", "g1", "g2", "g3", "g4", "g5", "crown", "shades",
    "sky", "tankglass",
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


def column_mass(im, y0, y1):
    w, h = im.size
    px = im.load()
    mass = [0] * w
    for x in range(w):
        a = 0
        for y in range(y0, y1):
            if px[x, y][3] > 24:
                a += 1
        mass[x] = a
    return mass


def figure_ranges(mass, n, min_gap=10, min_w=28):
    runs = []
    start = None
    for x, a in enumerate(mass):
        if a > 3:
            if start is None:
                start = x
        elif start is not None:
            if x - start >= min_w:
                runs.append((start, x))
            start = None
    if start is not None and len(mass) - start >= min_w:
        runs.append((start, len(mass)))
    merged = []
    for s, e in runs:
        if merged and s - merged[-1][1] < min_gap:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    if len(merged) == n:
        return merged
    if len(merged) > n:
        # keep the n widest
        merged.sort(key=lambda r: r[1] - r[0], reverse=True)
        keep = sorted(merged[:n], key=lambda r: r[0])
        return keep
    return None


def keep_largest_blob(im: Image.Image, min_keep=80):
    """Drop neighbor slivers that leaked into a cell."""
    w, h = im.size
    px = im.load()
    seen = [[False] * h for _ in range(w)]
    blobs = []
    for y in range(h):
        for x in range(w):
            if seen[x][y] or px[x, y][3] < 28:
                continue
            stack = [(x, y)]
            seen[x][y] = True
            cells = []
            while stack:
                cx, cy = stack.pop()
                cells.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and px[nx, ny][3] >= 28:
                        seen[nx][ny] = True
                        stack.append((nx, ny))
            blobs.append(cells)
    if not blobs:
        return im
    blobs.sort(key=len, reverse=True)
    keep = set(blobs[0])
    xs = [p[0] for p in blobs[0]]
    ys = [p[1] for p in blobs[0]]
    mx0, mx1, my0, my1 = min(xs), max(xs), min(ys), max(ys)
    for blob in blobs[1:]:
        bxs = [p[0] for p in blob]
        bys = [p[1] for p in blob]
        bw = max(bxs) - min(bxs) + 1
        bh = max(bys) - min(bys) + 1
        # Neighbor-frame slivers are thin vertical strips on a cell edge.
        if bw <= 22 and (min(bxs) <= 6 or max(bxs) >= w - 7):
            continue
        if len(blob) < min_keep:
            continue
        cx = sum(bxs) / len(bxs)
        cy = sum(bys) / len(bys)
        if mx0 - 10 <= cx <= mx1 + 10 and my0 - 10 <= cy <= my1 + 10:
            keep.update(blob)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for x, y in keep:
        op[x, y] = px[x, y]
    return out


def cut_grid(path: Path, cols, rows, tw, th, dist=52, max_side=1600, bottom=False):
    sheet = flood_key(Image.open(path), max_dist=dist, grow=1, max_side=max_side)
    w, h = sheet.size
    cw, ch = w / cols, h / rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            x0 = int(c * cw) + 8
            y0 = int(r * ch) + 8
            x1 = int((c + 1) * cw) - 8
            y1 = int((r + 1) * ch) - 8
            cell = keep_largest_blob(autocrop(sheet.crop((x0, y0, x1, y1)), 3))
            cells.append(fit_bottom(cell, tw, th) if bottom else fit_center(cell, tw, th))
    return cells


def cut_row(path: Path, n, tw, th, dist=52, max_side=1400, bottom=True):
    sheet = flood_key(Image.open(path), max_dist=dist, grow=1, max_side=max_side)
    w, h = sheet.size
    # Drop a painted ground / water strip so figures do not weld into one blob.
    y0 = int(h * 0.03)
    y1 = int(h * (0.80 if bottom else 0.92))
    mass = column_mass(sheet, y0, y1)
    ranges = figure_ranges(mass, n, min_gap=8, min_w=22)
    cells = []
    if ranges:
        for s, e in ranges:
            pad = max(6, int((e - s) * 0.06))
            x0 = max(0, s - pad)
            x1 = min(w, e + pad)
            cell = keep_largest_blob(autocrop(sheet.crop((x0, y0, x1, y1)), 2))
            cells.append(fit_bottom(cell, tw, th) if bottom else fit_center(cell, tw, th))
        if len(cells) == n:
            return cells
    # Equal slices with a little overlap, then drop leaked neighbor slivers.
    cw = w / n
    overlap = cw * 0.10
    cells = []
    for i in range(n):
        x0 = max(0, int(i * cw - overlap * 0.25) + 2)
        x1 = min(w, int((i + 1) * cw + overlap * 0.25) - 2)
        cell = keep_largest_blob(autocrop(sheet.crop((x0, y0, x1, y1)), 2))
        cells.append(fit_bottom(cell, tw, th) if bottom else fit_center(cell, tw, th))
    return cells


def crop_old(old, atlas, name):
    c = atlas[name]
    return old.crop((c["x"], c["y"], c["x"] + c["w"], c["y"] + c["h"])).convert("RGBA"), c


def paint_plank(seed, w=220, h=48, teal=False):
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
    if teal:
        lite, mid, dark, sun = (214, 210, 150), (148, 158, 104), (72, 82, 50), (246, 240, 196)
    else:
        lite, mid, dark, sun = families[seed % len(families)]
    for i in range(h):
        t = i / max(1, h - 1)
        col = mix(mix(lite, sun, 0.28 * (1 - t)), dark, t * 0.42)
        wobble = int(math.sin(i * 0.41 + seed) * 4)
        d.line([(0, i), (w, i)], fill=col + (255,))
        if wobble:
            d.point(((w // 2 + wobble) % w, i), fill=mix(col, sun, 0.35) + (255,))
    for i in range(16):
        y = 2 + i * (h / 16) + rnd.uniform(-0.8, 0.8)
        pts = [(x, y + math.sin(x * 0.03 + seed + i) * 1.6 + math.sin(x * 0.11 + i) * 0.6)
               for x in range(0, w + 4, 3)]
        d.line(pts, fill=dark + (40 + (i % 5) * 12,), width=1 if i % 3 else 2)
    for _ in range(14):
        x = rnd.randint(6, w - 6)
        y = rnd.randint(1, max(2, h // 3))
        d.ellipse([x - 12, y - 2, x + 12, y + 2], fill=sun + (32,))
    if rnd.random() < 0.85:
        kx = rnd.randint(40, w - 40)
        ky = rnd.randint(12, h - 10)
        kr = rnd.uniform(4.4, 8.2)
        d.ellipse([kx - kr * 1.3, ky - kr * 0.7, kx + kr * 1.3, ky + kr * 0.7], fill=dark + (230,))
        d.ellipse([kx - kr * 0.45, ky - kr * 0.32, kx + kr * 0.15, ky], fill=sun + (70,))
        for r in (kr * 0.4, kr * 0.7, kr):
            d.ellipse([kx - r * 1.15, ky - r * 0.62, kx + r * 1.15, ky + r * 0.62],
                      outline=mix(dark, (20, 10, 6), 0.4) + (200,), width=1)
    if rnd.random() < 0.45:
        sx = rnd.randint(20, w - 50)
        d.ellipse([sx, h * 0.35, sx + rnd.randint(28, 70), h - 2], fill=(18, 40, 48, 40))
    for nx in (10, w - 12):
        ny = 8 + (seed % 5)
        d.ellipse([nx - 2.4, ny - 2.4, nx + 2.4, ny + 2.4], fill=(40, 24, 14, 240))
        d.ellipse([nx - 1.2, ny - 1.8, nx + 0.6, ny], fill=(255, 226, 170, 180))
    d.rectangle([0, 0, w, 3], fill=sun + (70,))
    d.rectangle([0, h - 4, w, h], fill=(16, 8, 4, 90))
    d.rectangle([0, 0, 2, h], fill=dark + (110,))
    d.rectangle([w - 2, 0, w, h], fill=dark + (130,))
    im = im.filter(ImageFilter.GaussianBlur(0.22))
    return crush(im, 72)


def planks_from_painting(path: Path, n=8, tw=220, th=48):
    if not path.exists():
        return [paint_plank(3 + i * 11, tw, th) for i in range(n)]
    src = Image.open(path).convert("RGBA")
    src = src.resize((max(tw * 2, 640), max(th * n, 360)), Image.Resampling.LANCZOS)
    w, h = src.size
    out = []
    band = h / n
    for i in range(n):
        y0 = int(i * band) + 2
        y1 = int((i + 1) * band) - 2
        # shift crop so seams do not line up
        x0 = (i * 37) % max(1, w - tw * 2)
        cell = src.crop((x0, y0, min(w, x0 + tw * 2), y1))
        cell = cell.resize((tw, th), Image.Resampling.LANCZOS)
        if i == 3:
            cell = ImageEnhance.Color(cell).enhance(0.82)
            cell = ImageEnhance.Brightness(cell).enhance(0.88)
        elif i == 5:
            cell = ImageEnhance.Color(cell).enhance(1.08)
            cell = ImageEnhance.Brightness(cell).enhance(1.06)
        elif i == 6:
            cell = ImageEnhance.Color(cell).enhance(0.7)
            cell = ImageEnhance.Brightness(cell).enhance(0.78)
        out.append(crush(cell, 80))
    return out


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
        if i % 27 == 0:
            d.ellipse([px - 5, py - 5, px + 3, py - 1], fill=(255, 255, 255, 140))
    d.rectangle([0, 20, w, 26], fill=(220, 250, 255, 40))
    im = im.filter(ImageFilter.GaussianBlur(0.45))
    return crush(im, 56)


def paint_water_fallback(w=360, h=180):
    rnd = rng(19)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    stops = [(186, 246, 255), (86, 206, 220), (36, 150, 176), (14, 96, 128), (8, 52, 76), (4, 24, 40)]
    for i in range(h):
        t = i / max(1, h - 1)
        # wobble the stop so it is not a hard band
        t = min(1.0, max(0.0, t + math.sin(i * 0.11) * 0.03))
        seg = t * (len(stops) - 1)
        i0 = int(seg)
        i1 = min(len(stops) - 1, i0 + 1)
        col = mix(stops[i0], stops[i1], seg - i0)
        d.line([(0, i), (w, i)], fill=col + (255,))
    for i in range(18):
        cx = rnd.uniform(10, w - 10)
        cy = rnd.uniform(8, h * 0.7)
        rr = rnd.uniform(24, 80)
        d.ellipse([cx - rr, cy - rr * 0.42, cx + rr, cy + rr * 0.42],
                  fill=((210, 246, 255, 22) if i % 2 else (8, 40, 56, 28)))
    for i in range(10):
        y = 8 + i * 16
        pts = [(x, y + math.sin(x * 0.028 + i) * 7 + math.sin(x * 0.08 + i) * 3)
               for x in range(-4, w + 8, 6)]
        d.line(pts, fill=(230, 252, 255, 36 if i % 2 else 20), width=1)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    return crush(im, 90)


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


def preview_strip(frames, pad=4, bg=(12, 48, 58, 255)):
    w = sum(im.width for im in frames) + pad * (len(frames) + 1)
    h = max(im.height for im in frames) + pad * 2
    sheet = Image.new("RGBA", (w, h), bg)
    x = pad
    for im in frames:
        sheet.paste(im, (x, pad + (h - pad * 2 - im.height) // 2), im)
        x += im.width + pad
    return sheet


def main():
    old = Image.open(OLD).convert("RGBA")
    old_at = json.loads(OLD_ATLAS.read_text())
    items = []

    def add(name, img, ax=None, ay=None):
        items.append((name, img, ax, ay))

    extras = {}
    for skin in ("skip", "reef", "dino"):
        walk_path = SRC / f"{skin}-walk-cycle.png"
        swim_path = SRC / f"{skin}-swim-cycle.png"
        ww, wh = (140, 184)
        sw, sh = (196, 108)
        walk_grid = SRC / f"{skin}-walk-grid.png"
        swim_grid = SRC / f"{skin}-swim-grid.png"
        if walk_grid.exists():
            walks = cut_grid(walk_grid, 3, 2, ww, wh, 52, 1600, True)
        elif walk_path.exists():
            walks = cut_row(walk_path, 6, ww, wh, 58, 1600, True)
        else:
            src, _ = crop_old(old, old_at, f"{skin}_walk")
            walks = [fit_bottom(src, ww, wh) for _ in range(6)]
        if swim_grid.exists():
            swims = cut_grid(swim_grid, 3, 2, sw, sh, 56, 1600, False)
        elif swim_path.exists():
            swims = cut_row(swim_path, 6, sw, sh, 62, 1600, False)
        else:
            src, _ = crop_old(old, old_at, f"{skin}_dive")
            swims = [fit_center(src, sw, sh) for _ in range(6)]
        extras[skin] = (walks, swims)
        for i, im in enumerate(walks):
            add(f"{skin}_walk{i}", im, ww / 2, wh - 8)
        for i, im in enumerate(swims):
            add(f"{skin}_swim{i}", im, sw / 2, sh / 2)

    for name in KEEP:
        crop, c = crop_old(old, old_at, name)
        add(name, crop, c.get("ax"), c.get("ay"))

    harbor_path = SRC / "harbor-town.png"
    if harbor_path.exists():
        harbor = crush(shrink(Image.open(harbor_path), 720), 150)
        harbor.thumbnail((560, 320), Image.Resampling.LANCZOS)
        add("harbor", harbor, harbor.width / 2, harbor.height * 0.62)
        town = crush(shrink(Image.open(harbor_path), 900), 140)
        town.thumbnail((640, 360), Image.Resampling.LANCZOS)
        add("harbortown", town, town.width / 2, town.height * 0.58)
    else:
        crop, c = crop_old(old, old_at, "harbor")
        add("harbor", crop, c.get("ax"), c.get("ay"))

    boards = planks_from_painting(SRC / "dock-planks.png", 8, 220, 48)
    names = ["plank", "plank1", "plank2", "plank3", "plank4", "plank5", "plank6", "plank7"]
    for i, (name, im) in enumerate(zip(names, boards)):
        add(name, im, im.width / 2, im.height / 2)

    water_path = SRC / "bay-water.png"
    if water_path.exists():
        water = Image.open(water_path).convert("RGBA")
        # prefer the sunlit surface, not a floor-of-rocks dump
        ww, wh = water.size
        water = water.crop((0, 0, ww, int(wh * 0.72)))
        water = crush(water, 100)
        water.thumbnail((360, 180), Image.Resampling.LANCZOS)
        add("water", water, water.width / 2, water.height * 0.38)
    else:
        add("water", paint_water_fallback(), 180, 70)

    add("waterline", paint_waterline(3), 180, 38)
    add("waterline2", paint_waterline(17), 180, 38)

    if (SRC / "dive-pad.png").exists():
        add("divepad", fit_center(flood_key(Image.open(SRC / "dive-pad.png"), 36, 1, 720), 200, 92), 100, 78)
    if (SRC / "life-ring.png").exists():
        add("lifering", fit_bottom(flood_key(Image.open(SRC / "life-ring.png"), 36, 1, 720), 132, 150), 66, 142)
    if (SRC / "dock-anchor.png").exists():
        add("anchor", fit_bottom(flood_key(Image.open(SRC / "dock-anchor.png"), 36, 1, 720), 110, 140), 55, 132)

    sheet, atlas = pack(items)
    out = ART / "bay.png"
    sheet.save(out, "PNG", optimize=True)
    (ART / "atlas.json").write_text(json.dumps(atlas, indent=2))
    patch_atlas(atlas)

    prev = Path("/tmp/loop53")
    prev.mkdir(exist_ok=True)
    for skin, (walks, swims) in extras.items():
        preview_strip(walks).save(prev / f"{skin}_walk.png")
        preview_strip(swims, bg=(8, 36, 52, 255)).save(prev / f"{skin}_swim.png")
    print(f"wrote {out} {out.stat().st_size} bytes {sheet.size} cells={len(atlas)}")


if __name__ == "__main__":
    main()
