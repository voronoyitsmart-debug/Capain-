"""Схема зон сверху по выгрузке tests/mapdump.luau.

lune run tests/mapdump.luau map.json && python3 tools/render_map.py map.json docs
"""
import json, math, os, sys
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'map.json'))
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
MAT = {'Sand':(220,200,140),'Ground':(110,90,60),'Grass':(90,170,70),'Water':(40,120,190),'Mud':(85,70,50),
       'Pavement':(150,150,155),'Concrete':(170,170,170),'Cobblestone':(130,125,120),'LeafyGrass':(90,120,60),
       'WoodPlanks':(150,110,70),'Asphalt':(70,70,75),'Slate':(90,95,100),'Basalt':(60,60,65),'Sandstone':(200,170,120)}
def render(z0, z1, x0=-180, x1=180, scale=3, out='map.png'):
    W, H = int((x1-x0)*scale), int((z1-z0)*scale)
    img = Image.new('RGB', (W, H), (30,60,100))
    dr = ImageDraw.Draw(img)
    def px(x, z): return ((x-x0)*scale, (z1-z)*scale)   # north (+Z) up
    for t in d['terrain']:
        x,y,z,sx,sy,sz,mat = t
        if mat == 'Air' or y + sy/2 < -6: continue
        a = px(x-sx/2, z+sz/2); b = px(x+sx/2, z-sz/2)
        dr.rectangle([a, b], fill=MAT.get(mat,(255,0,255)))
    parts = sorted(d['parts'], key=lambda p: p[11])
    for p in parts:
        x,y,z,sx,sy,sz,r,g,b,yaw,parent,top = p
        if top < -6: continue
        c, s = math.cos(yaw), math.sin(yaw)
        pts = []
        for dx, dz in ((-sx/2,-sz/2),(sx/2,-sz/2),(sx/2,sz/2),(-sx/2,sz/2)):
            wx = x + dx*c + dz*s
            wz = z - dx*s + dz*c
            pts.append(px(wx, wz))
        dr.polygon(pts, fill=(r,g,b))
    img.save(os.path.join(OUT, out))
    print(out, W, H)
render(-110, 110, out='map-zone1.png')
render(90, 310, out='map-zone2.png')
render(890, 1140, out='map-zone6.png')
