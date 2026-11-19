--[[
	TrashModels — 3D-модели мусора, собранные из простых деталей.
	Никаких внешних ассетов: всё работает сразу после открытия места.

	TrashModels.build(key)     -> Model (PrimaryPart = невидимый Hitbox для кликов)
	TrashModels.decorate(model, key) -> подсветка и подпись для редких предметов

	Подсказка: у цилиндра в Roblox ось идёт вдоль X.
]]

local Config = require(script.Parent.Config)
local Util = require(script.Parent.Util)

local TrashModels = {}

local V = Vector3.new
local C = Color3.fromRGB
local CF = CFrame.new
local ANG = CFrame.Angles
local R = math.rad

local UP = ANG(0, 0, R(90)) -- ось цилиндра вертикально
local ALONG_Z = ANG(0, R(90), 0) -- ось цилиндра вдоль Z

type Spec = {
	shape: string,
	size: Vector3,
	color: Color3,
	mat: string?,
	cf: CFrame?,
	extra: { tr: number?, refl: number? }?,
}

-- Поворот, при котором ось X детали (ось цилиндра) смотрит вдоль dir.
-- CFrame.lookAt тут не годится: при направлении строго вверх он вырождается.
local function alongAxis(pos: Vector3, dir: Vector3): CFrame
	local d = dir.Unit
	local dot = Vector3.xAxis:Dot(d)
	if dot > 0.9999 then
		return CF(pos)
	elseif dot < -0.9999 then
		return CF(pos) * ANG(0, math.pi, 0)
	end
	return CF(pos) * CFrame.fromAxisAngle(Vector3.xAxis:Cross(d).Unit, math.acos(dot))
end

local function P(shape: string, size: Vector3, color: Color3, mat: string?, cf: CFrame?, extra: any?): Spec
	return { shape = shape, size = size, color = color, mat = mat, cf = cf, extra = extra }
end

local B: { [string]: () -> ({ Spec }, Vector3) } = {}

----------------------------------------------------------------------
-- Зона 1: Тихий ручей
----------------------------------------------------------------------
B.paper = function()
	return {
		P("Ball", V(1.3, 1.1, 1.2), C(236, 232, 220), "Fabric"),
		P("Ball", V(0.9, 0.8, 0.9), C(222, 216, 200), "Fabric", CF(0.45, 0.15, 0.2)),
		P("Ball", V(0.7, 0.6, 0.7), C(242, 240, 232), "Fabric", CF(-0.35, 0.2, -0.3)),
	}, V(2.6, 2, 2.6)
end

local function bottle(body: Color3, label: Color3, cap: Color3, tr: number, glow: Color3?)
	local parts = {
		P("Cylinder", V(2.2, 1, 1), body, "Glass", nil, { tr = tr }),
		P("Cylinder", V(0.9, 1.04, 1.04), label, "SmoothPlastic", CF(-0.2, 0, 0)),
		P("Cylinder", V(0.55, 0.55, 0.55), body, "Glass", CF(1.35, 0, 0), { tr = tr }),
		P("Cylinder", V(0.25, 0.62, 0.62), cap, "SmoothPlastic", CF(1.72, 0, 0)),
	}
	if glow then
		table.insert(parts, P("Cylinder", V(1.8, 0.7, 0.7), glow, "Neon", CF(0.1, 0, 0)))
	end
	return parts, V(3.6, 2, 2.4)
end

B.bottle = function()
	return bottle(C(140, 205, 235), C(60, 165, 95), C(220, 50, 50), 0.35)
end

B.goldbottle = function()
	return bottle(C(255, 205, 60), C(255, 245, 200), C(255, 255, 255), 0.25, C(255, 215, 90))
end

B.can = function()
	return {
		P("Cylinder", V(1.5, 1, 1), C(210, 40, 45), "Metal"),
		P("Cylinder", V(0.6, 1.02, 1.02), C(245, 245, 245), "SmoothPlastic"),
		P("Cylinder", V(0.1, 1.04, 1.04), C(200, 200, 205), "Metal", CF(0.72, 0, 0)),
		P("Cylinder", V(0.1, 1.04, 1.04), C(200, 200, 205), "Metal", CF(-0.72, 0, 0)),
	}, V(2.6, 2, 2.6)
end

B.bag = function()
	return {
		P("Ball", V(2.2, 0.7, 1.7), C(245, 245, 240), "SmoothPlastic", nil, { tr = 0.15 }),
		P("Ball", V(1.3, 0.55, 1.1), C(235, 235, 230), "SmoothPlastic", CF(0.9, 0.15, 0.1), { tr = 0.15 }),
		P("Block", V(0.15, 0.15, 0.9), C(230, 60, 60), "SmoothPlastic", CF(1.55, 0.2, 0)),
	}, V(3.2, 1.8, 2.6)
end

B.boot = function()
	local leather = C(115, 72, 40)
	return {
		P("Block", V(1.1, 0.3, 2.5), C(40, 32, 28), "Rubber", CF(0, -0.45, 0)),
		P("Block", V(1.0, 0.7, 1.9), leather, "Fabric", CF(0, 0, 0.2)),
		P("Ball", V(1.0, 0.75, 1.0), leather, "Fabric", CF(0, -0.05, -0.85)),
		P("Block", V(1.0, 1.4, 0.9), C(105, 66, 38), "Fabric", CF(0, 0.6, 0.75)),
		P("Block", V(0.9, 0.08, 0.6), C(230, 230, 220), "Fabric", CF(0, 0.38, -0.2)),
	}, V(2.6, 2.8, 3.2)
end

B.rod = function()
	return {
		P("Cylinder", V(5.5, 0.25, 0.25), C(70, 45, 25), "Wood"),
		P("Cylinder", V(2.2, 0.12, 0.12), C(225, 225, 225), "SmoothPlastic", CF(3.8, 0, 0)),
		P("Cylinder", V(0.4, 0.8, 0.8), C(90, 90, 100), "Metal", CF(-1.6, -0.1, 0.45) * ALONG_Z),
		P("Ball", V(0.55, 0.55, 0.55), C(230, 40, 40), "SmoothPlastic", CF(4.4, 0.05, 0.9)),
		P("Ball", V(0.35, 0.35, 0.35), C(245, 245, 245), "SmoothPlastic", CF(4.4, 0.35, 0.9)),
	}, V(8, 2, 2.8)
end

----------------------------------------------------------------------
-- Зона 2: Городской канал
----------------------------------------------------------------------
B.cup = function()
	return {
		P("Cylinder", V(1.6, 1, 1), C(250, 250, 245), "SmoothPlastic"),
		P("Cylinder", V(0.7, 1.07, 1.07), C(150, 100, 60), "Cardboard", CF(-0.1, 0, 0)),
		P("Cylinder", V(0.18, 1.12, 1.12), C(60, 40, 30), "SmoothPlastic", CF(0.84, 0, 0)),
	}, V(2.6, 2, 2.6)
end

B.pizzabox = function()
	return {
		P("Block", V(3, 0.35, 3), C(205, 165, 115), "Cardboard"),
		P("Block", V(3, 0.1, 3), C(195, 155, 105), "Cardboard", CF(0, 0.3, 0.35) * ANG(R(-12), 0, 0)),
		P("Ball", V(0.9, 0.05, 0.7), C(160, 110, 55), "SmoothPlastic", CF(0.5, 0.45, 0.2)),
		P("Block", V(1.4, 0.03, 0.5), C(220, 50, 40), "SmoothPlastic", CF(-0.5, 0.42, -0.6)),
	}, V(3.6, 1.6, 3.6)
end

B.ball = function()
	return {
		P("Ball", V(1.9, 1.9, 1.9), C(255, 120, 40), "SmoothPlastic"),
		P("Cylinder", V(0.12, 1.94, 1.94), C(30, 30, 30), "SmoothPlastic"),
		P("Cylinder", V(0.12, 1.94, 1.94), C(30, 30, 30), "SmoothPlastic", ALONG_Z),
	}, V(2.8, 2.8, 2.8)
end

B.cone = function()
	local orange = C(255, 110, 20)
	local white = C(245, 245, 245)
	return {
		P("Block", V(0.3, 2.2, 2.2), C(35, 35, 35), "Rubber", CF(-1.25, 0, 0)),
		P("Cylinder", V(0.7, 1.9, 1.9), orange, "SmoothPlastic", CF(-0.8, 0, 0)),
		P("Cylinder", V(0.7, 1.55, 1.55), white, "SmoothPlastic", CF(-0.1, 0, 0)),
		P("Cylinder", V(0.7, 1.2, 1.2), orange, "SmoothPlastic", CF(0.6, 0, 0)),
		P("Cylinder", V(0.5, 0.85, 0.85), white, "SmoothPlastic", CF(1.2, 0, 0)),
	}, V(3.4, 2.6, 2.6)
end

B.wheel = function()
	local parts = {
		P("Cylinder", V(0.3, 3, 3), C(25, 25, 25), "Rubber", UP),
		P("Cylinder", V(0.32, 2.55, 2.55), C(190, 195, 205), "Metal", UP, { tr = 0.6 }),
		P("Cylinder", V(0.5, 0.5, 0.5), C(160, 160, 170), "Metal", UP),
	}
	for i = 0, 2 do
		table.insert(parts, P("Block", V(0.06, 0.06, 2.5), C(200, 200, 210), "Metal", ANG(0, R(i * 60), 0)))
	end
	return parts, V(3.6, 1.6, 3.6)
end

B.cart = function()
	local grey = C(170, 175, 185)
	local tilt = ANG(0, 0, R(18))
	local parts = {
		P("Block", V(3.4, 0.15, 2.2), grey, "DiamondPlate", tilt * CF(0, -0.7, 0)),
		P("Block", V(3.4, 1.5, 0.12), grey, "Metal", tilt * CF(0, 0.05, 1.05), { tr = 0.45 }),
		P("Block", V(3.4, 1.5, 0.12), grey, "Metal", tilt * CF(0, 0.05, -1.05), { tr = 0.45 }),
		P("Block", V(0.12, 1.5, 2.2), grey, "Metal", tilt * CF(1.7, 0.05, 0), { tr = 0.45 }),
		P("Block", V(0.12, 1.5, 2.2), grey, "Metal", tilt * CF(-1.7, 0.05, 0), { tr = 0.45 }),
		P("Cylinder", V(2.4, 0.22, 0.22), C(220, 40, 40), "SmoothPlastic", tilt * CF(2.0, 0.9, 0) * ALONG_Z),
	}
	for _, x in { -1.3, 1.3 } do
		for _, z in { -0.9, 0.9 } do
			table.insert(parts, P("Ball", V(0.5, 0.5, 0.5), C(30, 30, 30), "Rubber", tilt * CF(x, -1.05, z)))
		end
	end
	return parts, V(4.4, 3, 3.2)
end

B.wallet = function()
	local gold = C(255, 205, 60)
	local parts = {
		P("Block", V(1.7, 0.4, 1.2), C(90, 55, 30), "Leather"),
		P("Block", V(1.5, 0.06, 0.9), C(110, 190, 90), "SmoothPlastic", CF(0.15, 0.24, 0.05) * ANG(0, R(8), 0)),
		P("Block", V(1.5, 0.06, 0.9), C(95, 175, 80), "SmoothPlastic", CF(0.05, 0.29, -0.05) * ANG(0, R(-6), 0)),
	}
	for i = 0, 2 do
		table.insert(
			parts,
			P("Cylinder", V(0.14, 0.6, 0.6), gold, "Foil", CF(1.25, -0.1 + i * 0.15, 0.55) * UP, { refl = 0.3 })
		)
	end
	return parts, V(2.8, 1.6, 2.4)
end

----------------------------------------------------------------------
-- Зона 3: Туманное болото
----------------------------------------------------------------------
B.tire = function()
	return {
		P("Cylinder", V(1.1, 3.2, 3.2), C(28, 28, 28), "Rubber", UP),
		P("Cylinder", V(1.15, 1.55, 1.55), C(60, 55, 45), "SmoothPlastic", UP),
		P("Cylinder", V(0.3, 3.28, 3.28), C(45, 45, 45), "Rubber", UP),
	}, V(3.8, 1.8, 3.8)
end

B.bucket = function()
	local tip = ANG(R(70), 0, 0)
	return {
		P("Cylinder", V(1.6, 1.6, 1.6), C(165, 90, 45), "CorrodedMetal", tip * UP),
		P("Cylinder", V(0.15, 1.72, 1.72), C(130, 70, 35), "CorrodedMetal", tip * CF(0, 0.8, 0) * UP),
		P("Cylinder", V(0.04, 1.45, 1.45), C(45, 35, 25), "SmoothPlastic", tip * CF(0, 0.82, 0) * UP),
		P("Block", V(0.08, 0.08, 1.7), C(120, 120, 125), "Metal", tip * CF(0, 1.25, 0)),
	}, V(2.8, 2.6, 2.8)
end

B.umbrella = function()
	return {
		P("Ball", V(3.2, 0.9, 3.2), C(60, 70, 165), "Fabric"),
		P("Ball", V(3.25, 0.85, 0.9), C(225, 60, 60), "Fabric"),
		P("Ball", V(0.9, 0.85, 3.25), C(225, 60, 60), "Fabric"),
		P("Cylinder", V(2.3, 0.14, 0.14), C(50, 50, 55), "Metal", CF(0.15, 1.15, 0) * ANG(0, 0, R(82))),
		P("Block", V(0.6, 0.18, 0.18), C(120, 70, 40), "Wood", CF(0.5, 2.3, 0)),
	}, V(3.8, 2.4, 3.8)
end

B.crate = function()
	local dark = C(120, 85, 50)
	return {
		P("Block", V(2.4, 2.4, 2.4), C(165, 120, 70), "WoodPlanks"),
		P("Block", V(2.5, 0.3, 2.5), dark, "Wood", CF(0, 0.95, 0)),
		P("Block", V(2.5, 0.3, 2.5), dark, "Wood", CF(0, -0.95, 0)),
		P("Block", V(0.3, 2.5, 2.5), dark, "Wood"),
	}, V(3.2, 3.2, 3.2)
end

local function barrel(color: Color3, band: Color3, mat: string)
	return {
		P("Cylinder", V(3, 2.4, 2.4), color, mat),
		P("Cylinder", V(0.22, 2.5, 2.5), band, "Metal", CF(1.0, 0, 0)),
		P("Cylinder", V(0.22, 2.5, 2.5), band, "Metal", CF(-1.0, 0, 0)),
		P("Cylinder", V(0.05, 2.1, 2.1), band, "Metal", CF(1.51, 0, 0)),
	}
end

B.barrel = function()
	return barrel(C(45, 95, 155), C(70, 72, 78), "Metal"), V(3.8, 3, 3)
end

B.tv = function()
	local tilt = ANG(R(-15), R(20), 0)
	local metal = C(185, 185, 190)
	return {
		P("Block", V(2.6, 2.0, 1.8), C(95, 72, 55), "Wood", tilt),
		P("Block", V(1.9, 1.45, 0.1), C(35, 45, 50), "Glass", tilt * CF(-0.2, 0.05, -0.91)),
		P("Cylinder", V(0.1, 0.28, 0.28), metal, "Metal", tilt * CF(1.0, 0.4, -0.92) * ALONG_Z),
		P("Cylinder", V(0.1, 0.28, 0.28), metal, "Metal", tilt * CF(1.0, -0.1, -0.92) * ALONG_Z),
		P("Cylinder", V(1.8, 0.06, 0.06), metal, "Metal", tilt * CF(-0.45, 1.78, 0) * ANG(0, 0, R(120))),
		P("Cylinder", V(1.8, 0.06, 0.06), metal, "Metal", tilt * CF(0.45, 1.78, 0) * ANG(0, 0, R(60))),
	}, V(3.4, 3.2, 3)
end

B.chest = function()
	local wood = C(120, 75, 35)
	local gold = C(255, 200, 60)
	return {
		P("Block", V(3, 1.4, 2), wood, "WoodPlanks", CF(0, -0.2, 0)),
		P("Cylinder", V(3, 2, 2), wood, "WoodPlanks", CF(0, 0.5, 0)),
		P("Block", V(0.25, 1.45, 2.06), gold, "Foil", CF(1.0, -0.2, 0)),
		P("Block", V(0.25, 1.45, 2.06), gold, "Foil", CF(-1.0, -0.2, 0)),
		P("Cylinder", V(0.25, 2.06, 2.06), gold, "Foil", CF(1.0, 0.5, 0)),
		P("Cylinder", V(0.25, 2.06, 2.06), gold, "Foil", CF(-1.0, 0.5, 0)),
		P("Block", V(0.45, 0.55, 0.15), gold, "Foil", CF(0, 0.45, -1.05)),
		P("Ball", V(0.6, 0.6, 0.6), C(255, 225, 90), "Neon", CF(0.6, 1.35, 0.3)),
	}, V(3.8, 3.4, 3)
end

----------------------------------------------------------------------
-- Зона 4: Промзона
----------------------------------------------------------------------
B.pipe = function()
	return {
		P("Cylinder", V(4, 1.1, 1.1), C(120, 125, 130), "Metal"),
		P("Cylinder", V(0.06, 0.8, 0.8), C(25, 25, 25), "SmoothPlastic", CF(2.0, 0, 0)),
		P("Cylinder", V(0.06, 0.8, 0.8), C(25, 25, 25), "SmoothPlastic", CF(-2.0, 0, 0)),
		P("Cylinder", V(0.25, 1.5, 1.5), C(95, 100, 105), "Metal", CF(1.75, 0, 0)),
	}, V(4.8, 2, 2.2)
end

B.canister = function()
	local red = C(200, 30, 30)
	return {
		P("Block", V(2.2, 0.9, 1.8), red, "SmoothPlastic"),
		P("Block", V(0.9, 0.3, 0.3), red, "SmoothPlastic", CF(0.4, 0.6, 0)),
		P("Cylinder", V(0.6, 0.35, 0.35), C(230, 200, 40), "SmoothPlastic", CF(-1.1, 0.4, 0.65) * ANG(0, 0, R(35))),
	}, V(3, 1.8, 2.8)
end

B.battery = function()
	return {
		P("Block", V(2, 1.3, 1.2), C(28, 28, 32), "SmoothPlastic"),
		P("Block", V(2.02, 0.12, 1.22), C(230, 190, 30), "SmoothPlastic", CF(0, 0.4, 0)),
		P("Cylinder", V(0.3, 0.3, 0.3), C(220, 40, 40), "Metal", CF(0.6, 0.8, 0) * UP),
		P("Cylinder", V(0.3, 0.3, 0.3), C(40, 40, 40), "Metal", CF(-0.6, 0.8, 0) * UP),
		P("Block", V(1.1, 0.5, 0.04), C(240, 240, 240), "SmoothPlastic", CF(0, -0.1, -0.62)),
	}, V(2.8, 2.4, 2.2)
end

B.tractortire = function()
	local parts = {
		P("Cylinder", V(1.6, 4.6, 4.6), C(28, 28, 28), "Rubber", UP),
		P("Cylinder", V(1.62, 2.7, 2.7), C(235, 175, 30), "Metal", UP),
		P("Cylinder", V(1.65, 1.1, 1.1), C(60, 60, 60), "Metal", UP),
	}
	for i = 0, 7 do
		local a = R(i * 45)
		table.insert(
			parts,
			P("Block", V(0.5, 1.5, 0.35), C(35, 35, 35), "Rubber", CF(math.cos(a) * 2.3, 0, math.sin(a) * 2.3) * ANG(0, R(90) - a, 0))
		)
	end
	return parts, V(5.2, 2.4, 5.2)
end

B.rustbarrel = function()
	return barrel(C(145, 72, 35), C(95, 50, 30), "CorrodedMetal"), V(3.8, 3, 3)
end

B.fridge = function()
	return {
		P("Block", V(2.4, 2.2, 4.4), C(235, 236, 238), "SmoothPlastic"),
		P("Block", V(2.44, 2.24, 0.08), C(170, 172, 176), "SmoothPlastic", CF(0, 0, 0.9)),
		P("Block", V(0.18, 0.25, 1.1), C(160, 162, 168), "Metal", CF(0.8, 1.2, -0.6)),
		P("Block", V(0.18, 0.25, 0.8), C(160, 162, 168), "Metal", CF(0.8, 1.2, 1.5)),
		P("Block", V(0.9, 0.04, 0.9), C(90, 150, 220), "SmoothPlastic", CF(-0.5, 1.11, -1.3)),
	}, V(3.2, 3, 5)
end

B.engine = function()
	local red = C(200, 40, 40)
	local dark = C(60, 60, 65)
	return {
		P("Block", V(2.4, 1.5, 2.0), C(95, 98, 104), "Metal", nil, { refl = 0.15 }),
		P("Block", V(2.4, 0.7, 0.75), red, "Metal", CF(0, 0.95, 0.65) * ANG(R(25), 0, 0)),
		P("Block", V(2.4, 0.7, 0.75), red, "Metal", CF(0, 0.95, -0.65) * ANG(R(-25), 0, 0)),
		P("Cylinder", V(0.4, 1.4, 1.4), C(210, 210, 215), "Metal", CF(0, 1.5, 0) * UP, { refl = 0.4 }),
		P("Cylinder", V(0.2, 1.0, 1.0), dark, "Metal", CF(1.3, 0, 0)),
		P("Cylinder", V(0.2, 0.6, 0.6), dark, "Metal", CF(1.3, -0.4, 0.5)),
	}, V(3.2, 3.4, 3.2)
end

----------------------------------------------------------------------
-- Зона 5: Ядовитый канал
----------------------------------------------------------------------
B.toxbarrel = function()
	local parts = barrel(C(235, 200, 30), C(30, 30, 30), "Metal")
	table.insert(parts, P("Ball", V(1.8, 0.25, 1.6), C(120, 255, 60), "Neon", CF(1.3, -0.9, 0.6)))
	table.insert(parts, P("Cylinder", V(0.06, 1.0, 1.0), C(30, 30, 30), "SmoothPlastic", CF(0, 0, 1.2) * ALONG_Z))
	return parts, V(3.8, 3, 3)
end

B.slime = function()
	local green = C(120, 255, 80)
	return {
		P("Ball", V(2.4, 0.9, 2.2), green, "Neon", nil, { tr = 0.25 }),
		P("Ball", V(1.4, 0.8, 1.3), green, "Neon", CF(0.6, 0.25, 0.3), { tr = 0.25 }),
		P("Ball", V(0.5, 0.5, 0.5), C(210, 255, 190), "Neon", CF(-0.5, 0.45, -0.3)),
	}, V(3, 1.8, 3)
end

B.flask = function()
	local glass = C(200, 230, 255)
	return {
		P("Ball", V(1.6, 1.6, 1.6), glass, "Glass", nil, { tr = 0.55 }),
		P("Ball", V(1.2, 1.2, 1.2), C(190, 80, 255), "Neon", nil, { tr = 0.1 }),
		P("Cylinder", V(1.0, 0.5, 0.5), glass, "Glass", CF(1.1, 0, 0), { tr = 0.55 }),
		P("Cylinder", V(0.3, 0.55, 0.55), C(150, 110, 70), "Wood", CF(1.65, 0, 0)),
	}, V(3, 2.2, 2.2)
end

B.gasmask = function()
	local face = ANG(R(-90), 0, 0)
	local glass = C(150, 205, 225)
	return {
		P("Ball", V(1.6, 1.8, 1.2), C(60, 72, 60), "Rubber", face),
		P("Cylinder", V(0.15, 0.6, 0.6), glass, "Glass", face * CF(-0.4, 0.3, -0.55) * ALONG_Z),
		P("Cylinder", V(0.15, 0.6, 0.6), glass, "Glass", face * CF(0.4, 0.3, -0.55) * ALONG_Z),
		P("Cylinder", V(0.8, 0.8, 0.8), C(95, 95, 98), "Metal", face * CF(0, -0.5, -0.75) * ALONG_Z),
		P("Block", V(2.2, 0.12, 0.12), C(40, 40, 40), "Rubber", face * CF(0, 0.3, 0.3)),
	}, V(2.6, 2.4, 2.6)
end

B.mutanttire = function()
	local parts = {
		P("Cylinder", V(1.2, 3.6, 3.6), C(30, 40, 30), "Rubber", UP),
		P("Cylinder", V(1.25, 1.8, 1.8), C(110, 255, 60), "Neon", UP),
	}
	for i = 1, 6 do
		local a = R(i * 60)
		table.insert(
			parts,
			P("Ball", V(0.45, 0.45, 0.45), C(160, 255, 110), "Neon", CF(math.cos(a) * 1.4, 0.65, math.sin(a) * 1.4))
		)
	end
	return parts, V(4.2, 2, 4.2)
end

B.radcontainer = function()
	local yellow = C(255, 210, 0)
	return {
		P("Block", V(2.6, 2.6, 2.6), C(80, 86, 92), "DiamondPlate"),
		P("Block", V(2.66, 0.35, 2.66), yellow, "Neon", CF(0, 0.7, 0)),
		P("Block", V(2.66, 0.35, 2.66), yellow, "Neon", CF(0, -0.7, 0)),
		P("Cylinder", V(0.05, 1.1, 1.1), C(25, 25, 25), "SmoothPlastic", CF(0, 0, -1.32) * ALONG_Z),
		P("Cylinder", V(0.06, 0.35, 0.35), yellow, "Neon", CF(0, 0, -1.34) * ALONG_Z),
	}, V(3.4, 3.4, 3.4)
end

B.nukebattery = function()
	local metal = C(200, 205, 212)
	return {
		P("Cylinder", V(2.6, 1.4, 1.4), C(90, 255, 90), "Neon", nil, { tr = 0.05 }),
		P("Cylinder", V(2.3, 1.62, 1.62), C(200, 255, 200), "Glass", nil, { tr = 0.65 }),
		P("Cylinder", V(0.45, 1.7, 1.7), metal, "Metal", CF(1.45, 0, 0), { refl = 0.3 }),
		P("Cylinder", V(0.45, 1.7, 1.7), metal, "Metal", CF(-1.45, 0, 0), { refl = 0.3 }),
		P("Cylinder", V(0.3, 0.6, 0.6), C(220, 222, 228), "Metal", CF(1.8, 0, 0)),
	}, V(4.4, 2.4, 2.4)
end

----------------------------------------------------------------------
-- Зона 6: Морское устье
----------------------------------------------------------------------
B.net = function()
	local rope = C(210, 200, 160)
	local parts = {
		P("Block", V(3.4, 0.1, 3.0), C(70, 135, 110), "Fabric", nil, { tr = 0.35 }),
		P("Cylinder", V(3.4, 0.1, 0.1), rope, "Fabric", CF(0, 0.05, 1.5)),
		P("Cylinder", V(3.4, 0.1, 0.1), rope, "Fabric", CF(0, 0.05, -1.5)),
	}
	for _, x in { -1.7, 0, 1.7 } do
		table.insert(parts, P("Ball", V(0.55, 0.55, 0.55), C(255, 140, 30), "SmoothPlastic", CF(x, 0.15, 1.5)))
	end
	return parts, V(4, 1.6, 3.6)
end

B.buoy = function()
	local tilt = ANG(R(18), 0, R(12))
	return {
		P("Ball", V(2.2, 2.2, 2.2), C(230, 50, 40), "SmoothPlastic", tilt),
		P("Cylinder", V(0.5, 2.26, 2.26), C(245, 245, 245), "SmoothPlastic", tilt * UP),
		P("Cylinder", V(1.2, 0.25, 0.25), C(80, 80, 85), "Metal", tilt * CF(0, 1.5, 0) * UP),
		P("Ball", V(0.4, 0.4, 0.4), C(255, 230, 80), "Neon", tilt * CF(0, 2.15, 0)),
	}, V(3, 3.4, 3)
end

B.anchor = function()
	local iron = C(62, 64, 70)
	return {
		P("Block", V(0.4, 0.4, 3.2), iron, "Metal"),
		P("Block", V(2.6, 0.4, 0.4), iron, "Metal", CF(0, 0, 1.45)),
		P("Block", V(0.4, 0.4, 1.0), iron, "Metal", CF(1.15, 0, 1.0) * ANG(0, R(-40), 0)),
		P("Block", V(0.4, 0.4, 1.0), iron, "Metal", CF(-1.15, 0, 1.0) * ANG(0, R(40), 0)),
		P("Block", V(2.0, 0.25, 0.25), iron, "Metal", CF(0, 0, -1.3)),
		P("Cylinder", V(0.2, 0.9, 0.9), C(80, 82, 88), "Metal", CF(0, 0, -1.85)),
	}, V(3.2, 1.8, 4.4)
end

B.wreck = function()
	local beam = C(85, 60, 40)
	return {
		P("Block", V(3.8, 0.35, 0.9), C(115, 82, 52), "WoodPlanks", CF(0, 0, -0.6) * ANG(0, R(6), 0)),
		P("Block", V(3.4, 0.35, 0.9), C(100, 72, 46), "WoodPlanks", CF(0.2, 0.05, 0.35) * ANG(0, R(-4), R(3))),
		P("Block", V(0.5, 0.4, 2.4), beam, "Wood", CF(-1.2, 0.3, -0.1)),
		P("Block", V(0.5, 0.4, 2.4), beam, "Wood", CF(1.1, 0.3, 0)),
		P("Cylinder", V(1.8, 0.45, 0.45), C(95, 70, 45), "Wood", CF(0.2, 0.55, 0.9) * ANG(0, R(30), R(15))),
	}, V(4.6, 2, 3.6)
end

B.mine = function()
	local parts = { P("Ball", V(2.4, 2.4, 2.4), C(48, 52, 58), "Metal", nil, { refl = 0.1 }) }
	local dirs = {
		V(1, 0, 0),
		V(-1, 0, 0),
		V(0, 1, 0),
		V(0, 0, 1),
		V(0, 0, -1),
		V(0.7, 0.7, 0),
		V(-0.7, 0.7, 0),
		V(0, 0.7, 0.7),
		V(0, 0.7, -0.7),
	}
	for _, d in dirs do
		local dir = d.Unit
		local pos = dir * 1.35
		table.insert(parts, P("Cylinder", V(0.6, 0.25, 0.25), C(90, 90, 95), "Metal", alongAxis(pos, dir)))
	end
	return parts, V(3.6, 3.6, 3.6)
end

B.safe = function()
	local steel = C(205, 205, 210)
	return {
		P("Block", V(2.4, 2.4, 2.4), C(60, 64, 72), "Metal"),
		P("Block", V(2.0, 2.0, 0.1), C(78, 84, 94), "Metal", CF(0, 0, -1.22)),
		P("Cylinder", V(0.2, 0.8, 0.8), steel, "Metal", CF(-0.3, 0.2, -1.3) * ALONG_Z, { refl = 0.3 }),
		P("Block", V(0.15, 0.8, 0.15), steel, "Metal", CF(0.65, 0, -1.33)),
		P("Cylinder", V(1.8, 0.12, 0.12), C(60, 140, 60), "Grass", CF(0.9, 0.9, 1.0) * ANG(0, 0, R(70))),
		P("Cylinder", V(1.4, 0.12, 0.12), C(70, 150, 70), "Grass", CF(-0.8, 0.8, 1.1) * ANG(0, 0, R(110))),
	}, V(3.2, 3.2, 3.2)
end

B.crown = function()
	local gold = C(255, 200, 50)
	local parts = {
		P("Cylinder", V(0.9, 2.4, 2.4), gold, "Foil", UP, { refl = 0.25 }),
		P("Cylinder", V(0.06, 2.1, 2.1), C(150, 20, 45), "Fabric", CF(0, 0.47, 0) * UP),
	}
	local gems = { C(80, 170, 255), C(255, 70, 90), C(90, 255, 140) }
	for i = 0, 5 do
		local a = R(i * 60)
		local x, z = math.cos(a) * 1.1, math.sin(a) * 1.1
		table.insert(
			parts,
			P("Block", V(0.35, 0.9, 0.18), gold, "Foil", CF(x, 0.8, z) * ANG(0, R(90) - a, 0), { refl = 0.25 })
		)
		table.insert(
			parts,
			P("Ball", V(0.32, 0.32, 0.32), gems[i % 3 + 1], "Neon", CF(math.cos(a) * 1.22, 0, math.sin(a) * 1.22))
		)
	end
	return parts, V(3.2, 2.8, 3.2)
end

----------------------------------------------------------------------
-- Сборка
----------------------------------------------------------------------
local function makePart(spec: Spec, index: number): Part
	local part = Instance.new("Part")
	part.Name = "P" .. index
	Util.applyShape(part, spec.shape, spec.size)
	part.Color = spec.color
	part.Material = Util.material(spec.mat)
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Anchored = true
	part.CanCollide = false
	part.CanTouch = false
	part.CanQuery = false
	part.CastShadow = false
	part.CFrame = spec.cf or CFrame.identity
	if spec.extra then
		part.Transparency = spec.extra.tr or 0
		part.Reflectance = spec.extra.refl or 0
	end
	return part
end

function TrashModels.has(key: string): boolean
	return B[key] ~= nil
end

function TrashModels.keys(): { string }
	local list = {}
	for key in B do
		table.insert(list, key)
	end
	table.sort(list)
	return list
end

-- Собирает модель предмета в точке (0, 0, 0)
function TrashModels.build(key: string): Model
	local builder = B[key] or B.paper
	local specs, hitboxSize = builder()

	local model = Instance.new("Model")
	model.Name = key

	local hitbox = Instance.new("Part")
	hitbox.Name = "Hitbox"
	hitbox.Size = hitboxSize
	hitbox.Transparency = 1
	hitbox.Anchored = true
	hitbox.CanCollide = false
	hitbox.CanTouch = false
	hitbox.CanQuery = true
	hitbox.CastShadow = false
	hitbox.CFrame = CFrame.identity
	hitbox.Parent = model

	for index, spec in specs do
		makePart(spec, index).Parent = model
	end

	model.PrimaryPart = hitbox
	return model
end

-- Подпись, свечение и искры для редкого мусора (вызывает сервер)
function TrashModels.decorate(model: Model, key: string)
	local def = Config.Trash[key]
	if not def then
		return
	end
	local rarity = Config.Rarities[def.Rarity]
	local hitbox = model.PrimaryPart
	if not hitbox then
		return
	end

	if rarity.Order >= 3 then
		local gui = Instance.new("BillboardGui")
		gui.Name = "Tag"
		gui.Size = UDim2.fromOffset(190, 30)
		gui.StudsOffset = Vector3.new(0, 2.8, 0)
		gui.MaxDistance = 110
		gui.AlwaysOnTop = false
		gui.LightInfluence = 0
		gui.ResetOnSpawn = false
		gui.Adornee = hitbox

		local label = Instance.new("TextLabel")
		label.Size = UDim2.fromScale(1, 1)
		label.BackgroundTransparency = 1
		label.Font = Enum.Font.GothamBlack
		label.TextScaled = true
		label.TextColor3 = rarity.Color
		label.Text = if rarity.Order >= 5 then "★ " .. def.Name .. " ★" else def.Name
		label.Parent = gui

		local stroke = Instance.new("UIStroke")
		stroke.Thickness = 2
		stroke.Color = Color3.fromRGB(15, 20, 30)
		stroke.Parent = label

		gui.Parent = hitbox
	end

	if rarity.Order >= 4 then
		local light = Instance.new("PointLight")
		light.Color = rarity.Color
		light.Range = if rarity.Order >= 5 then 14 else 9
		light.Brightness = if rarity.Order >= 5 then 2.2 else 1.4
		light.Shadows = false
		light.Parent = hitbox

		local sparkles = Instance.new("ParticleEmitter")
		sparkles.Name = "Sparkles"
		sparkles.Texture = "rbxasset://textures/particles/sparkles_main.dds"
		sparkles.Rate = if rarity.Order >= 5 then 14 else 6
		sparkles.Lifetime = NumberRange.new(0.6, 1.2)
		sparkles.Speed = NumberRange.new(1, 2.5)
		sparkles.SpreadAngle = Vector2.new(180, 180)
		sparkles.LightEmission = 1
		sparkles.Color = ColorSequence.new(rarity.Color)
		sparkles.Size = NumberSequence.new({
			NumberSequenceKeypoint.new(0, 0.45),
			NumberSequenceKeypoint.new(1, 0),
		})
		sparkles.Parent = hitbox
	end
end

return TrashModels
