#!/usr/bin/env python3
"""Loop 49 environment pass: invent painted pier / water / beds, keep C48 sprites."""
from __future__ import annotations

import json
import math
import random
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
OLD = ART / "bay.png"
OLD_ATLAS = ART / "atlas.json"

KEEP = [
    "skip_stand", "skip_walk", "skip_dive",
    "reef_stand", "reef_walk", "reef_dive",
    "dino_stand", "dino_walk", "dino_dive",
] + [f"fish{i}" for i in range(13)] + [
    "harbor", "maya", "nico", "jun", "cashier", "vip", "kid",
    "g0", "g1", "g2", "g3", "g4", "g5", "crown", "shades", "sky", "tankglass",
]


def rng(seed):
    return random.Random(seed)


def mix(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def crush(im: Image.Image, colors=90):
    rgb = im.convert("RGB")
    q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT)
    out = q.convert("RGBA")
    if im.mode == "RGBA":
        out.putalpha(im.split()[-1])
    return out


def dabs(d, pts, col, r0, r1, n, rnd):
    for _ in range(n):
        x, y = rnd.choice(pts) if pts else (0, 0)
        x += rnd.uniform(-6, 6)
        y += rnd.uniform(-4, 4)
        rr = rnd.uniform(r0, r1)
        c = col if len(col) == 4 else col + (rnd.randint(70, 140),)
        d.ellipse([x - rr * 1.4, y - rr * 0.7, x + rr * 1.4, y + rr * 0.7], fill=c)


def paint_plank(seed, w=196, h=54, teal=False):
    rnd = rng(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if teal:
        lights = [(226, 220, 168), (198, 204, 148), (168, 178, 122)]
        mid = (140, 150, 98)
        dark = (72, 82, 52)
        ink = (44, 50, 30)
        sun = (255, 244, 200)
    else:
        # Harbor-warm boards: honey, cedar, wet teak
        lights = [(242, 196, 128), (228, 168, 96), (210, 148, 78), (198, 132, 68)]
        mid = (168, 108, 52)
        dark = (92, 52, 24)
        ink = (58, 30, 14)
        sun = (255, 236, 186)
    base = lights[seed % len(lights)]
    for i in range(h):
        t = i / max(1, h - 1)
        col = mix(mix(base, sun, 0.22 * (1 - t)), dark, t * 0.38)
        wobble = int(math.sin(i * 0.35 + seed) * 3)
        d.line([(0, i), (w, i)], fill=col + (255,))
        if wobble:
            d.point((w // 2 + wobble, i), fill=mix(col, sun, 0.2) + (255,))
    for i in range(22):
        y = 2 + i * (h / 22) + rnd.uniform(-0.6, 0.6)
        a = 40 + (i % 6) * 14
        pts = [(x, y + math.sin(x * 0.038 + seed + i) * 1.8 + math.sin(x * 0.13 + i) * 0.7) for x in range(0, w + 4, 4)]
        d.line(pts, fill=ink + (a,), width=1 if i % 3 else 2)
    # sun dabs
    for _ in range(10):
        x = rnd.randint(8, w - 8)
        y = rnd.randint(2, 16)
        d.ellipse([x - 10, y - 2, x + 10, y + 2], fill=sun + (28,))
    if rnd.random() < 0.9:
        kx = rnd.randint(30, w - 30)
        ky = rnd.randint(14, h - 12)
        kr = rnd.uniform(5.2, 8.8)
        d.ellipse([kx - kr * 1.25, ky - kr * 0.72, kx + kr * 1.25, ky + kr * 0.72], fill=dark + (230,))
        d.ellipse([kx - kr * 0.5, ky - kr * 0.35, kx + kr * 0.2, ky], fill=sun + (50,))
        for r in (kr * 0.35, kr * 0.65, kr):
            d.ellipse([kx - r * 1.15, ky - r * 0.65, kx + r * 1.15, ky + r * 0.65], outline=ink + (190,), width=1)
    for nx in (11, w - 13):
        ny = 9 + (seed % 4)
        d.ellipse([nx - 2.2, ny - 2.2, nx + 2.2, ny + 2.2], fill=(42, 28, 16, 235))
        d.ellipse([nx - 1.3, ny - 1.8, nx + 0.7, ny], fill=(255, 226, 170, 170))
    d.rectangle([0, 0, w, 4], fill=sun + (55 if not teal else 30,))
    d.rectangle([0, h - 5, w, h], fill=(18, 8, 4, 80))
    d.rectangle([0, 0, 2, h], fill=ink + (100,))
    d.rectangle([w - 2, 0, w, h], fill=ink + (120,))
    im = im.filter(ImageFilter.GaussianBlur(0.28))
    return crush(im, 64)


def paint_water(seed=7, w=320, h=176):
    rnd = rng(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    stops = [
        (186, 246, 255),
        (92, 214, 232),
        (42, 168, 196),
        (18, 118, 150),
        (10, 78, 108),
        (6, 42, 64),
        (4, 22, 36),
    ]
    for i in range(h):
        t = i / max(1, h - 1)
        seg = t * (len(stops) - 1)
        i0 = int(seg)
        i1 = min(len(stops) - 1, i0 + 1)
        col = mix(stops[i0], stops[i1], seg - i0)
        d.line([(0, i), (w, i)], fill=col + (255,))
    for i in range(22):
        cx = w * (0.18 + (i % 5) * 0.16) + rnd.uniform(-12, 12)
        cy = 10 + (i % 6) * 8
        rr = 22 + (i % 7) * 6
        d.ellipse([cx - rr, cy - rr * 0.4, cx + rr, cy + rr * 0.5], fill=(255, 236, 170, 16))
    for i in range(14):
        y = 10 + i * 11
        pts = [(x, y + math.sin(x * 0.032 + i) * 8 + math.sin(x * 0.09 + i * 2) * 3.4) for x in range(-6, w + 10, 7)]
        d.line(pts, fill=(230, 252, 255, 70 if i % 2 else 40), width=2 if i % 3 else 1)
    for i in range(48):
        x = rnd.randint(4, w - 4)
        y = rnd.randint(4, int(h * 0.48))
        tw = rnd.uniform(2.4, 7.2)
        d.ellipse([x - tw, y - 1.0, x + tw, y + 1.0], fill=(255, 252, 230, rnd.randint(80, 180)))
    for i in range(26):
        x = rnd.randint(4, w - 4)
        y = rnd.randint(int(h * 0.28), h - 8)
        r = rnd.uniform(0.8, 2.0)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(230, 250, 255, 100))
    for i in range(int(h * 0.32)):
        d.line([(0, h - i), (w, h - i)], fill=(2, 10, 16, min(150, int(6 + i * 1.5))))
    # soft top so overlaps do not flash a hard rect
    fade = Image.new("L", (w, h), 255)
    fd = ImageDraw.Draw(fade)
    for i in range(18):
        fd.line([(0, i), (w, i)], fill=int(40 + i * 12))
    im.putalpha(fade)
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    return crush(im, 80)


def paint_waterline(seed=11, w=360, h=60):
    rnd = rng(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # wet wood fading into foam
    for i in range(h):
        t = i / max(1, h - 1)
        if t < 0.42:
            col = mix((168, 112, 58), (18, 70, 88), t / 0.42)
            a = int(40 + t * 140)
        else:
            u = (t - 0.42) / 0.58
            col = mix((40, 150, 170), (180, 240, 255), u)
            a = int(200 - u * 40)
        d.line([(0, i), (w, i)], fill=col + (a,))
    # foam puffs
    for i in range(0, w, 11):
        px = i + rnd.uniform(-2, 2)
        py = 28 + math.sin(i * 0.08) * 3
        r = 6 + (i * 13) % 5
        d.ellipse([px - r, py - 3.2, px + r, py + 3.6], fill=(255, 255, 255, 150))
        d.ellipse([px - r * 0.6 + 3, py + 2, px + r * 0.5 + 3, py + 5], fill=(200, 236, 255, 80))
    # sheen
    d.rectangle([0, 22, w, 28], fill=(220, 250, 255, 50))
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    return crush(im, 52)


def paint_post(seed=3, w=44, h=110):
    rnd = rng(seed)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # wet dark foot
    d.ellipse([4, h - 16, w - 4, h - 2], fill=(16, 10, 6, 140))
    # post body
    d.rounded_rectangle([10, 8, 34, h - 10], radius=5, fill=(92, 58, 30, 255))
    d.rectangle([10, 8, 20, h - 10], fill=(138, 90, 48, 255))
    d.rectangle([28, 8, 34, h - 10], fill=(62, 36, 18, 200))
    for i in range(8):
        y = 14 + i * 11
        d.line([(12, y), (32, y + rnd.uniform(-1, 1))], fill=(48, 26, 12, 70), width=1)
    # rope wrap
    d.arc([6, 22, 38, 46], 200, 340, fill=(210, 176, 96, 255), width=4)
    d.arc([8, 28, 36, 50], 20, 160, fill=(176, 140, 70, 255), width=3)
    # barnacle dots
    for _ in range(5):
        x = rnd.randint(14, 30)
        y = rnd.randint(h - 36, h - 16)
        d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(220, 210, 190, 200))
    # wet darkening near foot
    d.rectangle([10, h - 28, 34, h - 10], fill=(20, 36, 44, 70))
    # cap
    d.ellipse([8, 4, 36, 18], fill=(168, 112, 58, 255))
    d.ellipse([12, 6, 28, 14], fill=(232, 196, 130, 160))
    return crush(im, 40)


def paint_bed(kind, seed, w=220, h=92):
    rnd = rng(seed + kind * 17)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    palettes = [
        ((232, 210, 140), (200, 168, 96), (90, 150, 80), (255, 140, 90)),   # shallows
        ((210, 186, 120), (90, 140, 110), (232, 93, 106), (196, 94, 200)), # reef
        ((232, 200, 96), (210, 168, 60), (255, 226, 122), (180, 140, 40)), # gold
        ((212, 176, 140), (176, 110, 80), (232, 160, 90), (90, 70, 50)),   # koi
        ((200, 196, 110), (70, 140, 80), (180, 220, 130), (40, 90, 50)),   # turtle
        ((184, 160, 100), (50, 130, 80), (255, 180, 70), (30, 80, 50)),    # grove
        ((210, 200, 90), (140, 130, 50), (80, 180, 200), (40, 70, 40)),    # pocket
        ((232, 220, 176), (200, 176, 120), (90, 150, 170), (60, 80, 90)),  # deep sand
    ]
    lite, mid, accent, dark = palettes[kind % len(palettes)]
    # irregular mound — leave transparent corners so tiles blend
    cx, cy = w / 2, h * 0.62
    for i in range(16):
        a = i / 16 * math.pi * 2
        rx = w * 0.46 + math.sin(a * 3 + seed) * 18
        ry = h * 0.38 + math.cos(a * 2 + seed) * 10
        col = mix(lite, mid, 0.2 + 0.5 * (i % 5) / 5)
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=col + (230,))
    # sand grains
    for _ in range(80):
        x = rnd.randint(12, w - 12)
        y = rnd.randint(int(h * 0.35), h - 8)
        r = rnd.uniform(0.6, 1.8)
        d.ellipse([x - r, y - r * 0.6, x + r, y + r * 0.6], fill=mix(lite, (255, 246, 210), 0.4) + (90,))
    # rocks
    for _ in range(3 + kind % 3):
        x = rnd.randint(24, w - 24)
        y = rnd.randint(int(h * 0.42), h - 16)
        rw, rh = rnd.uniform(10, 22), rnd.uniform(6, 12)
        d.ellipse([x - rw, y - rh, x + rw, y + rh], fill=mix(dark, mid, 0.35) + (240,))
        d.ellipse([x - rw * 0.5, y - rh * 0.8, x + rw * 0.2, y - rh * 0.1], fill=(255, 236, 200, 50))
    # kelp / coral accents — vary by kind so rows never match
    if kind % 4 == 0:
        for i in range(5):
            x = 28 + i * 38 + rnd.randint(-6, 6)
            pts = [(x, h - 12)]
            for k in range(5):
                pts.append((x + math.sin(k + seed) * 7, h - 18 - k * 10))
            d.line(pts, fill=accent + (200,), width=3)
    elif kind % 4 == 1:
        for i in range(4):
            x = 36 + i * 46
            y = h - 22
            d.ellipse([x - 12, y - 7, x + 12, y + 7], fill=accent + (220,))
            d.ellipse([x + 10, y - 2, x + 26, y + 8], fill=dark + (200,))
    elif kind % 4 == 2:
        for i in range(3):
            x = 40 + i * 60
            d.polygon([(x, h - 14), (x + 8, h - 40), (x + 16, h - 14)], fill=accent + (180,))
    else:
        for i in range(6):
            x = 20 + i * 32
            d.arc([x, h - 34, x + 28, h - 6], 200, 350, fill=accent + (160,), width=3)
    # soft edge fade
    fade = Image.new("L", (w, h), 0)
    fd = ImageDraw.Draw(fade)
    fd.ellipse([8, 10, w - 8, h + 20], fill=255)
    fade = fade.filter(ImageFilter.GaussianBlur(7))
    im.putalpha(fade)
    # keep some body opacity
    px = im.load()
    ap = fade.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            fa = ap[x, y]
            px[x, y] = (r, g, b, min(a, fa))
    return crush(im, 56)


def crop_old(old, atlas, name):
    c = atlas[name]
    return old.crop((c["x"], c["y"], c["x"] + c["w"], c["y"] + c["h"])), c


def patch_atlas(atlas):
    js_path = ROOT / "game.js"
    js = js_path.read_text()
    blob = json.dumps(atlas, separators=(",", ":"))
    nxt, n = re.subn(r"const ATLAS = \{.*?\};", "const ATLAS = " + blob + ";", js, count=1)
    if n != 1:
        raise SystemExit("could not patch ATLAS in game.js")
    js_path.write_text(nxt)


def pack(items):
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


def main():
    old = Image.open(OLD).convert("RGBA")
    old_at = json.loads(OLD_ATLAS.read_text())
    items = []

    def add(name, img, ax=None, ay=None):
        items.append((name, img, ax, ay))

    for name in KEEP:
        crop, c = crop_old(old, old_at, name)
        add(name, crop, c.get("ax"), c.get("ay"))

    add("plank", paint_plank(1), 98, 27)
    add("plank1", paint_plank(9), 98, 27)
    add("plank2", paint_plank(21), 98, 27)
    add("water", paint_water(), 160, 70)
    add("waterline", paint_waterline(), 180, 40)
    add("post", paint_post(), 22, 104)
    for i in range(8):
        add(f"bed{i}", paint_bed(i, 40 + i * 3), 110, 68)

    sheet, atlas = pack(items)
    out = ART / "bay.png"
    sheet.save(out, "PNG", optimize=True)
    (ART / "atlas.json").write_text(json.dumps(atlas, indent=2))
    patch_atlas(atlas)
    print(f"wrote {out} {out.stat().st_size} bytes {sheet.size} cells={len(atlas)}")


if __name__ == "__main__":
    main()
