--[[
	WorldService — строит весь мир при запуске сервера.

	Остров посреди моря, на нём 6 зон друг за другом (по оси Z).
	В каждой зоне: река из Terrain-воды (течёт по оси X), плотина с трубами,
	откуда приплывает мусор, решётка на выходе, два моста, база
	(переработка, магазин), декорации своей темы и ворота в следующую зону.
]]

local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local RiverMath = require(Shared.RiverMath)
local Util = require(Shared.Util)

local WorldService = {}

local W = Config.World
local V = Vector3.new
local C = Color3.fromRGB
local CF = CFrame.new
local ANG = CFrame.Angles
local R = math.rad
local UP = ANG(0, 0, R(90))
local ALONG_Z = ANG(0, R(90), 0)

local LAND_HALF_X = W.HalfWidth + 24

local Map: Folder
local Folders: { [string]: Folder } = {}

-- Вид построек по темам
local STYLE = {
	Meadow = {
		Path = "Ground",
		Fence = C(140, 100, 60),
		FenceMat = "Wood",
		Wall = "Cobblestone",
		WallColor = C(150, 150, 140),
		Bridge = "WoodPlanks",
		BridgeColor = C(150, 110, 70),
	},
	City = {
		Path = "Cobblestone",
		Fence = C(60, 62, 70),
		FenceMat = "Metal",
		Wall = "Brick",
		WallColor = C(165, 95, 75),
		Bridge = "Concrete",
		BridgeColor = C(175, 175, 175),
	},
	Swamp = {
		Path = "WoodPlanks",
		Fence = C(90, 70, 45),
		FenceMat = "Wood",
		Wall = "WoodPlanks",
		WallColor = C(95, 75, 50),
		Bridge = "WoodPlanks",
		BridgeColor = C(110, 85, 55),
	},
	Industrial = {
		Path = "Concrete",
		Fence = C(120, 120, 125),
		FenceMat = "DiamondPlate",
		Wall = "Concrete",
		WallColor = C(135, 135, 135),
		Bridge = "DiamondPlate",
		BridgeColor = C(115, 115, 120),
	},
	Toxic = {
		Path = "Cobblestone",
		Fence = C(70, 80, 60),
		FenceMat = "CorrodedMetal",
		Wall = "CorrodedMetal",
		WallColor = C(95, 105, 80),
		Bridge = "CorrodedMetal",
		BridgeColor = C(105, 95, 75),
	},
	Ocean = {
		Path = "WoodPlanks",
		Fence = C(225, 215, 185),
		FenceMat = "Wood",
		Wall = "Sand",
		WallColor = C(220, 200, 150),
		Bridge = "WoodPlanks",
		BridgeColor = C(185, 150, 105),
	},
}

local function styleFor(zoneId: number)
	return STYLE[Config.Zones[zoneId].Theme.Decor] or STYLE.Meadow
end

----------------------------------------------------------------------
-- Помощники построения
----------------------------------------------------------------------
local function fill(cframe: CFrame, size: Vector3, material: string)
	workspace.Terrain:FillBlock(cframe, size, Util.material(material))
end

local function P(parent: Instance, props: { [string]: any }): Part
	props.Parent = parent
	return Util.part(props)
end

local function newModel(name: string, parent: Instance): Model
	local model = Instance.new("Model")
	model.Name = name
	model.Parent = parent
	return model
end

local function label(parent: Instance, props: { [string]: any }): TextLabel
	local defaults = {
		BackgroundTransparency = 1,
		Size = UDim2.fromScale(1, 1),
		Font = Enum.Font.GothamBlack,
		TextColor3 = C(255, 255, 255),
		TextScaled = true,
		Parent = parent,
	}
	for key, value in props do
		defaults[key] = value
	end
	local text = Util.create("TextLabel", defaults)
	Util.create("UIStroke", { Thickness = 2, Color = C(15, 20, 30), Transparency = 0.2, Parent = text })
	return text
end

-- Табличка над объектом, всегда смотрит на камеру
local function billboard(adornee: BasePart, title: string, subtitle: string?, color: Color3, offsetY: number)
	local gui = Util.create("BillboardGui", {
		Name = "Sign",
		Size = UDim2.fromScale(16, 4.2),
		StudsOffset = V(0, offsetY, 0),
		MaxDistance = 220,
		LightInfluence = 0,
		AlwaysOnTop = false,
		Adornee = adornee,
		Parent = adornee,
	})
	label(gui, { Name = "Title", Text = title, TextColor3 = color, Size = UDim2.fromScale(1, 0.62) })
	if subtitle then
		label(gui, {
			Name = "Subtitle",
			Text = subtitle,
			Font = Enum.Font.GothamBold,
			Size = UDim2.fromScale(1, 0.34),
			Position = UDim2.fromScale(0, 0.64),
		})
	end
	return gui
end

-- Надпись на грани детали
local function surface(part: BasePart, face: Enum.NormalId, build: (SurfaceGui) -> ())
	local gui = Util.create("SurfaceGui", {
		Name = "Surface" .. face.Name,
		Face = face,
		SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud,
		PixelsPerStud = 40,
		LightInfluence = 0,
		Parent = part,
	})
	build(gui)
	return gui
end

local function prompt(part: BasePart, action: string, object: string, openUI: string)
	local p = Util.create("ProximityPrompt", {
		ActionText = action,
		ObjectText = object,
		HoldDuration = 0,
		MaxActivationDistance = 14,
		RequiresLineOfSight = false,
		Parent = part,
	})
	p:SetAttribute("OpenUI", openUI)
	return p
end

local function sparkleEmitter(parent: Instance, color: Color3, rate: number)
	return Util.create("ParticleEmitter", {
		Texture = "rbxasset://textures/particles/sparkles_main.dds",
		Rate = rate,
		Lifetime = NumberRange.new(1, 2),
		Speed = NumberRange.new(2, 4),
		SpreadAngle = Vector2.new(25, 25),
		EmissionDirection = Enum.NormalId.Top,
		LightEmission = 0.8,
		Color = ColorSequence.new(color),
		Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.5), NumberSequenceKeypoint.new(1, 0) }),
		Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.1), NumberSequenceKeypoint.new(1, 1) }),
		Parent = parent,
	})
end

local function smokeEmitter(parent: Instance, color: Color3)
	return Util.create("ParticleEmitter", {
		Texture = "rbxasset://textures/particles/smoke_main.dds",
		Rate = 5,
		Lifetime = NumberRange.new(4, 6),
		Speed = NumberRange.new(3, 5),
		SpreadAngle = Vector2.new(12, 12),
		EmissionDirection = Enum.NormalId.Top,
		RotSpeed = NumberRange.new(-30, 30),
		Rotation = NumberRange.new(0, 360),
		Color = ColorSequence.new(color),
		Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 2), NumberSequenceKeypoint.new(1, 7) }),
		Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.4), NumberSequenceKeypoint.new(1, 1) }),
		Parent = parent,
	})
end

----------------------------------------------------------------------
-- Освещение
----------------------------------------------------------------------
local function setupLighting()
	Lighting.ClockTime = 14.2
	Lighting.Brightness = 2.4
	Lighting.GlobalShadows = true
	Lighting.Ambient = C(95, 95, 105)
	Lighting.OutdoorAmbient = C(140, 140, 150)
	Lighting.EnvironmentDiffuseScale = 0.6
	Lighting.EnvironmentSpecularScale = 0.6
	Lighting.GeographicLatitude = 35

	for _, child in Lighting:GetChildren() do
		if child:IsA("Atmosphere") or child:IsA("Sky") or child:IsA("PostEffect") then
			child:Destroy()
		end
	end
	Util.create("Sky", { Name = "Sky", Parent = Lighting })
	Util.create("Atmosphere", {
		Name = "Atmosphere",
		Density = 0.26,
		Offset = 0.15,
		Color = C(200, 215, 230),
		Decay = C(110, 125, 150),
		Glare = 0.25,
		Haze = 1.2,
		Parent = Lighting,
	})
	Util.create("BloomEffect", { Intensity = 0.5, Size = 24, Threshold = 1.6, Parent = Lighting })
	Util.create("ColorCorrectionEffect", { Saturation = 0.12, Contrast = 0.06, Brightness = 0.01, Parent = Lighting })
	Util.create("SunRaysEffect", { Intensity = 0.05, Spread = 0.8, Parent = Lighting })

	local terrain = workspace.Terrain
	terrain.WaterWaveSize = 0.12
	terrain.WaterWaveSpeed = 7
	terrain.WaterReflectance = 0.35
	terrain.WaterTransparency = 0.45
	terrain.WaterColor = Config.Zones[1].Theme.WaterClean
	pcall(function()
		terrain:SetMaterialColor(Enum.Material.Grass, C(95, 175, 70))
		terrain:SetMaterialColor(Enum.Material.LeafyGrass, C(90, 120, 60))
		terrain:SetMaterialColor(Enum.Material.Sand, C(225, 205, 150))
		terrain:SetMaterialColor(Enum.Material.Mud, C(85, 70, 50))
	end)
end

----------------------------------------------------------------------
-- Рельеф: море, остров, реки, дорожки
----------------------------------------------------------------------
local function buildTerrain()
	local count = #Config.Zones
	local firstZ = RiverMath.zoneOriginZ(1) - W.HalfDepth
	local lastZ = RiverMath.zoneOriginZ(count) + W.HalfDepth
	local midZ = (firstZ + lastZ) / 2
	local length = lastZ - firstZ

	-- море вокруг острова
	fill(CF(0, -24, midZ), V(1000, 8, length + 700), "Sand")
	fill(CF(0, -11, midZ), V(1000, 18, length + 700), "Water")
	-- пляж по краю
	fill(CF(0, -4, midZ), V(LAND_HALF_X * 2 + 40, 8, length + 48), "Sand")

	for zoneId, zone in Config.Zones do
		local oz = RiverMath.zoneOriginZ(zoneId)
		local rz = RiverMath.riverZ(zoneId)
		local theme = zone.Theme
		local style = styleFor(zoneId)

		-- земля
		fill(CF(0, -14, oz), V(LAND_HALF_X * 2, 20, W.ZoneSpacing), "Ground")
		fill(CF(0, -2, oz), V(LAND_HALF_X * 2, 4, W.ZoneSpacing), theme.Ground)

		-- дорожки
		local path = style.Path
		local hubZ = oz + W.HubZ
		fill(CF(0, -2, hubZ - 6), V(84, 4, 40), path) -- площадь базы
		fill(CF(0, -2, oz - 26), V(232, 4, 8), path) -- набережная (юг)
		fill(CF(0, -2, oz - 34), V(12, 4, 8), path)
		for _, bx in W.BridgeX do
			fill(CF(bx, -2, oz - 20), V(10, 4, 8), path)
			fill(CF(bx, -2, oz + 42), V(10, 4, 20), path)
		end
		fill(CF(0, -2, oz + 50), V(134, 4, 8), path) -- набережная (север)
		fill(CF(0, -2, oz + 76), V(14, 4, 52), path) -- дорога к воротам
		if zoneId > 1 then
			fill(CF(0, -2, oz - 89), V(14, 4, 24), path)
		end

		-- река (уходит в море с обеих сторон)
		local riverLen = LAND_HALF_X * 2 + 60
		fill(CF(0, -4, rz), V(riverLen - 20, 8, W.RiverWidth + 12), theme.Bank)
		fill(CF(0, -6, rz), V(riverLen, 12, W.RiverWidth), "Air")
		fill(CF(0, -14, rz), V(riverLen, 4, W.RiverWidth), theme.Bed)
		fill(CF(0, -7, rz), V(riverLen, 10, W.RiverWidth), "Water")
	end
end

----------------------------------------------------------------------
-- Стены, заборы, ворота
----------------------------------------------------------------------
local function invisibleWall(cframe: CFrame, size: Vector3)
	P(Folders.Walls, {
		Name = "InvisibleWall",
		Size = size,
		CFrame = cframe,
		Transparency = 1,
		CanCollide = true,
		CastShadow = false,
	})
end

local function fenceLine(fromPos: Vector3, toPos: Vector3, style, skip: (Vector3) -> boolean)
	local dir = toPos - fromPos
	local length = dir.Magnitude
	local steps = math.max(1, math.floor(length / 12))
	local prev: Vector3? = nil
	for i = 0, steps do
		local pos = fromPos + dir * (i / steps)
		if skip(pos) then
			prev = nil
		else
			P(Folders.Fences, {
				Name = "Post",
				Size = V(0.8, 4.2, 0.8),
				CFrame = CF(pos + V(0, 2.1, 0)),
				Material = style.FenceMat,
				Color = style.Fence,
			})
			if prev then
				local mid = (prev + pos) / 2
				local span = (pos - prev).Magnitude
				for _, h in { 1.6, 3.3 } do
					P(Folders.Fences, {
						Name = "Rail",
						Size = V(0.3, 0.4, span),
						CFrame = CFrame.lookAt(mid + V(0, h, 0), pos + V(0, h, 0)),
						Material = style.FenceMat,
						Color = style.Fence,
					})
				end
			end
			prev = pos
		end
	end
end

local function buildWalls()
	local count = #Config.Zones
	local firstZ = RiverMath.zoneOriginZ(1) - W.HalfDepth
	local lastZ = RiverMath.zoneOriginZ(count) + W.HalfDepth
	local midZ = (firstZ + lastZ) / 2
	local length = lastZ - firstZ

	invisibleWall(CF(-W.HalfWidth - 1, 40, midZ), V(2, 140, length + 4))
	invisibleWall(CF(W.HalfWidth + 1, 40, midZ), V(2, 140, length + 4))
	invisibleWall(CF(0, 40, firstZ - 1), V(W.HalfWidth * 2 + 4, 140, 2))
	invisibleWall(CF(0, 40, lastZ + 1), V(W.HalfWidth * 2 + 4, 140, 2))

	-- заборы по краям каждой зоны (с разрывом над рекой)
	for zoneId = 1, count do
		local oz = RiverMath.zoneOriginZ(zoneId)
		local rz = RiverMath.riverZ(zoneId)
		local style = styleFor(zoneId)
		local function overRiver(pos: Vector3)
			return math.abs(pos.Z - rz) < W.RiverWidth / 2 + 3
		end
		for _, side in { -1, 1 } do
			local x = side * (W.HalfWidth - 0.6)
			fenceLine(V(x, 0, oz - W.HalfDepth + 1), V(x, 0, oz + W.HalfDepth - 1), style, overRiver)
		end
		if zoneId == 1 then
			fenceLine(V(-W.HalfWidth + 1, 0, firstZ + 0.6), V(W.HalfWidth - 1, 0, firstZ + 0.6), style, function()
				return false
			end)
		end
		if zoneId == count then
			fenceLine(V(-W.HalfWidth + 1, 0, lastZ - 0.6), V(W.HalfWidth - 1, 0, lastZ - 0.6), style, function()
				return false
			end)
		end
	end
end

-- Ворота между зоной zoneId и следующей
local function buildGate(zoneId: number)
	local nextZone = zoneId + 1
	local zone = Config.Zones[nextZone]
	local z = RiverMath.zoneOriginZ(zoneId) + W.HalfDepth
	local style = styleFor(nextZone)
	local accent = zone.Theme.Accent
	local segLen = W.HalfWidth - W.GateWidth / 2

	local model = newModel("Gate_" .. nextZone, Folders.Gates)
	model:SetAttribute("Zone", nextZone)

	for _, side in { -1, 1 } do
		local cx = side * (W.GateWidth / 2 + segLen / 2)
		P(model, {
			Name = "Wall",
			Size = V(segLen, W.WallHeight, 3),
			CFrame = CF(cx, W.WallHeight / 2, z),
			Material = style.Wall,
			Color = style.WallColor,
		})
		P(model, {
			Name = "WallCap",
			Size = V(segLen, 1, 4),
			CFrame = CF(cx, W.WallHeight + 0.5, z),
			Material = style.Wall,
			Color = style.WallColor:Lerp(C(0, 0, 0), 0.25),
		})
		P(model, {
			Name = "WallBlock",
			Size = V(segLen, 110, 2),
			CFrame = CF(cx, W.WallHeight + 55, z),
			Transparency = 1,
			CastShadow = false,
		})
		local pillar = P(model, {
			Name = "Pillar",
			Size = V(4, W.WallHeight + 4, 4),
			CFrame = CF(side * (W.GateWidth / 2 + 2), (W.WallHeight + 4) / 2, z),
			Material = style.Wall,
			Color = style.WallColor:Lerp(C(255, 255, 255), 0.15),
		})
		P(model, {
			Name = "PillarLight",
			Shape = "Ball",
			Size = V(2.4, 2.4, 2.4),
			CFrame = CF(pillar.Position + V(0, (W.WallHeight + 4) / 2 + 1, 0)),
			Material = "Neon",
			Color = accent,
		})
	end

	local blocker = P(model, {
		Name = "Gate",
		Size = V(W.GateWidth, 130, 2),
		CFrame = CF(0, 45, z),
		Transparency = 1,
		CanCollide = true,
		CastShadow = false,
	})
	blocker:SetAttribute("Zone", nextZone)

	local field = P(model, {
		Name = "GateField",
		Size = V(W.GateWidth, W.WallHeight, 0.6),
		CFrame = CF(0, W.WallHeight / 2, z),
		Material = "ForceField",
		Color = C(255, 90, 90),
		CanCollide = false,
		CastShadow = false,
	})
	field:SetAttribute("Zone", nextZone)
	prompt(field, "Открыть зону", zone.Name, "Zones")

	local sign = P(model, {
		Name = "GateSign",
		Size = V(W.GateWidth + 6, 6, 1),
		CFrame = CF(0, W.WallHeight + 4, z),
		Material = "SmoothPlastic",
		Color = C(30, 36, 48),
	})
	for _, face in { Enum.NormalId.Front, Enum.NormalId.Back } do
		surface(sign, face, function(gui)
			label(gui, {
				Name = "Label",
				Text = string.format(
					"🔒 Зона %d: %s\n💰 %s монет",
					nextZone,
					zone.Name,
					Format.number(zone.Cost)
				),
				TextColor3 = accent,
			})
		end)
	end
end

----------------------------------------------------------------------
-- Начало и конец реки
----------------------------------------------------------------------
local function buildRiverEnds(zoneId: number)
	local rz = RiverMath.riverZ(zoneId)
	local model = newModel("RiverEnds_" .. zoneId, Folders.River)

	-- плотина с трубами (отсюда течёт мусор)
	P(model, {
		Name = "Dam",
		Size = V(6, 18, W.RiverWidth + 10),
		CFrame = CF(-W.HalfWidth - 3, 1, rz),
		Material = "Concrete",
		Color = C(150, 150, 150),
	})
	P(model, {
		Name = "DamTop",
		Size = V(7, 1, W.RiverWidth + 12),
		CFrame = CF(-W.HalfWidth - 3, 10.5, rz),
		Material = "Concrete",
		Color = C(120, 120, 120),
	})
	for _, dz in { -14, 0, 14 } do
		P(model, {
			Name = "Pipe",
			Shape = "Cylinder",
			Size = V(6, 8, 8),
			CFrame = CF(-W.HalfWidth + 1, 0, rz + dz),
			Material = "Metal",
			Color = C(110, 115, 120),
		})
		local mouth = P(model, {
			Name = "PipeMouth",
			Shape = "Cylinder",
			Size = V(0.2, 6.4, 6.4),
			CFrame = CF(-W.HalfWidth + 4.1, 0, rz + dz),
			Material = "SmoothPlastic",
			Color = C(25, 25, 28),
			CanCollide = false,
		})
		Util.create("ParticleEmitter", {
			Texture = "rbxasset://textures/particles/sparkles_main.dds",
			Rate = 18,
			Lifetime = NumberRange.new(0.5, 0.9),
			Speed = NumberRange.new(6, 10),
			SpreadAngle = Vector2.new(25, 25),
			EmissionDirection = Enum.NormalId.Right,
			Acceleration = V(0, -25, 0),
			Color = ColorSequence.new(C(235, 245, 255)),
			Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.7), NumberSequenceKeypoint.new(1, 0.1) }),
			Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.2), NumberSequenceKeypoint.new(1, 1) }),
			Parent = mouth,
		})
	end

	-- решётка на выходе: сюда уплывает непойманный мусор
	local z0 = rz - W.RiverWidth / 2 + 1
	local bars = math.floor(W.RiverWidth / 2)
	for i = 0, bars - 1 do
		P(model, {
			Name = "Bar",
			Shape = "Cylinder",
			Size = V(16, 0.5, 0.5),
			CFrame = CF(W.HalfWidth - 3, -4, z0 + i * 2) * UP,
			Material = "Metal",
			Color = C(90, 95, 100),
			CanCollide = false,
		})
	end
	P(model, {
		Name = "GrateBeam",
		Size = V(1.2, 1.2, W.RiverWidth + 6),
		CFrame = CF(W.HalfWidth - 3, 4.5, rz),
		Material = "Metal",
		Color = C(70, 75, 80),
	})
end

----------------------------------------------------------------------
-- Мосты
----------------------------------------------------------------------
local function buildBridges(zoneId: number)
	local rz = RiverMath.riverZ(zoneId)
	local style = styleFor(zoneId)
	local length = W.RiverWidth + 14
	for _, bx in W.BridgeX do
		local model = newModel("Bridge", Folders.Bridges)
		P(model, {
			Name = "Deck",
			Size = V(10, 1, length),
			CFrame = CF(bx, 0.5, rz),
			Material = style.Bridge,
			Color = style.BridgeColor,
		})
		for _, side in { -1, 1 } do
			P(model, {
				Name = "Rail",
				Size = V(0.6, 0.6, length),
				CFrame = CF(bx + side * 4.7, 3.2, rz),
				Material = style.Bridge,
				Color = style.BridgeColor:Lerp(C(0, 0, 0), 0.2),
			})
			for i = -3, 3 do
				P(model, {
					Name = "Baluster",
					Size = V(0.4, 2.4, 0.4),
					CFrame = CF(bx + side * 4.7, 2, rz + i * (length / 7)),
					Material = style.Bridge,
					Color = style.BridgeColor:Lerp(C(0, 0, 0), 0.2),
				})
			end
			for _, dz in { -10, 10 } do
				P(model, {
					Name = "Pile",
					Shape = "Cylinder",
					Size = V(14, 1.2, 1.2),
					CFrame = CF(bx + side * 3.5, -6.5, rz + dz) * UP,
					Material = "Wood",
					Color = C(90, 65, 45),
				})
			end
		end
	end
end

----------------------------------------------------------------------
-- База зоны: переработка, ларьки
----------------------------------------------------------------------
local function buildSellPad(zoneId: number)
	local pos = RiverMath.sellPadPosition(zoneId)
	local model = newModel("SellStation_" .. zoneId, Folders.SellPads)
	local green = C(70, 215, 110)

	local pad = P(model, {
		Name = "SellPad",
		Size = V(14, 0.6, 14),
		CFrame = CF(pos + V(0, 0.3, 0)),
		Material = "SmoothPlastic",
		Color = C(50, 160, 85),
		CanTouch = true,
	})
	pad:SetAttribute("SellPad", true)
	pad:SetAttribute("Zone", zoneId)

	for _, edge in { { V(0, 0, 7), V(14.4, 0.7, 0.6) }, { V(0, 0, -7), V(14.4, 0.7, 0.6) }, { V(7, 0, 0), V(0.6, 0.7, 14.4) }, { V(-7, 0, 0), V(0.6, 0.7, 14.4) } } do
		P(model, {
			Name = "Border",
			Size = edge[2],
			CFrame = CF(pos + edge[1] + V(0, 0.35, 0)),
			Material = "Neon",
			Color = green,
			CanCollide = false,
		})
	end
	surface(pad, Enum.NormalId.Top, function(gui)
		label(gui, { Text = "♻️", TextTransparency = 0.15 })
	end)
	sparkleEmitter(pad, green, 4)
	billboard(pad, "♻️ ПЕРЕРАБОТКА", "Встань сюда — мусор продастся", green, 7)

	-- контейнеры для сортировки
	local bins = { C(60, 120, 220), C(240, 200, 50), C(70, 180, 90) }
	for i, color in bins do
		local bx = pos.X + (i - 2) * 4.2
		local bz = pos.Z - 10
		P(model, {
			Name = "Bin",
			Size = V(3.4, 4, 3.4),
			CFrame = CF(bx, 2, bz),
			Material = "SmoothPlastic",
			Color = color,
		})
		P(model, {
			Name = "BinLid",
			Size = V(3.7, 0.5, 3.7),
			CFrame = CF(bx, 4.25, bz) * ANG(R(-12), 0, 0),
			Material = "SmoothPlastic",
			Color = color:Lerp(C(0, 0, 0), 0.25),
		})
	end
	return pad
end

-- Ларёк с навесом и кнопкой E
local function buildStall(name: string, pos: Vector3, title: string, subtitle: string, accent: Color3, openUI: string, action: string)
	local model = newModel(name, Folders.Hubs)
	P(model, {
		Name = "Floor",
		Size = V(14, 0.4, 10),
		CFrame = CF(pos + V(0, 0.2, 0)),
		Material = "WoodPlanks",
		Color = C(160, 120, 80),
	})
	local counter = P(model, {
		Name = "Counter",
		Size = V(12, 3.5, 2),
		CFrame = CF(pos + V(0, 1.75, 4)),
		Material = "Wood",
		Color = C(130, 90, 55),
	})
	P(model, {
		Name = "CounterTop",
		Size = V(12.6, 0.4, 2.6),
		CFrame = CF(pos + V(0, 3.7, 4)),
		Material = "SmoothPlastic",
		Color = accent,
	})
	for _, x in { -6.5, 6.5 } do
		for _, z in { -4.5, 4.5 } do
			P(model, {
				Name = "Post",
				Shape = "Cylinder",
				Size = V(8, 0.8, 0.8),
				CFrame = CF(pos + V(x, 4, z)) * UP,
				Material = "Wood",
				Color = C(120, 85, 55),
			})
		end
	end
	P(model, {
		Name = "Roof",
		Size = V(16, 0.8, 12),
		CFrame = CF(pos + V(0, 8.4, 0)),
		Material = "SmoothPlastic",
		Color = accent:Lerp(C(0, 0, 0), 0.2),
	})
	for i = 0, 7 do
		P(model, {
			Name = "Awning",
			Size = V(2, 1.4, 0.4),
			CFrame = CF(pos + V(-7 + i * 2, 7.4, 6)),
			Material = "Fabric",
			Color = if i % 2 == 0 then accent else C(250, 250, 250),
			CanCollide = false,
		})
	end
	surface(counter, Enum.NormalId.Back, function(gui)
		label(gui, { Text = title, TextColor3 = accent })
	end)
	billboard(counter, title, subtitle, accent, 8)
	prompt(counter, action, title, openUI)
	return model
end

local function buildFactory(zoneId: number)
	local oz = RiverMath.zoneOriginZ(zoneId)
	local pos = V(-64, 0, oz - 74)
	local model = newModel("Factory", Folders.Hubs)
	local brick = C(170, 80, 60)
	P(model, { Name = "Body", Size = V(22, 12, 14), CFrame = CF(pos + V(0, 6, 0)), Material = "Brick", Color = brick })
	P(model, {
		Name = "Roof",
		Size = V(24, 1, 16),
		CFrame = CF(pos + V(0, 12.5, 0)),
		Material = "Metal",
		Color = C(80, 85, 90),
	})
	for i, x in { -6, 0, 6 } do
		local chimney = P(model, {
			Name = "Chimney",
			Shape = "Cylinder",
			Size = V(8 + i * 2, 2.6, 2.6),
			CFrame = CF(pos + V(x, 13 + (8 + i * 2) / 2, -3)) * UP,
			Material = "Brick",
			Color = brick:Lerp(C(0, 0, 0), 0.2),
		})
		smokeEmitter(chimney, C(220, 225, 230))
	end
	for i = -2, 2 do
		P(model, {
			Name = "Window",
			Size = V(2.4, 2.6, 0.2),
			CFrame = CF(pos + V(i * 4, 8, 7.05)),
			Material = "Neon",
			Color = C(255, 220, 120),
			CanCollide = false,
		})
	end
	P(model, {
		Name = "Door",
		Size = V(5, 6, 0.3),
		CFrame = CF(pos + V(0, 3, 7.1)),
		Material = "DiamondPlate",
		Color = C(90, 95, 100),
	})
	local panel = P(model, {
		Name = "Panel",
		Size = V(3, 4, 1.2),
		CFrame = CF(pos + V(6, 2, 9.5)),
		Material = "Metal",
		Color = C(60, 65, 75),
	})
	P(model, {
		Name = "PanelScreen",
		Size = V(2.4, 1.8, 0.1),
		CFrame = CF(pos + V(6, 2.8, 10.15)),
		Material = "Neon",
		Color = C(90, 255, 160),
		CanCollide = false,
	})
	billboard(panel, "🏭 ФАБРИКА", "Копит монеты, пока тебя нет", C(255, 200, 90), 9)
	prompt(panel, "Открыть фабрику", "Фабрика переработки", "Factory")
end

local function buildRebirthPortal(zoneId: number)
	local oz = RiverMath.zoneOriginZ(zoneId)
	local pos = V(64, 0, oz - 80)
	local model = newModel("RebirthPortal", Folders.Hubs)
	local purple = C(180, 90, 255)
	P(model, {
		Name = "Base",
		Shape = "Cylinder",
		Size = V(1, 16, 16),
		CFrame = CF(pos + V(0, 0.5, 0)) * UP,
		Material = "Slate",
		Color = C(60, 55, 80),
	})
	local center = pos + V(0, 8, 0)
	for i = 0, 15 do
		local a = R(i * 22.5)
		P(model, {
			Name = "Ring",
			Size = V(2.2, 1.2, 1.2),
			CFrame = CF(center + V(math.cos(a) * 6.5, math.sin(a) * 6.5, 0)) * ANG(0, 0, a + R(90)),
			Material = "Neon",
			Color = purple,
			CanCollide = false,
		})
	end
	local core = P(model, {
		Name = "Core",
		Shape = "Cylinder",
		Size = V(0.4, 12, 12),
		CFrame = CF(center) * ALONG_Z,
		Material = "ForceField",
		Color = purple,
		CanCollide = false,
	})
	sparkleEmitter(core, purple, 10)
	billboard(core, "🌀 ПЕРЕРОЖДЕНИЕ", "Начни заново с бонусом к монетам", purple, 9)
	prompt(core, "Перерождение", "Портал", "Rebirth")
end

local function buildLeaderboard(name: string, title: string, valueTitle: string, pos: Vector3, yaw: number, color: Color3)
	local model = newModel(name, Folders.Leaderboards)
	local cf = CF(pos) * ANG(0, yaw, 0)
	local board = P(model, {
		Name = "Board",
		Size = V(16, 20, 1),
		CFrame = cf * CF(0, 12, 0),
		Material = "SmoothPlastic",
		Color = C(28, 34, 46),
	})
	for _, x in { -7, 7 } do
		P(model, {
			Name = "Leg",
			Size = V(1, 4, 1),
			CFrame = cf * CF(x, 1, 0),
			Material = "Metal",
			Color = C(60, 65, 75),
		})
	end
	P(model, {
		Name = "Frame",
		Size = V(16.8, 0.8, 1.4),
		CFrame = cf * CF(0, 22.2, 0),
		Material = "Neon",
		Color = color,
	})
	surface(board, Enum.NormalId.Front, function(gui)
		gui.PixelsPerStud = 30
		local root = Util.create("Frame", {
			Name = "Root",
			BackgroundTransparency = 1,
			Size = UDim2.fromScale(1, 1),
			Parent = gui,
		})
		Util.create("UIPadding", {
			PaddingTop = UDim.new(0, 12),
			PaddingLeft = UDim.new(0, 16),
			PaddingRight = UDim.new(0, 16),
			Parent = root,
		})
		label(root, { Name = "Title", Text = title, TextColor3 = color, Size = UDim2.new(1, 0, 0, 60) })
		label(root, {
			Name = "Header",
			Text = "Игрок                    " .. valueTitle,
			Font = Enum.Font.GothamBold,
			TextColor3 = C(170, 180, 200),
			Size = UDim2.new(1, 0, 0, 26),
			Position = UDim2.fromOffset(0, 62),
		})
		for i = 1, 10 do
			local row = Util.create("Frame", {
				Name = "Row" .. i,
				BackgroundColor3 = if i % 2 == 0 then C(40, 48, 64) else C(34, 41, 56),
				Size = UDim2.new(1, 0, 0, 44),
				Position = UDim2.fromOffset(0, 94 + (i - 1) * 48),
				Parent = root,
			})
			Util.create("UICorner", { CornerRadius = UDim.new(0, 8), Parent = row })
			local medal = if i == 1 then C(255, 205, 60) elseif i == 2 then C(210, 215, 225) elseif i == 3 then C(215, 140, 80) else C(200, 205, 215)
			label(row, { Name = "Rank", Text = "#" .. i, TextColor3 = medal, Size = UDim2.new(0.14, 0, 1, -8), Position = UDim2.fromOffset(4, 4) })
			label(row, {
				Name = "PlayerName",
				Text = "—",
				Font = Enum.Font.GothamBold,
				TextXAlignment = Enum.TextXAlignment.Left,
				Size = UDim2.new(0.56, 0, 1, -12),
				Position = UDim2.new(0.16, 0, 0, 6),
			})
			label(row, {
				Name = "Value",
				Text = "",
				TextColor3 = color,
				TextXAlignment = Enum.TextXAlignment.Right,
				Size = UDim2.new(0.26, 0, 1, -12),
				Position = UDim2.new(0.72, 0, 0, 6),
			})
		end
	end)
	return board
end

local function buildZoneSign(zoneId: number)
	local oz = RiverMath.zoneOriginZ(zoneId)
	local zone = Config.Zones[zoneId]
	local model = newModel("ZoneSign_" .. zoneId, Folders.Hubs)
	local pos = V(0, 0, oz - 34)
	for _, x in { -13, 13 } do
		P(model, {
			Name = "Post",
			Size = V(1.2, 13, 1.2),
			CFrame = CF(pos + V(x, 6.5, 0)),
			Material = "Wood",
			Color = C(110, 80, 50),
		})
	end
	local board = P(model, {
		Name = "Board",
		Size = V(28, 8, 0.8),
		CFrame = CF(pos + V(0, 10, 0)),
		Material = "SmoothPlastic",
		Color = C(28, 34, 46),
	})
	surface(board, Enum.NormalId.Front, function(gui)
		if zoneId == 1 then
			label(gui, {
				Text = "🌊 ЧИСТАЯ РЕКА",
				TextColor3 = zone.Theme.Accent,
				Size = UDim2.fromScale(1, 0.42),
			})
			label(gui, {
				Font = Enum.Font.GothamBold,
				Text = "1) Кликай по мусору в реке  2) Сдавай на ♻️ переработку\n3) Покупай улучшения 🛒  •  Здесь нет доната — всё за монеты!",
				Size = UDim2.fromScale(0.96, 0.5),
				Position = UDim2.fromScale(0.02, 0.46),
			})
		else
			label(gui, {
				Text = string.format("Зона %d • %s", zoneId, zone.Name),
				TextColor3 = zone.Theme.Accent,
				Size = UDim2.fromScale(1, 0.55),
			})
			label(gui, {
				Font = Enum.Font.GothamBold,
				Text = "Мусор здесь дороже. Удачной уборки!",
				Size = UDim2.fromScale(0.9, 0.34),
				Position = UDim2.fromScale(0.05, 0.6),
			})
		end
	end)
end

local function buildSpawn()
	local pos = RiverMath.hubPosition(1)
	local spawn = Util.create("SpawnLocation", {
		Name = "Spawn",
		Size = V(10, 1, 10),
		Anchored = true,
		Neutral = true,
		Duration = 0,
		Material = Enum.Material.SmoothPlastic,
		Color = Config.Zones[1].Theme.Accent,
		TopSurface = Enum.SurfaceType.Smooth,
		Parent = Map,
	})
	spawn.CFrame = CFrame.lookAt(pos + V(0, 0.5, 0), pos + V(0, 0.5, 10))
	for _, child in spawn:GetChildren() do
		if child:IsA("Decal") then
			child:Destroy()
		end
	end
end

local function buildHub(zoneId: number)
	local oz = RiverMath.zoneOriginZ(zoneId)
	local hubZ = oz + W.HubZ
	local zone = Config.Zones[zoneId]

	buildSellPad(zoneId)
	buildStall("ShopStall_" .. zoneId, V(26, 0, hubZ), "🛒 МАГАЗИН", "Сачки • Рюкзаки • Перки", C(90, 170, 255), "Shop", "Открыть магазин")
	buildZoneSign(zoneId)

	if zoneId == 1 then
		buildStall("HelpersStall", V(54, 0, hubZ - 8), "🐾 ПОМОЩНИКИ", "Ловят мусор за тебя", C(255, 170, 60), "Helpers", "Помощники")
		buildFactory(zoneId)
		buildRebirthPortal(zoneId)
		buildLeaderboard("TopTrash", "🏆 ТОП УБОРЩИКОВ", "Мусор", V(-92, 0, oz - 46), R(-90), C(110, 220, 120))
		buildLeaderboard("TopRebirth", "🌀 ТОП ПЕРЕРОЖДЕНИЙ", "Раз", V(92, 0, oz - 46), R(90), C(185, 110, 255))
	else
		buildStall("TeleportStall_" .. zoneId, V(54, 0, hubZ - 8), "🗺️ ТЕЛЕПОРТ", "Быстро в любую открытую зону", zone.Theme.Accent, "Teleport", "Телепорт")
	end
end

----------------------------------------------------------------------
-- Декорации
----------------------------------------------------------------------
local Decor = {}

function Decor.tree(parent, pos: Vector3, rng: Random, leaf: Color3, trunk: Color3, scale: number)
	local model = newModel("Tree", parent)
	local h = rng:NextNumber(7, 11) * scale
	P(model, {
		Name = "Trunk",
		Shape = "Cylinder",
		Size = V(h, 1.6 * scale, 1.6 * scale),
		CFrame = CF(pos + V(0, h / 2, 0)) * UP,
		Material = "Wood",
		Color = trunk,
	})
	for _ = 1, 3 do
		local s = rng:NextNumber(5.5, 8.5) * scale
		P(model, {
			Name = "Leaves",
			Shape = "Ball",
			Size = V(s, s, s),
			CFrame = CF(pos + V(rng:NextNumber(-2, 2) * scale, h + rng:NextNumber(-1, 2) * scale, rng:NextNumber(-2, 2) * scale)),
			Material = "Grass",
			Color = leaf:Lerp(C(255, 255, 200), rng:NextNumber(0, 0.12)),
			CanCollide = false,
		})
	end
end

function Decor.deadTree(parent, pos: Vector3, rng: Random, color: Color3)
	local model = newModel("DeadTree", parent)
	local h = rng:NextNumber(8, 13)
	P(model, {
		Name = "Trunk",
		Shape = "Cylinder",
		Size = V(h, 1.4, 1.4),
		CFrame = CF(pos + V(0, h / 2, 0)) * UP,
		Material = "Wood",
		Color = color,
	})
	for i = 1, 3 do
		local a = R(rng:NextNumber(0, 360))
		local len = rng:NextNumber(3, 5)
		local base = pos + V(0, h * (0.5 + i * 0.13), 0)
		local dir = V(math.cos(a), 0.8, math.sin(a)).Unit
		P(model, {
			Name = "Branch",
			Size = V(0.6, 0.6, len),
			CFrame = CFrame.lookAt(base + dir * len / 2, base + dir * len),
			Material = "Wood",
			Color = color,
			CanCollide = false,
		})
	end
end

function Decor.bush(parent, pos: Vector3, rng: Random, color: Color3)
	local model = newModel("Bush", parent)
	for _ = 1, 3 do
		local s = rng:NextNumber(2.4, 4)
		P(model, {
			Name = "Leaf",
			Shape = "Ball",
			Size = V(s, s, s),
			CFrame = CF(pos + V(rng:NextNumber(-1.5, 1.5), s * 0.35, rng:NextNumber(-1.5, 1.5))),
			Material = "Grass",
			Color = color:Lerp(C(0, 0, 0), rng:NextNumber(0, 0.2)),
			CanCollide = false,
		})
	end
end

function Decor.rock(parent, pos: Vector3, rng: Random, color: Color3)
	local s = rng:NextNumber(2, 5)
	P(parent, {
		Name = "Rock",
		Size = V(s * rng:NextNumber(1, 1.6), s * rng:NextNumber(0.6, 1), s),
		CFrame = CF(pos + V(0, s * 0.25, 0)) * ANG(R(rng:NextNumber(-15, 15)), R(rng:NextNumber(0, 360)), R(rng:NextNumber(-15, 15))),
		Material = "Slate",
		Color = color:Lerp(C(255, 255, 255), rng:NextNumber(0, 0.15)),
	})
end

function Decor.flowers(parent, pos: Vector3, rng: Random)
	local model = newModel("Flowers", parent)
	local colors = { C(255, 90, 120), C(255, 230, 80), C(170, 120, 255), C(255, 255, 255) }
	for _ = 1, 5 do
		local p = pos + V(rng:NextNumber(-2, 2), 0, rng:NextNumber(-2, 2))
		P(model, {
			Name = "Stem",
			Size = V(0.15, 1.2, 0.15),
			CFrame = CF(p + V(0, 0.6, 0)),
			Material = "Grass",
			Color = C(70, 150, 60),
			CanCollide = false,
		})
		P(model, {
			Name = "Bloom",
			Shape = "Ball",
			Size = V(0.6, 0.6, 0.6),
			CFrame = CF(p + V(0, 1.3, 0)),
			Material = "SmoothPlastic",
			Color = colors[rng:NextInteger(1, #colors)],
			CanCollide = false,
		})
	end
end

function Decor.lamp(parent, pos: Vector3, color: Color3)
	local model = newModel("Lamp", parent)
	P(model, {
		Name = "Pole",
		Shape = "Cylinder",
		Size = V(10, 0.5, 0.5),
		CFrame = CF(pos + V(0, 5, 0)) * UP,
		Material = "Metal",
		Color = C(45, 48, 55),
	})
	local bulb = P(model, {
		Name = "Bulb",
		Shape = "Ball",
		Size = V(1.4, 1.4, 1.4),
		CFrame = CF(pos + V(0, 10.4, 0)),
		Material = "Neon",
		Color = color,
		CanCollide = false,
	})
	Util.create("PointLight", { Color = color, Range = 16, Brightness = 1.2, Parent = bulb })
end

function Decor.bench(parent, pos: Vector3, yaw: number)
	local model = newModel("Bench", parent)
	local cf = CF(pos) * ANG(0, yaw, 0)
	local wood = C(150, 105, 65)
	P(model, { Name = "Seat", Size = V(5, 0.3, 1.4), CFrame = cf * CF(0, 1.4, 0), Material = "WoodPlanks", Color = wood })
	P(model, { Name = "Back", Size = V(5, 1.2, 0.25), CFrame = cf * CF(0, 2.3, 0.6), Material = "WoodPlanks", Color = wood })
	for _, x in { -2.1, 2.1 } do
		P(model, { Name = "Leg", Size = V(0.3, 1.3, 1.3), CFrame = cf * CF(x, 0.65, 0), Material = "Metal", Color = C(50, 50, 55) })
	end
end

function Decor.building(parent, pos: Vector3, rng: Random)
	local model = newModel("Building", parent)
	local w = rng:NextNumber(14, 20)
	local d = rng:NextNumber(14, 18)
	local h = rng:NextNumber(22, 42)
	local colors = { C(180, 110, 90), C(150, 160, 175), C(205, 190, 160), C(120, 135, 160), C(190, 150, 120) }
	local color = colors[rng:NextInteger(1, #colors)]
	P(model, { Name = "Body", Size = V(w, h, d), CFrame = CF(pos + V(0, h / 2, 0)), Material = "Concrete", Color = color })
	P(model, {
		Name = "Roof",
		Size = V(w + 1, 1, d + 1),
		CFrame = CF(pos + V(0, h + 0.5, 0)),
		Material = "Slate",
		Color = color:Lerp(C(0, 0, 0), 0.35),
	})
	local floors = math.floor(h / 6)
	for f = 1, floors do
		local y = f * 6 - 2
		for _, side in { -1, 1 } do
			P(model, {
				Name = "Windows",
				Size = V(w - 3, 2.2, 0.2),
				CFrame = CF(pos + V(0, y, side * (d / 2 + 0.1))),
				Material = if rng:NextNumber() < 0.35 then "Neon" else "Glass",
				Color = if rng:NextNumber() < 0.35 then C(255, 225, 150) else C(120, 170, 210),
				CanCollide = false,
			})
		end
	end
end

function Decor.car(parent, pos: Vector3, rng: Random, yaw: number)
	local model = newModel("Car", parent)
	local cf = CF(pos) * ANG(0, yaw, 0)
	local colors = { C(220, 60, 60), C(60, 120, 220), C(240, 200, 60), C(240, 240, 240), C(60, 60, 65) }
	local color = colors[rng:NextInteger(1, #colors)]
	P(model, { Name = "Body", Size = V(4.4, 1.6, 9), CFrame = cf * CF(0, 1.6, 0), Material = "SmoothPlastic", Color = color })
	P(model, { Name = "Cabin", Size = V(4, 1.4, 4.8), CFrame = cf * CF(0, 3.1, -0.4), Material = "Glass", Color = C(110, 150, 180), Transparency = 0.2 })
	for _, x in { -2.2, 2.2 } do
		for _, z in { -2.8, 2.8 } do
			P(model, {
				Name = "Wheel",
				Shape = "Cylinder",
				Size = V(0.8, 1.8, 1.8),
				CFrame = cf * CF(x, 0.9, z),
				Material = "SmoothPlastic",
				Color = C(25, 25, 25),
			})
		end
	end
end

function Decor.mushroom(parent, pos: Vector3, rng: Random)
	local model = newModel("Mushroom", parent)
	local s = rng:NextNumber(0.8, 1.6)
	P(model, {
		Name = "Stem",
		Shape = "Cylinder",
		Size = V(2 * s, 0.8 * s, 0.8 * s),
		CFrame = CF(pos + V(0, s, 0)) * UP,
		Material = "SmoothPlastic",
		Color = C(235, 225, 205),
	})
	P(model, {
		Name = "Cap",
		Shape = "Ball",
		Size = V(2.8 * s, 1.3 * s, 2.8 * s),
		CFrame = CF(pos + V(0, 2.1 * s, 0)),
		Material = "SmoothPlastic",
		Color = if rng:NextNumber() < 0.5 then C(210, 50, 50) else C(160, 90, 200),
		CanCollide = false,
	})
	for _ = 1, 3 do
		local a = R(rng:NextNumber(0, 360))
		P(model, {
			Name = "Spot",
			Shape = "Ball",
			Size = V(0.5 * s, 0.5 * s, 0.5 * s),
			CFrame = CF(pos + V(math.cos(a) * 0.8 * s, 2.55 * s, math.sin(a) * 0.8 * s)),
			Material = "SmoothPlastic",
			Color = C(255, 255, 255),
			CanCollide = false,
		})
	end
end

function Decor.reeds(parent, pos: Vector3, rng: Random)
	local model = newModel("Reeds", parent)
	for _ = 1, 6 do
		local h = rng:NextNumber(3, 5)
		local p = pos + V(rng:NextNumber(-1.5, 1.5), 0, rng:NextNumber(-1.5, 1.5))
		P(model, {
			Name = "Reed",
			Size = V(0.2, h, 0.2),
			CFrame = CF(p + V(0, h / 2 - 1, 0)) * ANG(R(rng:NextNumber(-8, 8)), 0, R(rng:NextNumber(-8, 8))),
			Material = "Grass",
			Color = C(120, 140, 60),
			CanCollide = false,
		})
		P(model, {
			Name = "Head",
			Size = V(0.4, 0.9, 0.4),
			CFrame = CF(p + V(0, h - 0.8, 0)),
			Material = "Fabric",
			Color = C(110, 70, 40),
			CanCollide = false,
		})
	end
end

function Decor.fireflies(parent, pos: Vector3, color: Color3)
	local holder = P(parent, {
		Name = "Fireflies",
		Size = V(14, 6, 14),
		CFrame = CF(pos + V(0, 4, 0)),
		Transparency = 1,
		CanCollide = false,
		CanQuery = false,
		CanTouch = false,
		CastShadow = false,
	})
	Util.create("ParticleEmitter", {
		Texture = "rbxasset://textures/particles/sparkles_main.dds",
		Rate = 3,
		Lifetime = NumberRange.new(3, 5),
		Speed = NumberRange.new(0.3, 0.8),
		SpreadAngle = Vector2.new(180, 180),
		LightEmission = 1,
		Color = ColorSequence.new(color),
		Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.3), NumberSequenceKeypoint.new(0.5, 0.45), NumberSequenceKeypoint.new(1, 0) }),
		Parent = holder,
	})
end

function Decor.factoryBuilding(parent, pos: Vector3, rng: Random)
	local model = newModel("Plant", parent)
	local w = rng:NextNumber(18, 26)
	local h = rng:NextNumber(14, 22)
	P(model, { Name = "Hall", Size = V(w, h, 18), CFrame = CF(pos + V(0, h / 2, 0)), Material = "Concrete", Color = C(140, 140, 135) })
	P(model, {
		Name = "Stripe",
		Size = V(w + 0.2, 1.2, 18.2),
		CFrame = CF(pos + V(0, h - 3, 0)),
		Material = "SmoothPlastic",
		Color = C(235, 150, 50),
	})
	for i = 1, 2 do
		local ch = rng:NextNumber(14, 22)
		local chimney = P(model, {
			Name = "Chimney",
			Shape = "Cylinder",
			Size = V(ch, 3, 3),
			CFrame = CF(pos + V((i - 1.5) * w * 0.5, h + ch / 2, 3)) * UP,
			Material = "Brick",
			Color = C(150, 70, 55),
		})
		smokeEmitter(chimney, C(120, 120, 120))
	end
end

function Decor.pipes(parent, pos: Vector3, yaw: number)
	local model = newModel("Pipes", parent)
	local cf = CF(pos) * ANG(0, yaw, 0)
	for i = 0, 1 do
		P(model, {
			Name = "Pipe",
			Shape = "Cylinder",
			Size = V(16, 1.4, 1.4),
			CFrame = cf * CF(0, 1.6 + i * 1.6, 0),
			Material = "Metal",
			Color = if i == 0 then C(200, 120, 50) else C(90, 140, 190),
		})
	end
	for _, x in { -6, 6 } do
		P(model, { Name = "Support", Size = V(0.6, 3.6, 2.4), CFrame = cf * CF(x, 1.8, 0), Material = "Metal", Color = C(70, 70, 75) })
	end
end

function Decor.barrels(parent, pos: Vector3, rng: Random, color: Color3, glow: boolean)
	local model = newModel("Barrels", parent)
	for i = 1, rng:NextInteger(2, 4) do
		local p = pos + V(rng:NextNumber(-2.5, 2.5), 0, rng:NextNumber(-2.5, 2.5))
		P(model, {
			Name = "Barrel",
			Shape = "Cylinder",
			Size = V(3, 2.2, 2.2),
			CFrame = CF(p + V(0, 1.5, 0)) * UP * ANG(0, R(i * 40), 0),
			Material = "Metal",
			Color = color,
		})
		if glow then
			P(model, {
				Name = "Leak",
				Shape = "Cylinder",
				Size = V(0.15, 2.6, 2.6),
				CFrame = CF(p + V(1.2, 0.08, 0.6)) * UP,
				Material = "Neon",
				Color = C(120, 255, 70),
				CanCollide = false,
			})
		end
	end
end

function Decor.puddle(parent, pos: Vector3, rng: Random)
	local s = rng:NextNumber(4, 9)
	P(parent, {
		Name = "Puddle",
		Shape = "Cylinder",
		Size = V(0.12, s, s),
		CFrame = CF(pos + V(0, 0.06, 0)) * UP,
		Material = "Neon",
		Color = C(110, 255, 70),
		Transparency = 0.25,
		CanCollide = false,
	})
end

function Decor.warning(parent, pos: Vector3, yaw: number, text: string)
	local model = newModel("Warning", parent)
	local cf = CF(pos) * ANG(0, yaw, 0)
	P(model, { Name = "Post", Size = V(0.4, 5, 0.4), CFrame = cf * CF(0, 2.5, 0), Material = "Metal", Color = C(80, 80, 85) })
	local board = P(model, {
		Name = "Board",
		Size = V(4, 3, 0.3),
		CFrame = cf * CF(0, 5, 0),
		Material = "SmoothPlastic",
		Color = C(250, 210, 40),
	})
	for _, face in { Enum.NormalId.Front, Enum.NormalId.Back } do
		surface(board, face, function(gui)
			label(gui, { Text = text, TextColor3 = C(25, 25, 25), Size = UDim2.fromScale(0.9, 0.8), Position = UDim2.fromScale(0.05, 0.1) })
		end)
	end
end

function Decor.palm(parent, pos: Vector3, rng: Random)
	local model = newModel("Palm", parent)
	local lean = R(rng:NextNumber(6, 14))
	local yaw = R(rng:NextNumber(0, 360))
	local base = CF(pos) * ANG(0, yaw, 0)
	local top = pos
	for i = 0, 4 do
		local seg = base * ANG(lean * i * 0.35, 0, 0) * CF(0, i * 2.6 + 1.3, 0)
		P(model, {
			Name = "Trunk",
			Shape = "Cylinder",
			Size = V(2.8, 1.3 - i * 0.08, 1.3 - i * 0.08),
			CFrame = seg * UP,
			Material = "Wood",
			Color = C(150, 115, 75):Lerp(C(110, 85, 55), i / 4),
		})
		top = seg.Position + seg.UpVector * 1.3
	end
	for i = 0, 5 do
		local a = R(i * 60)
		local dir = V(math.cos(a), -0.35, math.sin(a)).Unit
		P(model, {
			Name = "Frond",
			Size = V(1.6, 0.15, 6),
			CFrame = CFrame.lookAt(top + dir * 3, top + dir * 6),
			Material = "Grass",
			Color = C(70, 160, 70),
			CanCollide = false,
		})
	end
	for i = 0, 2 do
		local a = R(i * 120 + 30)
		P(model, {
			Name = "Coconut",
			Shape = "Ball",
			Size = V(0.9, 0.9, 0.9),
			CFrame = CF(top + V(math.cos(a) * 0.7, -0.6, math.sin(a) * 0.7)),
			Material = "SmoothPlastic",
			Color = C(100, 70, 40),
			CanCollide = false,
		})
	end
end

function Decor.umbrella(parent, pos: Vector3, rng: Random)
	local model = newModel("BeachUmbrella", parent)
	local colors = { C(255, 90, 90), C(70, 160, 255), C(255, 210, 60), C(120, 220, 120) }
	P(model, {
		Name = "Pole",
		Shape = "Cylinder",
		Size = V(7, 0.3, 0.3),
		CFrame = CF(pos + V(0, 3.5, 0)) * UP,
		Material = "Metal",
		Color = C(230, 230, 230),
	})
	P(model, {
		Name = "Canopy",
		Shape = "Ball",
		Size = V(8, 1.6, 8),
		CFrame = CF(pos + V(0, 7, 0)),
		Material = "Fabric",
		Color = colors[rng:NextInteger(1, #colors)],
		CanCollide = false,
	})
	P(model, {
		Name = "Towel",
		Size = V(3, 0.1, 6),
		CFrame = CF(pos + V(2.5, 0.05, 0)) * ANG(0, R(rng:NextNumber(-20, 20)), 0),
		Material = "Fabric",
		Color = colors[rng:NextInteger(1, #colors)],
		CanCollide = false,
	})
end

function Decor.lighthouse(parent, pos: Vector3)
	local model = newModel("Lighthouse", parent)
	for i = 0, 5 do
		P(model, {
			Name = "Segment",
			Shape = "Cylinder",
			Size = V(6, 9 - i * 0.6, 9 - i * 0.6),
			CFrame = CF(pos + V(0, 3 + i * 6, 0)) * UP,
			Material = "SmoothPlastic",
			Color = if i % 2 == 0 then C(240, 240, 240) else C(220, 50, 50),
		})
	end
	local lamp = P(model, {
		Name = "Lamp",
		Shape = "Ball",
		Size = V(4, 4, 4),
		CFrame = CF(pos + V(0, 38, 0)),
		Material = "Neon",
		Color = C(255, 240, 160),
	})
	Util.create("PointLight", { Color = C(255, 240, 160), Range = 40, Brightness = 2, Parent = lamp })
	P(model, {
		Name = "Cap",
		Shape = "Cylinder",
		Size = V(1.5, 5, 5),
		CFrame = CF(pos + V(0, 40.8, 0)) * UP,
		Material = "Metal",
		Color = C(60, 60, 65),
	})
end

-- Места для декораций: не на дорожках, не у базы, не у реки
local function freeSpot(zoneId: number, x: number, z: number): boolean
	local oz = RiverMath.zoneOriginZ(zoneId)
	local rz = RiverMath.riverZ(zoneId)
	local localZ = z - oz
	if math.abs(z - rz) < W.RiverWidth / 2 + 5 then
		return false
	end
	if math.abs(localZ) > W.HalfDepth - 4 then
		return false
	end
	-- база
	local hubHalf = if zoneId == 1 then 100 else 46
	if math.abs(x) < hubHalf and localZ > -92 and localZ < -20 then
		return false
	end
	-- дорожки
	if math.abs(localZ + 26) < 6 or math.abs(localZ - 50) < 6 then
		return false
	end
	for _, bx in W.BridgeX do
		if math.abs(x - bx) < 8 and localZ < 56 then
			return false
		end
	end
	if math.abs(x) < 12 and localZ > 44 then
		return false
	end
	if math.abs(x) > W.HalfWidth - 4 then
		return false
	end
	return true
end

local function scatter(zoneId: number, rng: Random, count: number, minGap: number, placer: (Vector3) -> ())
	local oz = RiverMath.zoneOriginZ(zoneId)
	local placed: { Vector3 } = {}
	local tries = 0
	while #placed < count and tries < count * 30 do
		tries += 1
		local x = rng:NextNumber(-W.HalfWidth + 4, W.HalfWidth - 4)
		local z = oz + rng:NextNumber(-W.HalfDepth + 4, W.HalfDepth - 4)
		if freeSpot(zoneId, x, z) then
			local pos = V(x, 0, z)
			local ok = true
			for _, other in placed do
				if (other - pos).Magnitude < minGap then
					ok = false
					break
				end
			end
			if ok then
				table.insert(placed, pos)
				placer(pos)
			end
		end
	end
end

-- Полоса за забором (между стеной и морем) — для крупных декораций
local function outskirts(zoneId: number, rng: Random, count: number, placer: (Vector3, number) -> ())
	local oz = RiverMath.zoneOriginZ(zoneId)
	local rz = RiverMath.riverZ(zoneId)
	for i = 1, count do
		local side = if i % 2 == 0 then 1 else -1
		local z = oz + rng:NextNumber(-W.HalfDepth + 10, W.HalfDepth - 10)
		if math.abs(z - rz) > W.RiverWidth / 2 + 12 then
			local x = side * rng:NextNumber(W.HalfWidth + 8, LAND_HALF_X - 6)
			placer(V(x, 0, z), side)
		end
	end
end

local function decorateZone(zoneId: number)
	local zone = Config.Zones[zoneId]
	local theme = zone.Theme.Decor
	local rng = Random.new(zoneId * 7919)
	local folder = Instance.new("Folder")
	folder.Name = "Decor_" .. zoneId
	folder.Parent = Folders.Decor
	local oz = RiverMath.zoneOriginZ(zoneId)
	local rz = RiverMath.riverZ(zoneId)

	-- камыши вдоль берегов
	if theme == "Meadow" or theme == "Swamp" or theme == "Ocean" then
		for i = 1, 10 do
			local x = rng:NextNumber(-W.HalfWidth + 8, W.HalfWidth - 8)
			local side = if i % 2 == 0 then 1 else -1
			local z = rz + side * (W.RiverWidth / 2 + rng:NextNumber(1.5, 3.5))
			if math.abs(x - W.BridgeX[1]) > 9 and math.abs(x - W.BridgeX[2]) > 9 then
				Decor.reeds(folder, V(x, 0, z), rng)
			end
		end
	end

	if theme == "Meadow" then
		scatter(zoneId, rng, 26, 9, function(pos)
			local r = rng:NextNumber()
			if r < 0.4 then
				Decor.tree(folder, pos, rng, C(80, 170, 70), C(110, 80, 50), rng:NextNumber(0.9, 1.25))
			elseif r < 0.6 then
				Decor.bush(folder, pos, rng, C(70, 150, 60))
			elseif r < 0.8 then
				Decor.flowers(folder, pos, rng)
			else
				Decor.rock(folder, pos, rng, C(130, 130, 125))
			end
		end)
		outskirts(zoneId, rng, 14, function(pos)
			Decor.tree(folder, pos, rng, C(70, 160, 65), C(105, 75, 45), rng:NextNumber(1.1, 1.5))
		end)
		for _, x in { -40, 40 } do
			Decor.bench(folder, V(x, 0, oz - 21), R(180))
		end
	elseif theme == "City" then
		for x = -100, 100, 25 do
			if math.abs(x - W.BridgeX[1]) > 8 and math.abs(x - W.BridgeX[2]) > 8 then
				Decor.lamp(folder, V(x, 0, rz - W.RiverWidth / 2 - 4), C(255, 225, 160))
				Decor.lamp(folder, V(x, 0, rz + W.RiverWidth / 2 + 4), C(255, 225, 160))
			end
		end
		scatter(zoneId, rng, 14, 12, function(pos)
			local r = rng:NextNumber()
			if r < 0.4 then
				Decor.tree(folder, pos, rng, C(60, 140, 60), C(90, 65, 45), 0.9)
			elseif r < 0.7 then
				Decor.car(folder, pos, rng, R(rng:NextNumber(0, 360)))
			else
				Decor.bench(folder, pos, R(rng:NextNumber(0, 360)))
			end
		end)
		outskirts(zoneId, rng, 12, function(pos)
			Decor.building(folder, pos, rng)
		end)
	elseif theme == "Swamp" then
		scatter(zoneId, rng, 26, 9, function(pos)
			local r = rng:NextNumber()
			if r < 0.4 then
				Decor.deadTree(folder, pos, rng, C(70, 60, 45))
			elseif r < 0.7 then
				Decor.mushroom(folder, pos, rng)
			elseif r < 0.85 then
				Decor.bush(folder, pos, rng, C(70, 95, 50))
			else
				Decor.fireflies(folder, pos, C(210, 255, 120))
			end
		end)
		outskirts(zoneId, rng, 14, function(pos)
			Decor.deadTree(folder, pos, rng, C(60, 52, 40))
		end)
		for i = 1, 5 do
			Decor.fireflies(folder, V(-90 + i * 30, 0, rz), C(220, 255, 130))
		end
	elseif theme == "Industrial" then
		scatter(zoneId, rng, 16, 12, function(pos)
			local r = rng:NextNumber()
			if r < 0.4 then
				Decor.pipes(folder, pos, R(rng:NextNumber(0, 180)))
			elseif r < 0.75 then
				Decor.barrels(folder, pos, rng, C(60, 100, 160), false)
			else
				Decor.rock(folder, pos, rng, C(100, 100, 105))
			end
		end)
		outskirts(zoneId, rng, 8, function(pos)
			Decor.factoryBuilding(folder, pos, rng)
		end)
	elseif theme == "Toxic" then
		scatter(zoneId, rng, 24, 9, function(pos)
			local r = rng:NextNumber()
			if r < 0.35 then
				Decor.puddle(folder, pos, rng)
			elseif r < 0.6 then
				Decor.barrels(folder, pos, rng, C(230, 195, 40), true)
			elseif r < 0.8 then
				Decor.deadTree(folder, pos, rng, C(85, 85, 80))
			else
				Decor.warning(folder, pos, R(rng:NextNumber(0, 360)), "☢ ОПАСНО")
			end
		end)
		outskirts(zoneId, rng, 10, function(pos)
			Decor.factoryBuilding(folder, pos, rng)
		end)
		for i = 1, 5 do
			Decor.fireflies(folder, V(-90 + i * 30, -2, rz), C(130, 255, 90))
		end
	elseif theme == "Ocean" then
		scatter(zoneId, rng, 22, 10, function(pos)
			local r = rng:NextNumber()
			if r < 0.45 then
				Decor.palm(folder, pos, rng)
			elseif r < 0.7 then
				Decor.umbrella(folder, pos, rng)
			else
				Decor.rock(folder, pos, rng, C(170, 160, 140))
			end
		end)
		outskirts(zoneId, rng, 14, function(pos)
			Decor.palm(folder, pos, rng)
		end)
		Decor.lighthouse(folder, V(100, 0, oz + W.HalfDepth + 14))
	end
end

----------------------------------------------------------------------
-- Публичное API
----------------------------------------------------------------------
function WorldService.map(): Folder
	return Map
end

function WorldService.folder(name: string): Folder
	return Folders[name]
end

function WorldService:Init()
	local old = workspace:FindFirstChild("Map")
	if old then
		old:Destroy()
	end
	-- в новом месте Studio есть Baseplate — убираем, у нас свой остров
	local baseplate = workspace:FindFirstChild("Baseplate")
	if baseplate then
		baseplate:Destroy()
	end

	Map = Instance.new("Folder")
	Map.Name = "Map"
	for _, name in { "Walls", "Fences", "Gates", "River", "Bridges", "SellPads", "Hubs", "Leaderboards", "Decor" } do
		local folder = Instance.new("Folder")
		folder.Name = name
		folder.Parent = Map
		Folders[name] = folder
	end

	setupLighting()
	buildTerrain()
	buildWalls()
	for zoneId = 1, #Config.Zones do
		buildRiverEnds(zoneId)
		buildBridges(zoneId)
		buildHub(zoneId)
		decorateZone(zoneId)
		if zoneId < #Config.Zones then
			buildGate(zoneId)
		end
	end
	Map.Parent = workspace
	buildSpawn()
end

return WorldService
