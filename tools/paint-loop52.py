#!/usr/bin/env python3
"""Loop 52: extra painted walk / swim frames from the C48 character sprites."""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
OLD = ART / "bay.png"
OLD_ATLAS = ART / "atlas.json"

WALK_N = 6
SWIM_N = 6


def crop_old(old, atlas, name):
    c = atlas[name]
    return old.crop((c["x"], c["y"], c["x"] + c["w"], c["y"] + c["h"])).convert("RGBA"), c


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def sample(im, px, x, y):
    w, h = im.size
    if x < -1 or y < -1 or x > w or y > h:
        return (0, 0, 0, 0)
    x0 = int(math.floor(x))
    y0 = int(math.floor(y))
    x1 = x0 + 1
    y1 = y0 + 1
    tx = x - x0
    ty = y - y0

    def at(ix, iy):
        if ix < 0 or iy < 0 or ix >= w or iy >= h:
            return (0, 0, 0, 0)
        return px[ix, iy]

    c00, c10, c01, c11 = at(x0, y0), at(x1, y0), at(x0, y1), at(x1, y1)

    def mix4(i):
        a = c00[i] * (1 - tx) + c10[i] * tx
        b = c01[i] * (1 - tx) + c11[i] * tx
        return a * (1 - ty) + b * ty

    a = mix4(3)
    if a < 1:
        return (0, 0, 0, 0)
    r = mix4(0)
    g = mix4(1)
    b = mix4(2)
    return (int(r), int(g), int(b), int(a))


def warp(src: Image.Image, mapper):
    w, h = src.size
    px = src.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            sx, sy = mapper(x, y, w, h)
            op[x, y] = sample(src, px, sx, sy)
    return out


def heal_holes(im: Image.Image, passes=1):
    """Fill 1px stretch gaps from opaque neighbors so limbs do not look moth-eaten."""
    w, h = im.size
    for _ in range(passes):
        px = im.load()
        nxt = im.copy()
        npx = nxt.load()
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                if px[x, y][3] > 18:
                    continue
                rs = gs = bs = a = n = 0
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)):
                    r, g, b, aa = px[x + dx, y + dy]
                    if aa > 40:
                        rs += r * aa
                        gs += g * aa
                        bs += b * aa
                        a += aa
                        n += 1
                if n >= 4:
                    npx[x, y] = (rs // a, gs // a, bs // a, min(210, a // n))
        im = nxt
    return im


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = clamp((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def walk_frame(src: Image.Image, i: int, kind: str) -> Image.Image:
    t = i / WALK_N * math.pi * 2
    stride = math.sin(t)
    contact = math.cos(t)
    passing = abs(math.sin(t))
    waddle = 1.32 if kind == "dino" else 1.0

    def forward(x, y, w, h):
        ny = y / max(1.0, h - 1)
        nx = x / max(1.0, w - 1)
        side = clamp((x - w * 0.50) / (w * 0.20), -1.0, 1.0)
        head_w = 1.0 - smoothstep(0.28, 0.44, ny)
        leg_w = smoothstep(0.48, 0.66, ny)
        torso_w = max(0.0, 1.0 - head_w - leg_w)
        left_w = 1.0 - smoothstep(0.42, 0.58, nx)
        snork = smoothstep(0.55, 0.80, nx)
        dx = stride * (5.2 if kind == "dino" else 3.6) * waddle * (torso_w - head_w * 0.75)
        dx += contact * (3.2 if kind == "dino" else 2.2) * waddle * torso_w
        dy = abs(contact) * 4.6 * waddle - contact * 1.4
        dx += head_w * -stride * 3.6
        dy -= head_w * (passing * 2.6 + contact * 1.1)
        dx += head_w * snork * -stride * 3.0
        dy += head_w * snork * -stride * 1.8
        if kind == "reef":
            dx += head_w * smoothstep(0.48, 0.74, nx) * stride * 4.4
            dy -= head_w * passing * 2.4
        dx += torso_w * left_w * (-stride * (8.0 if kind != "dino" else 3.0) - contact * 2.0)
        dy += torso_w * left_w * (2.2 + abs(contact) * 1.6)
        if kind == "dino":
            dy += torso_w * (1.0 - passing) * 3.8
            tail = (1.0 - smoothstep(0.34, 0.54, nx)) * smoothstep(0.36, 0.84, ny)
            dx += tail * -stride * 11.0
            dy += tail * stride * 5.2
        dx += side * stride * 17.0 * waddle * leg_w
        swing = max(0.0, -side * stride)
        dy -= swing * 8.2 * waddle * leg_w
        return dx, dy

    def mapper(x, y, w, h):
        dx, dy = forward(x, y, w, h)
        return x - dx, y - dy

    return heal_holes(warp(src, mapper), 1)


def swim_frame(src: Image.Image, i: int, kind: str) -> Image.Image:
    t = i / SWIM_N * math.pi * 2
    kick = math.sin(t)
    stroke = math.sin(t + math.pi * 0.5)
    und = math.sin(t * 2.0)
    k_amp = 20.0 if kind == "dino" else 16.0

    def mapper(x, y, w, h):
        nx = x / max(1.0, w - 1)
        sx, sy = float(x), float(y)
        sy += math.sin(nx * math.pi + t) * (3.6 if kind == "dino" else 2.8)
        sx += und * 1.8 * (0.3 + nx)
        if nx < 0.34:
            k = ((0.34 - nx) / 0.34) ** 1.3
            sy -= kick * k_amp * k
            sx += abs(kick) * 2.2 * k
            if kind == "dino":
                sy -= kick * 7.0 * k
                sx += und * 3.6 * k
        elif nx < 0.56:
            sy -= kick * (k_amp * 0.36)
            sx -= stroke * 1.4
        elif nx < 0.74:
            sx -= stroke * 6.4
            sy -= stroke * 3.0
            if kind == "dino":
                sy -= (1.0 - abs(kick)) * 3.2
        else:
            sy -= stroke * 2.4 - und * 1.2
            if y < h * 0.42:
                sy -= stroke * 4.6
                sx += kick * 1.4
            if kind == "reef" and y < h * 0.50:
                sx += stroke * 3.0
                sy += kick * 2.2
        return sx, sy

    return heal_holes(warp(src, mapper), 1)


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


def preview_strip(frames, pad=4, bg=(12, 48, 58, 255)):
    if not frames:
        return Image.new("RGBA", (8, 8), bg)
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
        walk_src, _ = crop_old(old, old_at, f"{skin}_walk")
        dive_src, _ = crop_old(old, old_at, f"{skin}_dive")
        walks = [walk_frame(walk_src, i, skin) for i in range(WALK_N)]
        swims = [swim_frame(dive_src, i, skin) for i in range(SWIM_N)]
        extras[skin] = (walks, swims)
        for i, im in enumerate(walks):
            add(f"{skin}_walk{i}", im, 64, 168)
        for i, im in enumerate(swims):
            add(f"{skin}_swim{i}", im, 96, 48)

    # Keep every existing cell (C48–C51), then append the new gait frames.
    new_names = {n for n, _, _, _ in items}
    for name, cell in old_at.items():
        if name in new_names:
            continue
        crop, c = crop_old(old, old_at, name)
        add(name, crop, c.get("ax"), c.get("ay"))

    # New frames first so they sit on the top rows (easy to inspect).
    items = items[: 3 * (WALK_N + SWIM_N)] + items[3 * (WALK_N + SWIM_N) :]

    sheet, atlas = pack(items)
    out = ART / "bay.png"
    sheet.save(out, "PNG", optimize=True)
    (ART / "atlas.json").write_text(json.dumps(atlas, indent=2))
    patch_atlas(atlas)

    prev_dir = Path("/tmp/loop52")
    prev_dir.mkdir(exist_ok=True)
    for skin, (walks, swims) in extras.items():
        preview_strip(walks).save(prev_dir / f"{skin}_walk.png")
        preview_strip(swims).save(prev_dir / f"{skin}_swim.png")
    print(f"wrote {out} {out.stat().st_size} bytes {sheet.size} cells={len(atlas)}")


if __name__ == "__main__":
    main()
