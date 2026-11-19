--[[
	Выгружает построенный мир (детали и заливки рельефа) в JSON —
	для картинки «вид сверху»:  lune run tests/mapdump.luau out.json
]]
local fs = require("@lune/fs")
local process = require("@lune/process")
local roblox = require("@lune/roblox")
local serde = require("@lune/serde")
local Engine = require("./engine")

Engine.recordTerrain = {}
local game = Engine.loadPlace("place/ChistayaReka.rbxlx")
Engine.runScript("server", game.ServerScriptService.Server)
Engine.advance(1)

local parts = {}
for _, d in Engine.unwrap(game.Workspace):GetDescendants() do
	if d:IsA("BasePart") and not d:IsA("Terrain") and d.Transparency < 1 then
		local p = d.CFrame.Position
		local c = d.Color
		local top = d.CFrame * roblox.Vector3.new(0, d.Size.Y / 2, 0)
		table.insert(parts, {
			p.X, p.Y, p.Z, d.Size.X, d.Size.Y, d.Size.Z,
			math.floor(c.R * 255), math.floor(c.G * 255), math.floor(c.B * 255),
			select(2, d.CFrame:ToOrientation()), d.Parent and d.Parent.Name or "", top.Y,
		})
	end
end
fs.writeFile(process.args[1] or "map.json", serde.encode("json", { parts = parts, terrain = Engine.recordTerrain }))
print("parts", #parts, "terrain", #Engine.recordTerrain, "errors", #Engine.errors, "warnings", #Engine.warnings)
