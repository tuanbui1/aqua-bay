#!/usr/bin/env python3
"""Legacy oval baker. Loop 48 reshoot lives in tools/pack-loop48.py."""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "art"
INK = (32, 20, 16, 255)
INK_SOFT = (48, 30, 24, 220)


def rgba(hex_or_t, a=255):
    if isinstance(hex_or_t, tuple):
        if len(hex_or_t) == 4:
            return hex_or_t
        return hex_or_t + (a,)
    h = hex_or_t.lstrip("#")
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def mix(a, b, t):
    a, b = rgba(a), rgba(b)
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(4))


def darken(c, t=0.28):
    return mix(c, (20, 12, 8, 255), t)


def lighten(c, t=0.28):
    return mix(c, (255, 248, 230, 255), t)


class C:
    def __init__(self, w, h, scale=2):
        self.sw, self.sh = w, h
        self.s = scale
        self.W, self.H = w * scale, h * scale
        self.img = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def _xy(self, x, y):
        return x * self.s, y * self.s

    def _bbox(self, cx, cy, rx, ry):
        x, y = self._xy(cx, cy)
        rx, ry = rx * self.s, ry * self.s
        return [x - rx, y - ry, x + rx, y + ry]

    def ellipse(self, cx, cy, rx, ry, fill, outline=INK, ow=2.2):
        fill = rgba(fill) if fill else None
        outline = rgba(outline) if outline else None
        ow = max(1, int(round(ow * self.s)))
        box = self._bbox(cx, cy, rx, ry)
        if fill and outline:
            self.d.ellipse(box, fill=outline)
            pad = ow * 0.52 / self.s
            self.d.ellipse(self._bbox(cx, cy, max(0.4, rx - pad), max(0.4, ry - pad)), fill=fill)
        elif fill:
            self.d.ellipse(box, fill=fill)
        elif outline:
            self.d.ellipse(box, outline=outline, width=ow)

    def rect(self, x, y, w, h, fill, outline=None, ow=1.6, rad=0):
        fill = rgba(fill)
        x0, y0 = self._xy(x, y)
        x1, y1 = self._xy(x + w, y + h)
        box = [x0, y0, x1, y1]
        if rad:
            r = rad * self.s
            if outline:
                self.d.rounded_rectangle(box, radius=r, fill=rgba(outline))
                p = max(1, int(ow * self.s * 0.5))
                self.d.rounded_rectangle([x0 + p, y0 + p, x1 - p, y1 - p], radius=max(1, r - p), fill=fill)
            else:
                self.d.rounded_rectangle(box, radius=r, fill=fill)
        else:
            if outline:
                self.d.rectangle(box, fill=rgba(outline))
                p = max(1, int(ow * self.s * 0.5))
                self.d.rectangle([x0 + p, y0 + p, x1 - p, y1 - p], fill=fill)
            else:
                self.d.rectangle(box, fill=fill)

    def poly(self, pts, fill, outline=INK, ow=2.0):
        fill = rgba(fill)
        xy = [self._xy(p[0], p[1]) for p in pts]
        self.d.polygon(xy, fill=fill)
        if outline:
            loop = xy + [xy[0]]
            self.d.line(loop, fill=rgba(outline), width=max(1, int(round(ow * self.s))), joint="curve")

    def line(self, pts, fill, w=2.0):
        xy = [self._xy(p[0], p[1]) for p in pts]
        self.d.line(xy, fill=rgba(fill), width=max(1, int(round(w * self.s))), joint="curve")

    def capsule(self, x0, y0, x1, y1, r, fill, outline=INK, ow=1.8):
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        pts = [
            (x0 + nx * r, y0 + ny * r),
            (x1 + nx * r, y1 + ny * r),
            (x1 - nx * r, y1 - ny * r),
            (x0 - nx * r, y0 - ny * r),
        ]
        self.poly(pts, fill, outline, ow)
        self.ellipse(x0, y0, r, r, fill, outline, ow)
        self.ellipse(x1, y1, r, r, fill, outline, ow)

    def finish(self):
        if self.s != 1:
            return self.img.resize((self.sw, self.sh), Image.Resampling.LANCZOS)
        return self.img


def eye(c: C, x, y, rx=4.6, ry=5.2, look=0.35, iris="#3a2415"):
    c.ellipse(x + 0.4, y + 0.8, rx * 1.05, ry * 0.92, (20, 12, 10, 70), None)
    c.ellipse(x, y, rx, ry, "#fff8ee", INK, 1.8)
    c.ellipse(x + look, y + 0.3, rx * 0.55, ry * 0.55, iris, INK, 1.1)
    c.ellipse(x + look * 0.6, y + 0.5, rx * 0.28, ry * 0.28, "#1a100c", None)
    c.ellipse(x - rx * 0.32, y - ry * 0.38, rx * 0.22, ry * 0.18, "#fff", None)
    c.ellipse(x + rx * 0.28, y + ry * 0.22, rx * 0.1, ry * 0.08, "#fff", None)
    c.line([(x - rx * 0.85, y - ry * 0.55), (x + rx * 0.7, y - ry * 0.75)], INK, 1.4)


def blush(c: C, x, y):
    c.ellipse(x, y, 3.2, 1.6, (255, 140, 130, 90), None)


def smile(c: C, x, y, w=4.2):
    c.line([(x - w, y), (x - w * 0.2, y + 1.6), (x + w, y + 0.2)], "#c47a62", 1.6)


def mask_visor(c: C, x, y, rx=9.2, ry=5.4):
    c.ellipse(x, y, rx + 1.2, ry + 1.1, "#1a2830", INK, 1.6)
    c.ellipse(x, y, rx, ry, "#5ad0e0", INK, 1.4)
    c.ellipse(x - 2.2, y - 1.6, rx * 0.42, ry * 0.32, (255, 255, 255, 120), None)
    c.rect(x - rx + 1, y + ry * 0.15, rx * 2 - 2, 1.4, (20, 40, 50, 80), None)


def snorkel(c: C, ax, ay, tipx, tipy):
    c.line([(ax, ay), (tipx, tipy), (tipx - 2.4, tipy - 1.2)], "#c4483a", 3.1)
    c.ellipse(tipx - 2.6, tipy - 1.4, 2.3, 2.3, "#e85d4c", INK, 1.2)
    c.ellipse(tipx - 3.2, tipy - 2.0, 0.7, 0.7, "#fff6e8", None)


def flipper(c: C, x, y, ang=0.1, col="#f0b429"):
    pts = [
        (x, y - 3),
        (x + 10, y - 6 + ang * 8),
        (x + 14, y - 1),
        (x + 11, y + 5 + ang * 4),
        (x, y + 3),
    ]
    c.poly(pts, col, INK, 1.6)
    c.line([(x + 2, y), (x + 10, y - 1)], darken(col, 0.2), 1.2)


def hair_clump(c: C, x, y, rx, ry, col, rot_pts=None):
    c.ellipse(x, y, rx, ry, col, INK, 1.6)
    c.ellipse(x - rx * 0.25, y - ry * 0.3, rx * 0.45, ry * 0.35, lighten(col, 0.18), None)


def paint_skip(c: C, pose="stand"):
    walk = 1 if pose == "walk" else 0
    dive = pose == "dive"
    skin, hair = "#f2c4a0", "#3a2415"
    suit, suit_d, stripe = "#2cb8a8", "#1b6e66", "#ffe27a"
    if dive:
        # side-swim, facing right, center ~48,64
        c.ellipse(28, 70, 11, 5.2, "#f0b429", INK, 1.6)
        c.ellipse(22, 62, 10, 4.6, "#f0b429", INK, 1.6)
        c.capsule(34, 58, 22, 68, 3.4, "#243848", INK, 1.5)
        c.capsule(36, 72, 24, 78, 3.4, "#243848", INK, 1.5)
        c.ellipse(50, 64, 18, 12.5, suit, INK, 2.2)
        c.ellipse(46, 60, 8, 4, lighten(suit, 0.25), None)
        c.rect(42, 58, 16, 4.2, stripe, INK, 1.1, 1.5)
        c.rect(30, 54, 8, 18, "#cfd8e3", INK, 1.4, 2)
        c.rect(32, 56, 3, 14, "#8aa0b5", None)
        c.capsule(62, 56, 72, 50, 2.6, skin, INK, 1.4)
        c.capsule(62, 72, 72, 78, 2.6, skin, INK, 1.4)
        c.ellipse(78, 62, 9.4, 8.8, skin, INK, 2.0)
        hair_clump(c, 76, 56, 8.2, 5.4, hair)
        hair_clump(c, 70, 58, 4.4, 4.8, hair)
        hair_clump(c, 82, 58, 3.6, 3.8, hair)
        eye(c, 82, 61, 3.6, 3.8, 0.5)
        c.ellipse(86.4, 64.2, 1.5, 1.1, "#fff6e8", None)
        mask_visor(c, 80, 59, 6.4, 3.6)
        snorkel(c, 84, 56, 88, 46)
        return
    # upright, feet near y=120, center x=48
    lx = -5.5 + walk * 7
    rx = 6.5 - walk * 7
    c.capsule(48 + lx, 86, 48 + lx - 1, 112, 4.2, "#243848", INK, 1.7)
    c.capsule(48 + rx, 86, 48 + rx + 1, 112, 4.2, "#243848", INK, 1.7)
    flipper(c, 48 + lx - 2, 114, -0.2 + walk * 0.15)
    flipper(c, 48 + rx - 2, 114, 0.15 - walk * 0.15)
    swing = 8 if walk else 3
    c.capsule(32, 62, 24, 78 + swing, 3.3, skin, INK, 1.5)
    c.capsule(64, 62, 72, 78 - swing, 3.3, skin, INK, 1.5)
    c.ellipse(48, 70, 16.5, 18, suit, INK, 2.3)
    c.ellipse(44, 64, 7, 5, lighten(suit, 0.28), None)
    c.rect(46.4, 56, 3.2, 26, stripe, None)
    c.ellipse(42, 68, 2.6, 2.6, "#e85d4c", INK, 1.0)
    c.ellipse(54, 74, 3.2, 1.8, "#7ad08a", INK, 1.0)
    c.ellipse(52, 64, 2.0, 2.0, "#fff6e8", INK, 0.9)
    c.rect(36, 58, 24, 5, "#1b6e66", INK, 1.2, 2)
    c.capsule(48, 50, 48, 44, 3.0, skin, INK, 1.5)
    c.ellipse(48, 32, 13.6, 14.4, skin, INK, 2.2)
    c.ellipse(42, 34, 2.6, 3.0, skin, INK, 1.2)
    c.ellipse(54, 34, 2.6, 3.0, skin, INK, 1.2)
    c.ellipse(46, 30, 5.5, 3.6, (255, 220, 190, 70), None)
    # messy chestnut hair + cowlick
    hair_clump(c, 48, 22, 13.2, 8.4, hair)
    hair_clump(c, 36, 28, 5.6, 7.2, hair)
    hair_clump(c, 60, 27, 5.2, 6.8, hair)
    hair_clump(c, 42, 20, 4.4, 4.0, hair)
    c.poly([(46, 14), (50, 4), (53, 15)], hair, INK, 1.4)
    eye(c, 43.2, 33.2, 4.4, 4.8, 0.4)
    eye(c, 54.2, 33.0, 4.4, 4.8, 0.4)
    blush(c, 38.5, 38.5)
    blush(c, 57.5, 38.5)
    c.ellipse(48, 37.6, 1.1, 0.8, "#e0a080", None)
    smile(c, 48.4, 40.6, 3.8)
    mask_visor(c, 48, 24.5, 9.6, 4.2)
    snorkel(c, 58, 22, 64, 10)


def paint_reef(c: C, pose="stand"):
    walk = 1 if pose == "walk" else 0
    dive = pose == "dive"
    skin, hair = "#e8b48a", "#4a2214"
    suit = "#2a9d8f"
    if dive:
        c.ellipse(28, 70, 11, 5.2, "#f0b429", INK, 1.6)
        c.ellipse(22, 62, 10, 4.6, "#f0b429", INK, 1.6)
        c.capsule(34, 58, 22, 68, 3.2, "#243848", INK, 1.5)
        c.capsule(36, 72, 24, 78, 3.2, "#243848", INK, 1.5)
        c.ellipse(50, 64, 17.2, 11.8, suit, INK, 2.2)
        c.ellipse(46, 60, 7, 3.6, lighten(suit, 0.25), None)
        # flowers
        for fx, fy in ((44, 66), (54, 70), (50, 60)):
            c.ellipse(fx, fy, 2.2, 2.2, "#e85d4c", INK, 0.9)
            c.ellipse(fx, fy, 0.8, 0.8, "#ffe27a", None)
        c.rect(30, 54, 8, 18, "#cfd8e3", INK, 1.4, 2)
        c.capsule(62, 56, 71, 50, 2.5, skin, INK, 1.4)
        c.capsule(62, 72, 71, 78, 2.5, skin, INK, 1.4)
        c.ellipse(77, 62, 8.8, 8.4, skin, INK, 2.0)
        hair_clump(c, 74, 54, 8.6, 6.2, hair)
        hair_clump(c, 68, 60, 4.8, 8.4, hair)
        hair_clump(c, 80, 70, 4.2, 7.6, hair)
        c.ellipse(70, 52, 2.2, 2.2, "#e85d4c", INK, 1.0)
        eye(c, 81, 61, 3.5, 3.8, 0.45)
        mask_visor(c, 79, 58.5, 6.2, 3.5)
        snorkel(c, 83, 55, 87, 45)
        return
    lx = -5 + walk * 6.5
    rx = 6 - walk * 6.5
    c.capsule(48 + lx, 86, 48 + lx, 111, 4.0, "#243848", INK, 1.7)
    c.capsule(48 + rx, 86, 48 + rx, 111, 4.0, "#243848", INK, 1.7)
    flipper(c, 48 + lx - 2, 113, -0.15)
    flipper(c, 48 + rx - 2, 113, 0.12)
    swing = 7 if walk else 2
    c.capsule(33, 62, 26, 78 + swing, 3.1, skin, INK, 1.5)
    c.capsule(63, 62, 70, 78 - swing, 3.1, skin, INK, 1.5)
    c.ellipse(48, 70, 15.6, 17.2, suit, INK, 2.3)
    c.ellipse(44, 64, 6.4, 4.6, lighten(suit, 0.28), None)
    for fx, fy in ((40, 68), (50, 74), (56, 66)):
        c.ellipse(fx, fy, 2.4, 2.4, "#e85d4c", INK, 0.9)
        c.ellipse(fx, fy, 0.85, 0.85, "#ffe27a", None)
    c.rect(37, 58, 22, 4.6, "#1b6e66", INK, 1.1, 2)
    c.capsule(48, 50, 48, 44, 2.8, skin, INK, 1.5)
    c.ellipse(48, 32, 13.0, 13.8, skin, INK, 2.2)
    c.ellipse(46, 30, 5, 3.2, (255, 210, 180, 70), None)
    # long hair + ponytail
    hair_clump(c, 48, 21, 13.6, 8.8, hair)
    hair_clump(c, 34, 30, 5.8, 8.6, hair)
    hair_clump(c, 62, 28, 5.4, 8.0, hair)
    hair_clump(c, 32, 48, 4.6, 10.5, hair)
    hair_clump(c, 30, 62, 4.2, 8.4, hair)
    hair_clump(c, 64, 42, 3.6, 7.2, hair)
    c.ellipse(62, 20, 3.0, 3.0, "#e85d4c", INK, 1.1)
    c.ellipse(62, 20, 1.1, 1.1, "#ffe27a", None)
    eye(c, 43.4, 33.0, 4.6, 5.0, 0.35, "#2a1810")
    eye(c, 54.0, 32.8, 4.6, 5.0, 0.35, "#2a1810")
    blush(c, 38.2, 38.2)
    blush(c, 57.6, 38.0)
    smile(c, 48.2, 40.4, 3.6)
    mask_visor(c, 48, 24.2, 9.4, 4.0)
    snorkel(c, 58, 21, 64, 9)


def paint_dino(c: C, pose="stand"):
    walk = 1 if pose == "walk" else 0
    dive = pose == "dive"
    g, gd, cream = "#4ec86a", "#2f7a3a", "#f3ecd0"
    if dive:
        c.ellipse(26, 70, 11, 5.4, "#8fd86a", INK, 1.6)
        c.ellipse(20, 62, 10, 4.8, "#8fd86a", INK, 1.6)
        c.capsule(34, 58, 20, 68, 3.6, gd, INK, 1.5)
        c.capsule(36, 74, 22, 80, 3.6, gd, INK, 1.5)
        c.poly([(18, 64), (4, 70), (16, 76), (28, 68)], g, INK, 1.6)
        c.ellipse(50, 64, 17.5, 13, g, INK, 2.2)
        c.ellipse(52, 68, 10, 6.4, cream, None)
        c.ellipse(42, 60, 2.4, 1.8, gd, None)
        c.ellipse(56, 58, 2.0, 1.6, gd, None)
        c.rect(30, 54, 8, 18, "#cfd8e3", INK, 1.4, 2)
        c.capsule(62, 54, 68, 48, 2.4, g, INK, 1.3)
        c.capsule(62, 74, 68, 80, 2.4, g, INK, 1.3)
        c.ellipse(76, 62, 10.2, 8.8, g, INK, 2.0)
        c.ellipse(82, 64, 6.4, 4.6, cream, INK, 1.4)
        c.poly([(70, 50), (74, 40), (78, 50)], gd, INK, 1.3)
        c.poly([(76, 48), (80, 38), (84, 49)], gd, INK, 1.3)
        eye(c, 78, 59, 3.8, 4.0, 0.4)
        c.ellipse(86, 64.5, 1.4, 1.1, "#fff6e8", None)
        mask_visor(c, 78, 58, 6.6, 3.8)
        snorkel(c, 82, 54, 86, 44)
        return
    lx = -6 + walk * 7
    rx = 7 - walk * 7
    c.capsule(48 + lx, 88, 48 + lx, 112, 4.6, gd, INK, 1.7)
    c.capsule(48 + rx, 88, 48 + rx, 112, 4.6, gd, INK, 1.7)
    flipper(c, 48 + lx - 1, 114, -0.1, "#8fd86a")
    flipper(c, 48 + rx - 1, 114, 0.12, "#8fd86a")
    # tail
    c.poly([(28, 78), (8, 86), (12, 94), (32, 86)], g, INK, 1.8)
    c.ellipse(14, 88, 2.2, 1.6, gd, None)
    swing = 6 if walk else 2
    c.capsule(32, 64, 22, 74 + swing, 3.0, g, INK, 1.4)
    c.capsule(64, 64, 74, 74 - swing, 3.0, g, INK, 1.4)
    c.ellipse(48, 72, 17.8, 19, g, INK, 2.4)
    c.ellipse(48, 78, 11, 10, cream, None)
    c.ellipse(40, 66, 2.8, 2.2, gd, None)
    c.ellipse(56, 70, 3.2, 2.4, gd, None)
    c.rect(34, 58, 8, 20, "#cfd8e3", INK, 1.4, 2)
    c.rect(36, 60, 3, 16, "#8aa0b5", None)
    c.capsule(48, 52, 48, 46, 3.1, g, INK, 1.5)
    c.ellipse(48, 32, 14.6, 15.2, g, INK, 2.2)
    c.ellipse(58, 36, 7.4, 5.2, cream, INK, 1.5)
    c.ellipse(62.4, 35.2, 1.3, 1.1, "#fff6e8", None)
    c.ellipse(61.2, 33.4, 0.7, 0.55, INK, None)
    c.ellipse(64.0, 33.6, 0.7, 0.55, INK, None)
    c.poly([(38, 18), (42, 6), (47, 18)], gd, INK, 1.4)
    c.poly([(47, 16), (52, 4), (57, 17)], gd, INK, 1.4)
    c.poly([(56, 18), (62, 8), (64, 20)], gd, INK, 1.4)
    eye(c, 42.6, 31.6, 5.0, 5.4, 0.4)
    eye(c, 53.8, 31.4, 5.0, 5.4, 0.4)
    smile(c, 56.5, 39.2, 2.6)
    mask_visor(c, 48, 24.8, 10.0, 4.4)
    snorkel(c, 60, 22, 66, 10)


def paint_person(c: C, kind="generic", shirt="#3d8bfd", hair="#3a2415", skin="#f0c2a0", hair_cut=0):
    if kind == "kid":
        c.capsule(42, 82, 40, 100, 3.0, "#3a3a48", INK, 1.4)
        c.capsule(54, 82, 56, 100, 3.0, "#3a3a48", INK, 1.4)
        c.ellipse(40, 102, 3.8, 1.7, "#1a1a22", INK, 1.0)
        c.ellipse(56, 102, 3.8, 1.7, "#1a1a22", INK, 1.0)
        c.capsule(34, 62, 30, 76, 2.4, skin, INK, 1.3)
        c.capsule(62, 62, 66, 76, 2.4, skin, INK, 1.3)
        c.rect(34, 56, 28, 26, shirt, INK, 1.8, 7)
        c.ellipse(48, 32, 11.6, 12.4, skin, INK, 1.9)
        hair_clump(c, 48, 24, 11, 6.8, hair)
        eye(c, 43.4, 33, 3.8, 4.2, 0.3)
        eye(c, 53.0, 33, 3.8, 4.2, 0.3)
        blush(c, 39, 38)
        blush(c, 57, 38)
        smile(c, 48, 39.6, 3.0)
        return
    # chunky chibi — reads at ~40px
    c.capsule(38, 78, 36, 102, 5.0, "#3a3a48", INK, 1.6)
    c.capsule(58, 78, 60, 102, 5.0, "#3a3a48", INK, 1.6)
    c.ellipse(36, 104, 6.0, 2.4, "#1a1a22", INK, 1.1)
    c.ellipse(60, 104, 6.0, 2.4, "#1a1a22", INK, 1.1)
    c.capsule(28, 58, 20, 78, 3.6, skin, INK, 1.5)
    c.capsule(68, 58, 76, 78, 3.6, skin, INK, 1.5)
    c.ellipse(20, 80, 3.4, 3.0, skin, INK, 1.2)
    c.ellipse(76, 80, 3.4, 3.0, skin, INK, 1.2)
    c.rect(28, 50, 40, 34, shirt, INK, 2.1, 10)
    c.ellipse(40, 58, 9, 6, lighten(shirt, 0.22), None)
    if kind == "maya":
        for fx, fy in ((40, 64), (50, 70), (56, 62)):
            c.ellipse(fx, fy, 2.3, 2.3, "#ffd24a" if fx == 40 else "#fff6e8" if fx == 50 else "#e85d4c", INK, 0.8)
    if kind == "nico":
        c.rect(34, 52, 28, 6, "#fff6e8", INK, 1.1, 1)
        c.rect(46, 58, 4, 16, "#1b3a6b", None)
    c.capsule(48, 50, 48, 44, 2.6, skin, INK, 1.4)
    hx, hy = 48, 30
    c.ellipse(hx, hy, 12.4, 13.2, skin, INK, 2.0)
    c.ellipse(hx - 1.4, hy - 2, 4.6, 3.0, (255, 220, 190, 60), None)
    if hair_cut == 1 or kind == "maya":
        hair_clump(c, hx, hy - 8, 12.4, 8.2, hair)
        hair_clump(c, hx - 12, hy + 2, 5.2, 8.8, hair)
        hair_clump(c, hx + 12, hy, 4.8, 9.4, hair)
        hair_clump(c, hx - 11, hy + 16, 4.2, 8.0, hair)
    elif hair_cut == 2 or kind == "jun":
        hair_clump(c, hx, hy - 10, 11.2, 7.0, hair)
        hair_clump(c, hx - 10, hy - 2, 5.4, 5.6, hair)
        hair_clump(c, hx + 10, hy - 2, 5.4, 5.6, hair)
    else:
        hair_clump(c, hx, hy - 8, 12.0, 7.4, hair)
        hair_clump(c, hx - 8, hy - 2, 4.6, 4.8, hair)
        hair_clump(c, hx + 8, hy - 4, 4.2, 4.4, hair)
    eye(c, hx - 4.6, hy + 1.2, 4.0, 4.4, 0.32)
    eye(c, hx + 5.0, hy + 1.0, 4.0, 4.4, 0.32)
    blush(c, hx - 9.2, hy + 7)
    blush(c, hx + 9.4, hy + 7)
    smile(c, hx + 0.4, hy + 8.6, 3.4)
    if kind == "maya":
        c.ellipse(hx, hy - 14, 14.5, 3.2, "#e8c04a", INK, 1.5)
        c.rect(hx - 8, hy - 22, 16, 9, "#e8c04a", INK, 1.3, 2)
        c.ellipse(hx, hy - 22, 2.2, 2.2, "#e85d4c", INK, 0.8)
    elif kind == "nico":
        c.rect(hx - 8, hy - 20, 16, 7, "#f4efe6", INK, 1.3, 1)
        c.ellipse(hx, hy - 12.4, 13.2, 2.6, "#1b3a6b", INK, 1.2)
        c.rect(hx - 2.2, hy - 24, 4.4, 4, "#1b3a6b", INK, 1.0)
    elif kind == "jun":
        c.rect(hx - 8, hy - 14, 16, 4.2, "#e85d4c", INK, 1.2, 1)
        c.ellipse(hx + 5, hy - 10.6, 10.2, 2.6, "#e85d4c", INK, 1.1)
    elif kind == "cashier":
        c.ellipse(hx, hy - 14, 13.2, 3.0, "#c4483a", INK, 1.4)
        c.rect(hx - 7.5, hy - 21, 15, 8, "#c4483a", INK, 1.2, 2)
    elif kind == "vip":
        c.poly(
            [(hx - 10, hy - 14), (hx - 9, hy - 26), (hx - 4, hy - 18),
             (hx, hy - 28), (hx + 4, hy - 18), (hx + 9, hy - 26), (hx + 10, hy - 14)],
            "#ffd24a", INK, 1.4,
        )
        c.ellipse(hx, hy - 26, 1.6, 1.6, "#e85d4c", INK, 0.8)
        c.rect(hx - 8, hy + 2, 16, 3.2, "#1a1a22", INK, 1.0, 1)
        c.rect(hx - 7, hy + 2.4, 6, 2.2, "#3a4860", None)
        c.rect(hx + 1, hy + 2.4, 6, 2.2, "#3a4860", None)


def fish_eye(c: C, x, y, s=1.0, look=0.4):
    c.ellipse(x, y, 4.4 * s, 4.6 * s, "#fff8ee", INK, 1.6)
    c.ellipse(x + look * s, y + 0.2 * s, 2.3 * s, 2.4 * s, "#1a120c", None)
    c.ellipse(x - 1.4 * s, y - 1.6 * s, 1.15 * s, 1.0 * s, "#fff", None)
    c.ellipse(x + 1.6 * s, y + 1.2 * s, 0.45 * s, 0.4 * s, "#fff", None)


def paint_clown(c: C):
    # tail
    c.poly([(18, 32), (4, 16), (10, 32), (4, 48)], "#d45a12", INK, 1.8)
    c.poly([(36, 16), (48, 4), (58, 16), (46, 20)], "#e07020", INK, 1.6)
    c.poly([(40, 48), (52, 58), (62, 46), (48, 44)], "#c44810", INK, 1.5)
    c.ellipse(52, 40, 7.2, 3.2, "#f08a2a", INK, 1.3)
    c.ellipse(50, 32, 22, 14.5, "#f08a2a", INK, 2.2)
    c.ellipse(46, 26, 10, 5, lighten("#f08a2a", 0.22), None)
    for x, w in ((36, 4.2), (50, 3.6), (64, 3.2)):
        c.rect(x, 20, w, 24, "#fff6e8", INK, 1.2, 2)
        c.rect(x + 0.6, 21, 1.1, 22, "#1a0c06", None)
        c.rect(x + w - 1.6, 21, 1.1, 22, "#1a0c06", None)
    fish_eye(c, 66, 28, 1.05, 0.5)


def paint_tang(c: C):
    c.poly([(22, 32), (6, 12), (12, 32), (6, 52)], "#ffe14a", INK, 1.8)
    c.poly([(40, 10), (58, 2), (70, 16), (52, 20)], "#2f7dff", INK, 1.6)
    c.poly([(42, 54), (60, 62), (70, 48), (52, 44)], "#2f7dff", INK, 1.6)
    c.ellipse(52, 32, 20, 16.5, "#2f7dff", INK, 2.2)
    c.ellipse(48, 26, 9, 6, lighten("#2f7dff", 0.18), None)
    c.poly([(70, 22), (86, 16), (84, 32), (86, 48), (70, 42)], "#ffe14a", INK, 1.8)
    c.ellipse(30, 32, 3.2, 4.8, "#10224a", INK, 1.1)
    fish_eye(c, 64, 28, 1.0, 0.45)


def paint_gold(c: C):
    c.poly([(16, 32), (2, 10), (10, 32), (2, 54), (16, 32)], "#ff8a2b", INK, 1.8)
    c.poly([(8, 18), (-2, 6), (14, 22)], "#ffd27a", INK, 1.4)
    c.poly([(8, 46), (-2, 58), (14, 42)], "#ffd27a", INK, 1.4)
    c.poly([(38, 12), (52, 0), (64, 14)], "#ff8a2b", INK, 1.5)
    c.ellipse(52, 33, 21, 16, "#ff8a2b", INK, 2.2)
    c.ellipse(50, 38, 12, 7, "#ffd27a", None)
    c.ellipse(46, 26, 8, 5, lighten("#ff8a2b", 0.25), None)
    fish_eye(c, 66, 28, 1.1, 0.4)


def paint_koi(c: C):
    c.poly([(14, 32), (0, 16), (8, 32), (0, 48)], "#f4f0ea", INK, 1.7)
    c.ellipse(50, 32, 24, 13.5, "#f4f0ea", INK, 2.2)
    c.ellipse(40, 26, 8, 5.5, "#e23b2f", INK, 1.2)
    c.ellipse(58, 36, 7, 4.8, "#e23b2f", INK, 1.2)
    c.ellipse(52, 24, 4.2, 3.2, "#f08a2a", INK, 1.0)
    c.ellipse(46, 26, 9, 4, (255, 255, 255, 80), None)
    c.line([(70, 36), (78, 40)], INK, 1.4)
    c.line([(70, 28), (78, 24)], INK, 1.4)
    fish_eye(c, 68, 28, 1.05, 0.35)


def paint_turtle(c: C):
    c.ellipse(36, 40, 10, 4.2, "#2a5230", INK, 1.4)
    c.ellipse(36, 24, 10, 4.2, "#2a5230", INK, 1.4)
    c.ellipse(22, 38, 6.4, 3.0, "#2a5230", INK, 1.3)
    c.ellipse(22, 26, 6.4, 3.0, "#2a5230", INK, 1.3)
    c.ellipse(44, 32, 20, 15.5, "#4e8e44", INK, 2.2)
    c.ellipse(44, 32, 8, 6.5, "#7cbc62", INK, 1.2)
    for a in range(6):
        ang = a / 6 * math.pi * 2 + 0.3
        c.ellipse(44 + math.cos(ang) * 10, 32 + math.sin(ang) * 8, 5.2, 4.0, "#7cbc62", "#c6e38a", 1.3)
    c.ellipse(66, 32, 8.2, 5.6, "#5a9a4a", INK, 1.6)
    c.poly([(72, 30), (78, 32), (72, 34)], "#3a6a34", INK, 1.1)
    fish_eye(c, 68, 30, 0.85, 0.3)


def paint_horse(c: C):
    # vertical seahorse, center
    c.poly([(50, 50), (62, 58), (50, 62), (40, 56)], "#e8a03a", INK, 1.6)
    c.capsule(48, 46, 48, 20, 5.4, "#e8a03a", INK, 1.8)
    c.ellipse(50, 16, 8.4, 8.0, "#e8a03a", INK, 1.8)
    c.poly([(56, 16), (68, 14), (56, 20)], "#e8a03a", INK, 1.3)
    c.poly([(42, 28), (30, 22), (42, 36)], "#ffe27a", INK, 1.3)
    for y in (24, 32, 40):
        c.ellipse(48, y, 2.0, 1.4, "#c47820", None)
    fish_eye(c, 52, 14.5, 0.85, 0.25)


def paint_puffer(c: C):
    c.ellipse(48, 33, 22, 20, "#f0d24a", INK, 2.2)
    c.ellipse(44, 28, 10, 7, lighten("#f0d24a", 0.25), None)
    for i in range(10):
        a = i / 10 * math.pi * 2
        c.ellipse(48 + math.cos(a) * 16, 33 + math.sin(a) * 14, 1.1, 1.1, "#7ad08a", INK, 0.8)
    c.poly([(24, 32), (10, 24), (12, 34)], "#f0d24a", INK, 1.3)
    c.poly([(48, 14), (54, 6), (58, 16)], "#f0d24a", INK, 1.3)
    fish_eye(c, 60, 28, 1.15, 0.35)
    smile(c, 58, 36, 3.2)


def paint_angel(c: C):
    c.poly([(48, 4), (70, 32), (48, 60), (26, 32)], "#f4e8c8", INK, 2.0)
    c.poly([(48, 8), (64, 32), (48, 56), (32, 32)], "#ffe27a", None)
    c.rect(44, 10, 5, 44, "#e85d4c", INK, 1.1)
    c.rect(36, 18, 4, 28, "#2a1a12", INK, 1.0)
    c.poly([(26, 32), (8, 14), (16, 32), (8, 50)], "#f4e8c8", INK, 1.5)
    fish_eye(c, 60, 28, 1.0, 0.4)


def paint_octo(c: C):
    cols = ["#c45ec8", "#b44eb8", "#d470d4"]
    for i in range(8):
        a = (i / 8) * math.pi + 0.2
        x1 = 48 + math.cos(a) * 8
        y1 = 40 + math.sin(a) * 6
        x2 = 48 + math.cos(a) * 26
        y2 = 40 + math.sin(a) * 20 + (i % 3) * 2
        c.capsule(x1, y1, x2, y2, 2.4, cols[i % 3], INK, 1.3)
        c.ellipse(x2, y2, 1.6, 1.6, "#ffb0e0", None)
    c.ellipse(48, 30, 16, 14, "#c45ec8", INK, 2.1)
    c.ellipse(44, 26, 7, 5, lighten("#c45ec8", 0.2), None)
    fish_eye(c, 42, 28, 0.95, 0.25)
    fish_eye(c, 56, 28, 0.95, -0.15)


def paint_crab(c: C):
    for i, ox in enumerate((-16, -6, 6, 16)):
        c.capsule(48 + ox, 40, 48 + ox + ( -4 if ox < 0 else 4), 52, 1.6, "#c4483a", INK, 1.2)
    c.ellipse(48, 36, 18, 12, "#e85d4c", INK, 2.0)
    c.ellipse(46, 33, 8, 5, lighten("#e85d4c", 0.2), None)
    # claws
    c.ellipse(22, 28, 8.5, 6.2, "#e85d4c", INK, 1.6)
    c.ellipse(74, 28, 8.5, 6.2, "#e85d4c", INK, 1.6)
    c.poly([(16, 24), (10, 18), (22, 26)], "#e85d4c", INK, 1.2)
    c.poly([(80, 24), (86, 18), (74, 26)], "#e85d4c", INK, 1.2)
    c.capsule(42, 24, 40, 16, 1.5, "#e85d4c", INK, 1.1)
    c.capsule(54, 24, 56, 16, 1.5, "#e85d4c", INK, 1.1)
    fish_eye(c, 40, 14, 0.8, 0.2)
    fish_eye(c, 56, 14, 0.8, 0.2)


def paint_squid(c: C):
    for i in range(6):
        a = -0.8 + i * 0.32
        c.capsule(48, 44, 48 + math.sin(a) * 16, 60 + i * 0.6, 1.7, "#7ad0e8", INK, 1.2)
    c.capsule(40, 48, 28, 62, 1.5, "#7ad0e8", INK, 1.2)
    c.capsule(56, 48, 68, 62, 1.5, "#7ad0e8", INK, 1.2)
    c.ellipse(48, 28, 13, 18, "#7ad0e8", INK, 2.0)
    c.poly([(34, 24), (22, 16), (36, 32)], "#5ab8d0", INK, 1.3)
    c.poly([(62, 24), (74, 16), (60, 32)], "#5ab8d0", INK, 1.3)
    c.ellipse(48, 36, 7, 6, "#ffe8a8", None)
    fish_eye(c, 42, 24, 0.9, 0.25)
    fish_eye(c, 54, 24, 0.9, -0.15)


def paint_dolphin(c: C):
    c.poly([(20, 32), (6, 20), (12, 32), (8, 44)], "#7aa0c8", INK, 1.6)
    c.poly([(48, 16), (56, 4), (62, 18)], "#7aa0c8", INK, 1.5)
    c.ellipse(50, 34, 24, 12.5, "#7aa0c8", INK, 2.1)
    c.ellipse(52, 40, 14, 5.2, "#fff6e8", None)
    c.poly([(70, 32), (84, 28), (78, 36)], "#7aa0c8", INK, 1.3)
    fish_eye(c, 68, 30, 0.95, 0.4)
    smile(c, 74, 36, 2.8)


def paint_whale(c: C):
    c.poly([(12, 34), (0, 24), (6, 34), (0, 44)], "#4a6a78", INK, 1.5)
    c.ellipse(48, 34, 28, 13.5, "#4a6a78", INK, 2.1)
    c.ellipse(50, 40, 16, 5.5, "#fff6e8", None)
    c.poly([(46, 20), (54, 8), (60, 22)], "#4a6a78", INK, 1.4)
    c.poly([(70, 40), (86, 46), (70, 44)], "#4a6a78", INK, 1.3)
    for i in range(14):
        c.ellipse(24 + (i % 7) * 7, 26 + (i // 7) * 7, 1.5, 1.5, "#fff6e8", None)
    c.rect(62, 31, 16, 2.2, "#122028", None)
    fish_eye(c, 70, 28, 0.9, 0.3)


FISH_PAINT = [
    paint_clown, paint_tang, paint_gold, paint_koi, paint_turtle,
    paint_horse, paint_puffer, paint_angel, paint_octo, paint_crab,
    paint_squid, paint_dolphin, paint_whale,
]


def paint_horizon(c: C):
    # 320 x 90 logical, distant coast
    # hills
    c.poly([(-4, 70), (40, 38), (90, 52), (140, 30), (200, 48), (250, 28), (324, 58), (324, 90), (-4, 90)], "#6a9a78", None)
    c.poly([(0, 78), (70, 50), (120, 64), (180, 44), (260, 60), (320, 50), (320, 90), (0, 90)], "#4e7e62", None)
    # town blocks
    for i, (x, h, w) in enumerate([(48, 22, 14), (66, 30, 12), (82, 18, 16), (200, 26, 14), (218, 34, 12), (236, 20, 18), (168, 16, 10)]):
        c.rect(x, 62 - h, w, h, "#d8c4a0" if i % 2 == 0 else "#c8b090", INK, 1.1, 1)
        for wy in range(3):
            for wx in range(2):
                c.rect(x + 2 + wx * 5, 62 - h + 3 + wy * 6, 3, 3, "#ffe27a" if (i + wy) % 3 else "#8ab", None)
    # pier sheds
    c.rect(118, 50, 28, 18, "#c45c4a", INK, 1.2, 1)
    c.poly([(114, 50), (132, 38), (150, 50)], "#8b3a2a", INK, 1.2)
    c.rect(148, 54, 18, 14, "#e8c04a", INK, 1.1, 1)
    # boats
    c.poly([(24, 80), (40, 76), (56, 80), (40, 84)], "#5a3a22", INK, 1.1)
    c.rect(38, 68, 2.4, 10, "#fff6e8", INK, 0.8)
    c.poly([(254, 82), (274, 78), (294, 82), (274, 86)], "#1b4d6b", INK, 1.1)
    c.rect(272, 70, 2.2, 10, "#fff6e8", INK, 0.8)
    # trees
    for x in (28, 100, 190, 256, 300):
        c.rect(x, 58, 3, 10, "#5a3618", None)
        c.ellipse(x + 1.5, 54, 7, 6, "#3d8b4a", INK, 1.0)


def paint_post(c: C):
    c.rect(10, 4, 12, 72, "#6b4423", INK, 1.6, 2)
    c.rect(10, 4, 4, 72, lighten("#6b4423", 0.18), None)
    c.rect(8, 2, 16, 8, "#8a5a30", INK, 1.4, 2)
    for y in (20, 36, 52):
        c.ellipse(14, y, 2.2, 1.4, "#4a2a12", None)
    c.ellipse(18, 64, 3.2, 2.2, "#7a8a4a", INK, 0.9)
    c.ellipse(12, 70, 2.6, 1.8, "#6a7a3a", INK, 0.8)
    c.rect(8, 68, 16, 6, (10, 40, 50, 80), None)


def paint_crown(c: C):
    c.poly([(6, 18), (8, 4), (14, 12), (20, 2), (26, 12), (32, 4), (34, 18)], "#ffd24a", INK, 1.5)
    c.ellipse(20, 4, 2.2, 2.2, "#e85d4c", INK, 0.8)


def paint_shades(c: C):
    c.rect(4, 6, 32, 10, "#1a1a22", INK, 1.2, 2)
    c.rect(6, 7.5, 12, 7, "#3a4860", None)
    c.rect(22, 7.5, 12, 7, "#3a4860", None)


def cell(name, w, h, painter, atlas, sheet_draw, x, y, row_h, max_w):
    img = painter()
    if x + w > max_w:
        x = 0
        y += row_h
        row_h = 0
    sheet_draw.paste(img, (x, y), img)
    atlas[name] = {"x": x, "y": y, "w": w, "h": h}
    return x + w + 2, y, max(row_h, h + 2)


def main():
    ART.mkdir(parents=True, exist_ok=True)
    atlas = {}
    # generous sheet
    SW, SH = 1400, 900
    sheet = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
    x = y = 2
    row_h = 0

    def add(name, w, h, fn):
        nonlocal x, y, row_h
        c = C(w, h, 2)
        fn(c)
        img = c.finish()
        if x + w + 2 > SW:
            x = 2
            y += row_h
            row_h = 0
        sheet.paste(img, (x, y), img)
        atlas[name] = {"x": x, "y": y, "w": w, "h": h, "ax": w / 2, "ay": h * 0.72}
        x += w + 2
        row_h = max(row_h, h + 2)

    for skin, fn in (("skip", paint_skip), ("reef", paint_reef), ("dino", paint_dino)):
        for pose in ("stand", "walk", "dive"):
            add(f"{skin}_{pose}", 96, 128, lambda cc, f=fn, p=pose: f(cc, p))
            if pose == "dive":
                atlas[f"{skin}_{pose}"]["ay"] = 64
                atlas[f"{skin}_{pose}"]["ax"] = 50

    for i, fn in enumerate(FISH_PAINT):
        add(f"fish{i}", 96, 64, lambda cc, f=fn: f(cc))
        atlas[f"fish{i}"]["ay"] = 32
        atlas[f"fish{i}"]["ax"] = 50

    people = [
        ("maya", "maya", "#1b6b5a", "#3a2415", "#d0a07a", 1),
        ("nico", "nico", "#3d8bfd", "#1b1b1b", "#f0c2a0", 0),
        ("jun", "jun", "#f0b429", "#8a4a1a", "#f3d3b4", 2),
        ("cashier", "cashier", "#1b4d6b", "#2a1a12", "#d0a07a", 0),
        ("vip", "vip", "#e6c34a", "#1b1b1b", "#f0c2a0", 0),
        ("kid", "kid", "#e85d4c", "#3a2415", "#f3d3b4", 0),
        ("g0", "generic", "#e85d4c", "#3a2415", "#f0c2a0", 0),
        ("g1", "generic", "#3d8bfd", "#1b1b1b", "#d0a07a", 1),
        ("g2", "generic", "#f0b429", "#8a4a1a", "#8d5a3a", 2),
        ("g3", "generic", "#7ad08a", "#d8c07a", "#f3d3b4", 0),
        ("g4", "generic", "#c86bde", "#3a2415", "#f0c2a0", 1),
        ("g5", "generic", "#f2789f", "#1b1b1b", "#d0a07a", 2),
    ]
    for name, kind, shirt, hair, skin, cut in people:
        add(name, 80, 112, lambda cc, k=kind, s=shirt, h=hair, sk=skin, cu=cut: paint_person(cc, k, s, h, sk, cu))
        atlas[name]["ay"] = 96

    add("horizon", 320, 90, paint_horizon)
    atlas["horizon"]["ay"] = 90
    add("post", 32, 80, paint_post)
    atlas["post"]["ay"] = 80
    add("crown", 40, 32, paint_crown)
    atlas["crown"]["ay"] = 28
    add("shades", 40, 20, paint_shades)
    atlas["shades"]["ay"] = 12

    # crop unused
    bbox = sheet.getbbox()
    if bbox:
        sheet = sheet.crop((0, 0, min(SW, bbox[2] + 4), min(SH, bbox[3] + 4)))

    out = ART / "bay.png"
    sheet.save(out, "PNG", optimize=True)
    (ART / "atlas.json").write_text(json.dumps(atlas, indent=2))

    # contact sheet on teal so we can QA
    prev = Image.new("RGBA", (sheet.width, sheet.height), (12, 70, 86, 255))
    prev.paste(sheet, (0, 0), sheet)
    prev.save(ART / "preview.png", "PNG", optimize=True)
    print(f"wrote {out} {out.stat().st_size} bytes  {sheet.size}  cells={len(atlas)}")


if __name__ == "__main__":
    main()
