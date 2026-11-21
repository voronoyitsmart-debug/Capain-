"""Fix known OpenStreetMap tagging errors in the Dnipro extract before KnoxMap reads it.

usage: python -I fix_osm.py <in.osm.pbf> <out.osm.pbf>

- A water area (natural=water / waterway=riverbank / landuse=reservoir) that also carries a
  highway=* tag is drawn by KnoxMap as a road surface.  The Dniprovske reservoir relation
  (r21217234) has highway=residential on it, which paved the whole Dnipro river with asphalt.
"""
import sys
import osmium

WATER = (("natural", "water"), ("waterway", "riverbank"), ("landuse", "reservoir"))
fixed = []

# Landmarks OpenStreetMap leaves without a storey count (or with a broken one); without
# these KnoxMap would guess them from the neighbours and the Parus would come out at five.
# (way id) -> tags to set / None to delete
OVERRIDES = {
    ("r", 2828442): {"building:levels": "28"},   # Hotel Parus: 32 floors, tower part 28 (114 m)
    ("r", 3206479): {"building:levels": "20"},   # Menorah centre, tallest tower 20-22 floors (77 m)
    32202196: {"building:levels": "4"},          # Dnipro-Holovnyi railway station
    1331908773: {"building:levels": "5"},        # Most City centre (mall)
    ("r", 6428027): {"building:levels": "2", "height": None},   # Transfiguration Cathedral: height=0.01 in OSM
    32232958: {"building:levels": "2"},          # Dnipro International Airport terminal
}

def _clean(o, kind="w"):
    tags = dict(o.tags)
    key = o.id if kind == "w" else (kind, o.id)
    if key in OVERRIDES:
        for k, v in OVERRIDES[key].items():
            if v is None:
                tags.pop(k, None)
            else:
                tags[k] = v
        fixed.append(("Way", o.id, tags.get("name", ""), "override " + str(OVERRIDES[key])))
        o = o.replace(tags=tags)
        tags = dict(tags)
    if "highway" in tags and any(tags.get(k) == v for k, v in WATER):
        fixed.append((o.__class__.__name__, o.id, tags.get("name", ""), tags["highway"]))
        del tags["highway"]
        return o.replace(tags=tags)
    return o

class Fix(osmium.SimpleHandler):
    def __init__(self, writer):
        super().__init__(); self.w = writer
    def node(self, n): self.w.add_node(n)
    def way(self, w): self.w.add_way(_clean(w))
    def relation(self, r): self.w.add_relation(_clean(r, "r"))

writer = osmium.SimpleWriter(sys.argv[2], overwrite=True)
try:
    Fix(writer).apply_file(sys.argv[1])
finally:
    writer.close()
for f in fixed:
    print("%s %d %s: %s" % (f[0], f[1], f[2], f[3]))
