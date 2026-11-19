--[[
	HelperModels — модели помощников (утёнок, енот, робот, дрон, кит, НЛО...).
	Перед модели смотрит в -Z. Модель строится вокруг невидимой детали Root.
]]

local Util = require(script.Parent.Util)

local HelperModels = {}

local V = Vector3.new
local C = Color3.fromRGB
local CF = CFrame.new
local ANG = CFrame.Angles
local R = math.rad

local UP = ANG(0, 0, R(90))
local ALONG_Z = ANG(0, R(90), 0)

local function P(shape: string, size: Vector3, color: Color3, mat: string?, cf: CFrame?, extra: any?)
	return { shape = shape, size = size, color = color, mat = mat, cf = cf, extra = extra }
end

local BLACK = C(20, 20, 24)
local WHITE = C(250, 250, 250)

local B = {}

B.duck = function()
	local yellow = C(255, 220, 60)
	return {
		P("Ball", V(1.6, 1.3, 2.0), yellow),
		P("Ball", V(1.1, 1.1, 1.1), yellow, nil, CF(0, 0.85, -0.75)),
		P("Block", V(0.5, 0.22, 0.5), C(255, 140, 30), nil, CF(0, 0.75, -1.35)),
		P("Ball", V(0.2, 0.2, 0.2), BLACK, nil, CF(0.3, 1.0, -1.2)),
		P("Ball", V(0.2, 0.2, 0.2), BLACK, nil, CF(-0.3, 1.0, -1.2)),
		P("Ball", V(0.6, 0.5, 0.6), yellow, nil, CF(0, 0.35, 1.0)),
		P("Ball", V(0.4, 0.8, 1.2), C(240, 200, 40), nil, CF(0.78, 0.1, 0.1)),
		P("Ball", V(0.4, 0.8, 1.2), C(240, 200, 40), nil, CF(-0.78, 0.1, 0.1)),
	}
end

B.frog = function()
	local green = C(90, 200, 80)
	return {
		P("Ball", V(1.8, 1.1, 1.8), green),
		P("Ball", V(1.4, 0.8, 1.4), C(200, 240, 170), nil, CF(0, -0.15, -0.25)),
		P("Ball", V(0.6, 0.6, 0.6), WHITE, nil, CF(0.45, 0.6, -0.5)),
		P("Ball", V(0.6, 0.6, 0.6), WHITE, nil, CF(-0.45, 0.6, -0.5)),
		P("Ball", V(0.3, 0.3, 0.3), BLACK, nil, CF(0.45, 0.65, -0.75)),
		P("Ball", V(0.3, 0.3, 0.3), BLACK, nil, CF(-0.45, 0.65, -0.75)),
		P("Block", V(0.9, 0.06, 0.1), C(60, 120, 50), nil, CF(0, 0.05, -0.9)),
		P("Ball", V(0.6, 0.4, 0.9), green, nil, CF(0.8, -0.4, 0.3)),
		P("Ball", V(0.6, 0.4, 0.9), green, nil, CF(-0.8, -0.4, 0.3)),
	}
end

B.raccoon = function()
	local grey = C(130, 130, 135)
	return {
		P("Ball", V(1.5, 1.3, 1.9), grey),
		P("Ball", V(1.2, 1.2, 1.2), grey, nil, CF(0, 0.8, -0.8)),
		P("Block", V(1.0, 0.3, 0.2), C(30, 30, 30), nil, CF(0, 0.9, -1.33)),
		P("Ball", V(0.18, 0.18, 0.18), WHITE, nil, CF(0.25, 0.92, -1.44)),
		P("Ball", V(0.18, 0.18, 0.18), WHITE, nil, CF(-0.25, 0.92, -1.44)),
		P("Ball", V(0.4, 0.4, 0.4), C(230, 230, 230), nil, CF(0, 0.65, -1.38)),
		P("Ball", V(0.15, 0.15, 0.15), BLACK, nil, CF(0, 0.72, -1.56)),
		P("Block", V(0.3, 0.35, 0.15), C(90, 90, 95), nil, CF(0.4, 1.4, -0.75)),
		P("Block", V(0.3, 0.35, 0.15), C(90, 90, 95), nil, CF(-0.4, 1.4, -0.75)),
		P("Cylinder", V(1.2, 0.45, 0.45), grey, nil, CF(0, 0.2, 1.3) * ALONG_Z),
		P("Cylinder", V(0.25, 0.48, 0.48), C(30, 30, 30), nil, CF(0, 0.2, 1.15) * ALONG_Z),
		P("Cylinder", V(0.25, 0.48, 0.48), C(30, 30, 30), nil, CF(0, 0.2, 1.65) * ALONG_Z),
	}
end

B.beaver = function()
	local brown = C(140, 90, 50)
	return {
		P("Ball", V(1.6, 1.3, 2.0), brown),
		P("Ball", V(1.1, 1.1, 1.1), brown, nil, CF(0, 0.75, -0.85)),
		P("Block", V(0.3, 0.25, 0.06), WHITE, nil, CF(0, 0.45, -1.38)),
		P("Ball", V(0.2, 0.2, 0.2), BLACK, nil, CF(0, 0.75, -1.4)),
		P("Ball", V(0.16, 0.16, 0.16), BLACK, nil, CF(0.28, 0.95, -1.28)),
		P("Ball", V(0.16, 0.16, 0.16), BLACK, nil, CF(-0.28, 0.95, -1.28)),
		P("Block", V(0.9, 0.18, 1.3), C(70, 50, 40), nil, CF(0, -0.2, 1.5) * ANG(R(-15), 0, 0)),
		P("Ball", V(0.25, 0.25, 0.25), C(110, 70, 40), nil, CF(0.4, 1.25, -0.7)),
		P("Ball", V(0.25, 0.25, 0.25), C(110, 70, 40), nil, CF(-0.4, 1.25, -0.7)),
	}
end

B.robot = function()
	local steel = C(170, 180, 190)
	return {
		P("Block", V(1.4, 1.3, 1.1), steel, "Metal"),
		P("Block", V(1.1, 0.8, 0.9), C(190, 200, 210), "Metal", CF(0, 1.1, 0)),
		P("Block", V(0.9, 0.3, 0.05), C(80, 230, 255), "Neon", CF(0, 1.15, -0.46)),
		P("Cylinder", V(0.6, 0.08, 0.08), C(120, 120, 130), "Metal", CF(0, 1.75, 0) * UP),
		P("Ball", V(0.25, 0.25, 0.25), C(255, 60, 60), "Neon", CF(0, 2.1, 0)),
		P("Block", V(0.25, 0.9, 0.25), C(140, 150, 160), "Metal", CF(0.85, 0, 0)),
		P("Block", V(0.25, 0.9, 0.25), C(140, 150, 160), "Metal", CF(-0.85, 0, 0)),
		P("Cylinder", V(0.5, 0.6, 0.6), C(60, 62, 70), "Metal", CF(0, -0.85, 0) * UP),
		P("Cylinder", V(0.1, 0.45, 0.45), C(255, 150, 40), "Neon", CF(0, -1.12, 0) * UP),
		P("Ball", V(0.3, 0.3, 0.3), C(90, 255, 120), "Neon", CF(0, 0.2, -0.56)),
	}
end

B.drone = function()
	local dark = C(40, 42, 48)
	local parts = {
		P("Block", V(1.3, 0.45, 1.3), dark, "Metal"),
		P("Ball", V(0.8, 0.5, 0.8), C(120, 220, 255), "Glass", CF(0, 0.3, 0), { tr = 0.3 }),
		P("Block", V(2.6, 0.12, 0.18), dark, "Metal", ANG(0, R(45), 0)),
		P("Block", V(2.6, 0.12, 0.18), dark, "Metal", ANG(0, R(-45), 0)),
		P("Ball", V(0.25, 0.25, 0.25), C(255, 60, 60), "Neon", CF(0, -0.15, -0.66)),
		P("Block", V(0.15, 0.4, 0.15), C(120, 120, 130), "Metal", CF(0, -0.42, 0)),
	}
	for _, x in { -0.92, 0.92 } do
		for _, z in { -0.92, 0.92 } do
			table.insert(parts, P("Cylinder", V(0.2, 0.25, 0.25), dark, "Metal", CF(x, 0.12, z) * UP))
			local rotor = P("Cylinder", V(0.05, 1.0, 1.0), C(220, 225, 230), "SmoothPlastic", CF(x, 0.26, z) * UP, { tr = 0.45 })
			rotor.name = "Rotor"
			table.insert(parts, rotor)
		end
	end
	return parts
end

B.whale = function()
	local blue = C(70, 130, 210)
	return {
		P("Ball", V(2.8, 2.2, 4.2), blue),
		P("Ball", V(2.2, 1.6, 3.4), C(200, 225, 245), nil, CF(0, -0.45, -0.2)),
		P("Block", V(0.9, 0.2, 1.4), blue, nil, CF(0, 0.25, 2.3)),
		P("Block", V(1.2, 0.15, 0.7), blue, nil, CF(0.55, 0.3, 2.85) * ANG(0, R(-25), 0)),
		P("Block", V(1.2, 0.15, 0.7), blue, nil, CF(-0.55, 0.3, 2.85) * ANG(0, R(25), 0)),
		P("Block", V(1.2, 0.15, 0.6), blue, nil, CF(1.45, -0.3, -0.3) * ANG(0, 0, R(-25))),
		P("Block", V(1.2, 0.15, 0.6), blue, nil, CF(-1.45, -0.3, -0.3) * ANG(0, 0, R(25))),
		P("Ball", V(0.3, 0.3, 0.3), BLACK, nil, CF(1.05, 0.3, -1.4)),
		P("Ball", V(0.3, 0.3, 0.3), BLACK, nil, CF(-1.05, 0.3, -1.4)),
		P("Ball", V(0.4, 0.4, 0.4), C(120, 230, 255), "Neon", CF(0, 1.3, -0.8)),
	}
end

B.ufo = function()
	local parts = {
		P("Cylinder", V(0.5, 3.6, 3.6), C(170, 175, 185), "Metal", UP, { refl = 0.3 }),
		P("Cylinder", V(0.2, 3.9, 3.9), C(80, 240, 255), "Neon", CF(0, -0.05, 0) * UP),
		P("Ball", V(1.7, 1.4, 1.7), C(150, 230, 255), "Glass", CF(0, 0.5, 0), { tr = 0.35 }),
		P("Ball", V(0.6, 0.6, 0.6), C(120, 230, 90), nil, CF(0, 0.55, 0)),
		P("Ball", V(0.15, 0.15, 0.15), BLACK, nil, CF(0.12, 0.65, -0.26)),
		P("Ball", V(0.15, 0.15, 0.15), BLACK, nil, CF(-0.12, 0.65, -0.26)),
		P("Cylinder", V(0.15, 1.4, 1.4), C(255, 240, 120), "Neon", CF(0, -0.32, 0) * UP),
	}
	local colors = { C(255, 80, 80), C(255, 230, 80), C(80, 255, 140), C(80, 170, 255) }
	for i = 0, 7 do
		local a = R(i * 45)
		table.insert(
			parts,
			P("Ball", V(0.3, 0.3, 0.3), colors[i % 4 + 1], "Neon", CF(math.cos(a) * 1.6, 0.18, math.sin(a) * 1.6))
		)
	end
	return parts
end

-- Масштаб помощников (крупные — побольше)
local SCALE = {
	duck = 0.8,
	frog = 0.8,
	raccoon = 0.85,
	beaver = 0.85,
	robot = 0.85,
	drone = 1,
	whale = 1,
	ufo = 0.9,
}

function HelperModels.has(key: string): boolean
	return B[key] ~= nil
end

function HelperModels.build(key: string): Model
	local builder = B[key] or B.duck
	local specs = builder()
	local scale = SCALE[key] or 1

	local model = Instance.new("Model")
	model.Name = key

	local root = Instance.new("Part")
	root.Name = "Root"
	root.Size = V(0.5, 0.5, 0.5)
	root.Transparency = 1
	root.Anchored = true
	root.CanCollide = false
	root.CanTouch = false
	root.CanQuery = false
	root.CastShadow = false
	root.CFrame = CFrame.identity
	root.Parent = model

	for index, spec in specs do
		local part = Instance.new("Part")
		part.Name = spec.name or ("P" .. index)
		Util.applyShape(part, spec.shape, spec.size * scale)
		part.Color = spec.color
		part.Material = Util.material(spec.mat)
		part.TopSurface = Enum.SurfaceType.Smooth
		part.BottomSurface = Enum.SurfaceType.Smooth
		part.Anchored = true
		part.CanCollide = false
		part.CanTouch = false
		part.CanQuery = false
		part.CastShadow = false
		local cf = spec.cf or CFrame.identity
		part.CFrame = CFrame.new(cf.Position * scale) * cf.Rotation
		if spec.extra then
			part.Transparency = spec.extra.tr or 0
			part.Reflectance = spec.extra.refl or 0
		end
		part.Parent = model
	end

	model.PrimaryPart = root
	return model
end

return HelperModels
