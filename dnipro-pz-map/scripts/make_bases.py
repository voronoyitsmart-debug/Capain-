"""Design fictional military bases for the Dnipro map, as OpenStreetMap objects.

    python make_bases.py <map>_osm.json.gz <out.json>

Real military sites are kept off OpenStreetMap in wartime, and rightly: the Dnipro data has
three tiny landuse=military plots and nothing a player would call a base. These are made up,
put on empty fields inside the map (no buildings, housing, water or woods within 60 m, a real
road within 300 m), each with a fence, barracks, headquarters, mess hall, depots, a vehicle
park, an armoury, a checkpoint at the gate, a parade ground, internal roads and a drive out to
the nearest real road. fix_osm.py writes them into the map data, where KnoxMap builds them as it
builds any base: army loot, cellars, the guaranteed rifle.
"""
import gzip
import json
import math
import sys

from shapely.geometry import LineString, Point
from shapely.ops import nearest_points

# (name, centre lat, centre lon) - found by searching the map for empty land (see README)
SITES = [
    ("Воинская часть «Юг» (вымышленная)", 48.40503, 34.87056),
    ("Воинская часть «Север» (вымышленная)", 48.55460, 35.00678),
    ("Воинская часть «Восток» (вымышленная)", 48.52226, 35.10437),
]
HALF = 190            # metres: a base is 380 x 380 m inside its fence

# Buildings in base-local metres: (x0, y0, x1, y1, tags); y grows north, (0,0) is the centre.
# The gate is in the middle of the south fence.
LAYOUT = [
    (-150, 80, -60, 96, {"building": "barracks", "military": "barracks", "building:levels": "3",
                         "name": "Казарма №1"}),
    (-150, 40, -60, 56, {"building": "barracks", "military": "barracks", "building:levels": "3",
                         "name": "Казарма №2"}),
    (-40, 120, 40, 140, {"building": "military", "military": "office", "building:levels": "3",
                         "name": "Штаб"}),
    (60, 80, 110, 108, {"building": "military", "military": "barracks", "building:levels": "1",
                        "name": "Столовая"}),
    (120, 60, 170, 120, {"building": "warehouse", "military": "depot", "building:levels": "1",
                         "name": "Склад РАВ"}),
    (60, 20, 170, 40, {"building": "warehouse", "military": "depot", "building:levels": "1",
                       "name": "Вещевой склад"}),
    (-160, -150, -40, -125, {"building": "garages", "military": "depot", "building:levels": "1",
                             "name": "Автопарк"}),
    (-160, -110, -40, -85, {"building": "garages", "military": "depot", "building:levels": "1",
                            "name": "Автопарк"}),
    (100, -150, 150, -110, {"building": "bunker", "military": "bunker", "building:levels": "1",
                            "name": "Склад вооружения"}),
    (20, -140, 70, -110, {"building": "military", "military": "office", "building:levels": "2",
                          "name": "Медпункт"}),
    (-10, -186, 10, -176, {"building": "military", "military": "checkpoint", "building:levels": "1",
                           "name": "КПП"}),
]
PARADE = (-40, -20, 40, 60)                       # asphalt square in the middle
ROADS = [                                          # internal roads, base-local polylines
    [(0, -190), (0, 150)],                         # gate to HQ
    [(-175, -60), (175, -60)],                     # cross road south
    [(-175, 10), (175, 10)],                       # cross road north
    [(-175, -165), (-175, 165), (175, 165), (175, -165), (-175, -165)],   # ring inside the fence
]


def to_latlon(lat0, lon0, x, y):
    return (lat0 + y / 111320.0, lon0 + x / (111320.0 * math.cos(math.radians(lat0))))


def ring(lat0, lon0, x0, y0, x1, y1):
    pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]
    return [to_latlon(lat0, lon0, x, y) for x, y in pts]


def main(argv):
    feats = json.load(gzip.open(argv[1], "rt", encoding="utf-8"))["features"]
    roads = [LineString([(lo, la) for la, lo in f["geometry"]]) for f in feats
             if f["kind"] == "way" and f["tags"].get("highway") in
             ("trunk", "primary", "secondary", "tertiary", "unclassified", "residential",
              "service", "track")
             and f["geometry"] and not isinstance(f["geometry"][0][0], list)
             and int(f.get("osm_id") or 0) < 90_000_000_000]    # not a base's own roads
    out = []
    for name, lat0, lon0 in SITES:
        base = {"name": name, "ways": []}
        add = base["ways"].append
        add({"tags": {"landuse": "military", "military": "base", "name": name},
             "coords": ring(lat0, lon0, -HALF, -HALF, HALF, HALF)})
        add({"tags": {"barrier": "fence"}, "coords": ring(lat0, lon0, -HALF + 2, -HALF + 2,
                                                          HALF - 2, HALF - 2)})
        for x0, y0, x1, y1, tags in LAYOUT:
            add({"tags": dict(tags), "coords": ring(lat0, lon0, x0, y0, x1, y1)})
        add({"tags": {"highway": "pedestrian", "area": "yes", "surface": "asphalt",
                      "name": "Плац"}, "coords": ring(lat0, lon0, *PARADE)})
        for line in ROADS:
            add({"tags": {"highway": "service", "access": "private"},
                 "coords": [to_latlon(lat0, lon0, x, y) for x, y in line]})
        # the drive out: from the side of the fence nearest a real road, straight to it
        centre = Point(lon0, lat0)
        near = min(roads, key=lambda r: r.distance(centre))
        _, on_road = nearest_points(centre, near)
        kx = 111320.0 * math.cos(math.radians(lat0))
        dx, dy = (on_road.x - lon0) * kx, (on_road.y - lat0) * 111320.0
        reach = max(abs(dx), abs(dy))
        if reach > HALF:
            scale = 175.0 / reach                    # onto the ring road inside the fence
            inner = to_latlon(lat0, lon0, dx * scale, dy * scale)
            add({"tags": {"highway": "service", "name": "Подъезд к воинской части"},
                 "coords": [inner, (on_road.y, on_road.x)]})
            note = f"drive to the road {math.hypot(dx, dy) * (1 - 175.0 / reach):.0f} m"
        else:
            note = "a track already runs into it"
        print(f"{name}: {len(base['ways'])} objects, {note}")
        out.append(base)
    json.dump(out, open(argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv)
