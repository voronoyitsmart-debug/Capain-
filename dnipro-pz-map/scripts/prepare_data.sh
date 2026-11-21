#!/usr/bin/env bash
# How data/dnipro_area_fixed.osm.pbf was made (Linux, needs osmium-tool and KnoxMap's .venv python).
# Run it again to refresh the map data to today's OpenStreetMap.
#
# Why six oblasts and not one: the Dnipro river through the city is the Dniprovske reservoir,
# one huge multipolygon running down into Zaporizhzhia oblast. A single-oblast extract cuts it,
# the polygon cannot be closed and the river disappears (KnoxMap drew it as asphalt).
# "--strategy smart" keeps every multipolygon that touches the box complete.
set -euo pipefail
OUT=${1:-data}
PY=${PY:-python3}
mkdir -p "$OUT/raw"
BASE=https://download.openstreetmap.fr/extracts/europe/ukraine
for o in dnipropetrovsk zaporizhia poltava kharkiv donetsk kirovohrad; do
  curl -sf -o "$OUT/raw/${o}.osm.pbf" "$BASE/${o}_oblast-latest.osm.pbf"
done
osmium merge -O -o "$OUT/raw/merged.osm.pbf" "$OUT"/raw/{dnipropetrovsk,zaporizhia,poltava,kharkiv,donetsk,kirovohrad}.osm.pbf
# the extracts are cut on different days: keep only the newest version of every object
osmium time-filter -O -o "$OUT/raw/current.osm.pbf" "$OUT/raw/merged.osm.pbf"
# Dnipro, Samar, Pidhorodne, Obukhivka ... with a margin round the map box
osmium extract -O --strategy smart -S types=multipolygon,boundary,route \
  -b 34.55,48.10,35.55,48.85 -o "$OUT/raw/dnipro_area.osm.pbf" "$OUT/raw/current.osm.pbf"
# fix known tagging errors + landmark heights (see fix_osm.py)
"$PY" -I "$(dirname "$0")/fix_osm.py" "$OUT/raw/dnipro_area.osm.pbf" "$OUT/dnipro_area_fixed.osm.pbf"
