"""Check every placed building of a KnoxMap map: what it became vs. what OSM says it is."""
import sys, json, csv, gzip, re, os
from collections import Counter, defaultdict
sys.path.insert(0, '.')
from shapely.geometry import Polygon, Point, shape
from shapely.strtree import STRtree

m = sys.argv[1]; name = os.path.basename(m)
geo = json.load(open(f'{m}/{name}_buildings.geojson', encoding='utf-8'))
feats = geo['features']
rows = list(csv.DictReader(open(f'{m}/{name}_placements.csv', encoding='utf-8')))
osm = json.load(gzip.open(f'{m}/{name}_osm.json.gz', 'rt', encoding='utf-8'))['features']

# zones from OSM areas
ZONE = {}
def zone_of(t):
    lu = t.get('landuse'); am = t.get('amenity')
    if lu in ('industrial', 'railway', 'quarry') or t.get('man_made') == 'works': return 'industrial'
    if lu == 'garages': return 'garages'
    if lu == 'military' or t.get('military'): return 'military'
    if am in ('school', 'university', 'college', 'kindergarten') or lu == 'education': return 'education'
    if am in ('hospital', 'clinic') or t.get('healthcare') in ('hospital', 'clinic'): return 'medical'
    if am == 'marketplace': return 'market'
    if lu == 'cemetery' or am == 'grave_yard': return 'cemetery'
    if lu == 'allotments': return 'allotments'
    return None
polys, zones = [], []
for f in osm:
    z = zone_of(f['tags'])
    if not z or f['kind'] == 'node': continue
    g = f['geometry']
    rings = g if (g and isinstance(g[0][0], list)) else [g]
    for r in rings:
        if len(r) >= 4:
            try:
                p = Polygon([(lo, la) for la, lo in r])
                if p.is_valid and p.area > 0: polys.append(p); zones.append(z)
            except Exception: pass
tree = STRtree(polys)
def zones_at(pt):
    return {zones[i] for i in tree.query(pt) if polys[i].contains(pt)}

NAME = [  # Ukrainian / Russian name keywords -> expected kind
    (r'школ|гімназ|гимназ|ліце|лице|коледж|колледж|технікум|техникум|університет|университет|академі|академи|інститут|институт|училищ|дитяч.{0,3} садок|дитсадок|садочок|днз|зно|навчальн|корпус №', 'school'),
    (r'лікарн|больниц|поліклін|поликлин|амбулатор|диспансер|клінік|клиник|медичн|медицин|стоматолог|пологов|госпітал|госпиталь|аптек', 'medical'),
    (r'поліці|полици|відділ поліції|відділок|міліці|милици|патрульн', 'police'),
    (r'пожежн|пожарн|рятувальн|дснс|мчс', 'fire'),
    (r'церкв|церков|храм|собор|каплиц|часовн|монастир|синагог|мечет|костел|молитовн', 'church'),
    (r'бібліотек|библиотек', 'library'),
    (r'цех|завод|фабрик|комбінат|комбинат|склад|депо|котельн|елеватор|элеватор|млин|виробни|производ|майстерн|мастерск|тп-|трансформатор|підстанці|подстанци|насосн|компресор', 'industrial'),
    (r'ринок|рынок|базар|супермаркет|магазин|маркет|атб|сільпо|varus|novus|епіцентр|metro|ашан|фора', 'shop'),
    (r'тц |трц|трк|торгов|молл|mall', 'mall'),
    (r'гараж|автосервіс|автосервис|сто |шиномонтаж|автомий|автомой', 'garage'),
    (r'гуртожит|общежит', 'apartment'),
    (r'кафе|ресторан|бар |їдальн|столов|піцер|пиццер|кав.ярн|макдональдс|mcdonald|kfc', 'restaurant'),
    (r'театр|філармон|кінотеатр|палац культур|будинок культур|дк |клуб|музей|цирк|рада|адміністрац|суд|прокуратур|банк|пошта|нова пошта|укрпошта|офіс|бізнес-центр|бц ', 'civic'),
]
NAME = [(re.compile(p, re.I), k) for p, k in NAME]
BTAG = {
    'apartments': {'apartment'}, 'residential': {'apartment', 'house'}, 'dormitory': {'apartment'},
    'house': {'house', 'shed'}, 'detached': {'house', 'shed'}, 'semidetached_house': {'house'},
    'industrial': {'industrial', 'garage', 'shed'}, 'warehouse': {'industrial', 'shed', 'garage'},
    'school': {'school'}, 'university': {'school'}, 'college': {'school'}, 'kindergarten': {'school'},
    'hospital': {'medical'}, 'church': {'church'}, 'cathedral': {'church'}, 'chapel': {'church'},
    'garages': {'garage'}, 'garage': {'garage', 'shed'},
    'retail': {'shop', 'mall', 'restaurant', 'civic'}, 'supermarket': {'shop', 'mall'},
    'office': {'civic'}, 'train_station': {'civic'}, 'kiosk': {'shop'},
}
RESID = {'apartment', 'house'}
from generator.rendering.projection import Projector
info = json.load(open(f'{m}/{name}_info.json', encoding='utf-8'))
b = info['bbox']
proj = Projector.build(b['south'], b['west'], b['north'], b['east'], info['meters_per_tile'], info.get('rotation', 0))
bshapes, bidx = [], []
for i, f in enumerate(feats):
    try:
        g = shape(f['geometry'])
        if not g.is_empty: bshapes.append(g.buffer(0) if not g.is_valid else g); bidx.append(i)
    except Exception: pass
btree = STRtree(bshapes)
problems = defaultdict(list)
unmatched = 0
by_id = {}
for i, f in enumerate(feats):
    oid = (f.get('properties') or {}).get('osm_id')
    if oid not in (None, ''): by_id[str(oid)] = i
seen_ids = set()
for r in rows:
    if r.get('osm_id') and r['osm_id'] in by_id:
        if r['osm_id'] in seen_ids: continue        # one finding per building, not per entrance
        seen_ids.add(r['osm_id'])
        f = feats[by_id[r['osm_id']]]
    else:
        la, lo = proj.to_latlon(int(r['tile_x']) + int(r['width']) / 2, int(r['tile_y']) + int(r['height']) / 2)
        pt = Point(lo, la)
        hits = [j for j in btree.query(pt) if bshapes[j].contains(pt)]
        if not hits:
            near = btree.nearest(pt)
            if near is None or bshapes[near].distance(pt) > 0.0002: unmatched += 1; continue
            hits = [near]
        f = feats[bidx[min(hits, key=lambda j: bshapes[j].area)]]
    t = f['properties']; kind = r['kind']; lv = int(r['levels'])
    nm = (t.get('name') or ''); bt = (t.get('building') or '').lower()
    try:
        c = shape(f['geometry']).representative_point()
    except Exception:
        continue
    z = zones_at(c)
    tag = f"{kind:10s} lv{lv:<2d} b={bt:12s} {nm[:40]!r} @{c.y:.5f},{c.x:.5f}"
    # zone checks
    if kind in RESID and z & {'industrial', 'garages', 'military', 'education', 'medical', 'market', 'cemetery'} and bt not in ('apartments', 'house', 'detached', 'residential', 'dormitory', 'semidetached_house'):
        problems[f'residential inside {"/".join(sorted(z))}'].append(tag)
    # tag checks
    if bt in BTAG and kind not in BTAG[bt]:
        problems[f'building={bt} became {kind}'].append(tag)
    # name checks
    for rx, want in NAME:
        if rx.search(nm.lower() + ' '):
            ok = {want} | ({'mall', 'civic'} if want == 'shop' else set()) | ({'shop', 'civic'} if want == 'mall' else set()) \
                 | ({'civic'} if want in ('school', 'medical', 'library', 'police', 'fire') else set()) \
                 | ({'school', 'medical', 'apartment'} if want == 'civic' else set()) | ({'apartment'} if want == 'school' and 'гуртож' in nm.lower() else set())
            if kind not in ok and not (want == 'industrial' and kind in ('garage', 'shed')):
                problems[f'name says {want}, became {kind}'].append(tag)
            break
    if kind == 'house' and lv > 3: problems['house taller than 3 storeys'].append(tag)
    if kind == 'garage' and bt in ('apartments', 'residential', 'yes') and lv >= 3: problems['3+ storey building became garage'].append(tag)
tot = sum(len(v) for v in problems.values())
print(f"{len(rows)} lots checked ({unmatched} not matched to an OSM outline), {tot} findings")
for k, v in sorted(problems.items(), key=lambda kv: -len(kv[1])):
    print(f"\n== {k}: {len(v)}")
    for x in v[:6]: print('   ', x)
