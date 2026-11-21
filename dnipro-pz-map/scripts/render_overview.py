"""Draw a generated KnoxMap map with every building on it, coloured by what it is.

    python render_overview.py <map folder> <out.png> [max side px] [x0 y0 x1 y1 tiles]

The terrain is KnoxMap's own <map>_preview.png; buildings come from <map>_placements.csv
(one rectangle per lot, the colour by kind, darker = taller). Pure PIL, no game files.
"""
import csv
import os
import sys

from PIL import Image, ImageDraw, ImageFont

Image.MAX_IMAGE_PIXELS = None

KIND = {
    "apartment": (214, 96, 77), "house": (240, 196, 120), "shop": (80, 150, 220),
    "restaurant": (80, 150, 220), "mall": (40, 100, 200), "civic": (150, 110, 200),
    "school": (240, 140, 200), "medical": (240, 240, 240), "church": (255, 215, 0),
    "industrial": (110, 110, 120), "garage": (90, 80, 70), "shed": (120, 105, 90),
    "police": (30, 60, 160), "fire": (220, 30, 30), "stadium": (60, 160, 90),
    "library": (150, 110, 200), "military": (90, 110, 60),
}
LEGEND = [("apartment", "многоквартирные"), ("house", "частные дома"), ("shop", "магазины"),
          ("civic", "общественные"), ("school", "школы, вузы"), ("medical", "медицина"),
          ("church", "храмы"), ("industrial", "промышленность"), ("garage", "гаражи")]


def main(argv):
    folder, out = argv[1], argv[2]
    side = int(argv[3]) if len(argv) > 3 else 4000
    name = os.path.basename(os.path.normpath(folder))
    rows = list(csv.DictReader(open(os.path.join(folder, f"{name}_placements.csv"), encoding="utf-8")))
    base = Image.open(os.path.join(folder, f"{name}_preview.png")).convert("RGB")
    info_w = info_h = None
    import json
    try:
        info = json.load(open(os.path.join(folder, f"{name}_info.json"), encoding="utf-8"))
        info_w, info_h = info["width_tiles"], info["height_tiles"]
    except (OSError, KeyError, ValueError):
        info_w, info_h = base.size
    box = [int(v) for v in argv[4:8]] if len(argv) >= 8 else [0, 0, info_w, info_h]
    bw, bh = box[2] - box[0], box[3] - box[1]
    scale = min(side / bw, side / bh)
    W, H = max(1, int(bw * scale)), max(1, int(bh * scale))
    # crop the preview to the same box (the preview may be downscaled from the tiles)
    px = base.size[0] / info_w
    crop = base.crop((int(box[0] * px), int(box[1] * px), int(box[2] * px), int(box[3] * px)))
    img = crop.resize((W, H), Image.BILINEAR)
    img = Image.blend(img, Image.new("RGB", img.size, (30, 30, 30)), 0.35)
    d = ImageDraw.Draw(img)
    for r in sorted(rows, key=lambda r: int(r["levels"])):
        x, y, w, h = int(r["tile_x"]), int(r["tile_y"]), int(r["width"]), int(r["height"])
        if x + w < box[0] or y + h < box[1] or x > box[2] or y > box[3]:
            continue
        col = KIND.get(r["kind"], (200, 200, 200))
        lv = int(r["levels"])
        k = max(0.45, 1.0 - 0.035 * (lv - 1))
        col = tuple(int(c * k) for c in col)
        x0, y0 = (x - box[0]) * scale, (y - box[1]) * scale
        x1, y1 = x0 + max(0.0, w * scale - 1), y0 + max(0.0, h * scale - 1)
        d.rectangle([x0, y0, x1, y1], fill=col)
    # legend
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", max(14, W // 90))
    except OSError:
        font = ImageFont.load_default()
    fs = max(14, W // 90)
    lx, ly = 10, 10
    d.rectangle([lx - 5, ly - 5, lx + fs * 13, ly + (fs + 6) * len(LEGEND) + 5], fill=(20, 20, 20))
    for i, (kind, label) in enumerate(LEGEND):
        yy = ly + i * (fs + 6)
        d.rectangle([lx, yy, lx + fs, yy + fs], fill=KIND[kind])
        d.text((lx + fs + 8, yy - 2), label, fill=(240, 240, 240), font=font)
    img.save(out)
    print(f"{out}: {W}x{H}, {len(rows)} buildings")


if __name__ == "__main__":
    main(sys.argv)
