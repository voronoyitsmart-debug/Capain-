"""Headless KnoxMap pipeline for the Dnipro map: generate -> buildings -> compile -> install.

usage: python run_pipeline.py <knoxmap dir> <config.json> [--stage generate|build|compile|install|all]

Runs KnoxMap's own steps through its web API (the same functions the window uses), so
nothing here differs from pressing the buttons - only the area and the settings come
from the config file. "all" runs generate, build, compile and install in order.
The "pbf" path in the config is relative to the config file unless absolute.
"""
import json, os, sys, time, argparse

ap = argparse.ArgumentParser()
ap.add_argument("knoxmap")
ap.add_argument("config")
ap.add_argument("--stage", default="all")
a = ap.parse_args()

a.knoxmap = os.path.abspath(a.knoxmap)
a.config = os.path.abspath(a.config)
os.chdir(a.knoxmap)
sys.path.insert(0, a.knoxmap)
cfg = json.load(open(a.config, encoding="utf-8"))
pbf = cfg["pbf"]
if not os.path.isabs(pbf):
    pbf = os.path.normpath(os.path.join(os.path.dirname(a.config), pbf))
# setup_windows.ps1 keeps a copy inside the KnoxMap folder, whose path is ASCII
# (a Cyrillic user name in the repository's path can trip up libosmium).
local_copy = os.path.join(a.knoxmap, "dnipro", os.path.basename(pbf))
if os.path.exists(local_copy) and (not pbf.isascii() or not os.path.exists(pbf)):
    pbf = local_copy
if not os.path.exists(pbf):
    sys.exit(f"map data not found: {pbf}")
os.environ["KNOXMAP_PBF_FILE"] = pbf
# The airport's parked planes need the Wingsmith aircraft mods; make them optional
# rather than a hard requirement of the map (see tools/make_map_mod.py).
os.environ.setdefault("KNOXMAP_AIRPORT_MODS_OPTIONAL", "1")
os.environ.setdefault("PZ_MAPPING_TOOLS", os.path.join(a.knoxmap, "vendor", "PZMappingTools"))
for exe in ("knoxlots.exe", "knoxlots", os.path.join("rust", "knoxlots", "target", "release", "knoxlots.exe"),
            os.path.join("rust", "knoxlots", "target", "release", "knoxlots")):
    if os.path.exists(os.path.join(a.knoxmap, exe)):
        os.environ.setdefault("KNOXLOTS", os.path.join(a.knoxmap, exe))
        os.environ.setdefault("KNOXMAP_BACKEND", "rust")
        break

import knoxlog
knoxlog.setup("cli")
from app import app

client = app.test_client()
name = cfg["mapName"]

def post(url, body):
    t = time.time()
    r = client.post(url, json=body)
    data = r.get_json(silent=True) or {}
    print(f"{url}: HTTP {r.status_code} in {time.time()-t:.0f}s")
    if r.status_code >= 400:
        print(json.dumps(data, ensure_ascii=False, indent=1)[:4000])
        sys.exit(1)
    return data

if a.stage in ("generate", "all"):
    body = {"mapName": name, "metersPerTile": cfg.get("metersPerTile", 1.0),
            "settings": cfg.get("settings", {})}
    body.update(cfg["bbox"])
    if cfg.get("shape"):
        body["shape"] = cfg["shape"]
    d = post("/api/generate", body)
    print({k: v for k, v in d.items() if not isinstance(v, (list, dict))})

if a.stage in ("build", "all"):
    d = post("/api/buildings", {"mapName": name, "settings": cfg.get("settings", {})})
    print({k: v for k, v in d.items() if not isinstance(v, (list, dict))})
    if "census" in d:
        print("census", d["census"])

if a.stage in ("compile", "all"):
    from tools.compile_map import compile_rust, default_backend
    from web import common
    if default_backend() != "rust":
        sys.exit("knoxlots (the Rust map compiler) was not found: put knoxlots.exe in the KnoxMap "
                 "folder (it ships in the KnoxMap release zip) or build rust/knoxlots with cargo.")
    t = time.time()
    last = [0]
    def phase(text, frac):
        if time.time() - last[0] > 30:
            last[0] = time.time(); print(f"  compile: {text} {frac:.0%}", flush=True)
    n = compile_rust(str(common.OUTPUT_DIR / name), on_phase=phase,
                     workers=cfg.get("workers"))
    print(f"compiled {n} cells in {time.time()-t:.0f}s")

if a.stage in ("install", "all"):
    d = post("/api/install", {"mapName": name, "title": cfg.get("title", name),
                              "modId": cfg.get("modId", name)})
    print({k: v for k, v in d.items() if not isinstance(v, (list, dict))})
