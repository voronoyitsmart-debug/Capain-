--[[
	RiverMath — геометрия мира и движение мусора по реке.

	Мусор двигается по формуле от времени (workspace:GetServerTimeNow()),
	поэтому сервер и все клиенты видят его в одном и том же месте,
	а сервер не тратит трафик на рассылку позиций каждый кадр.
]]

local Config = require(script.Parent.Config)

local W = Config.World
local RiverMath = {}

function RiverMath.zoneCount(): number
	return #Config.Zones
end

function RiverMath.zoneOriginZ(zoneId: number): number
	return (zoneId - 1) * W.ZoneSpacing
end

function RiverMath.riverZ(zoneId: number): number
	return RiverMath.zoneOriginZ(zoneId) + W.RiverOffsetZ
end

-- В какой зоне находится точка (по координате Z)
function RiverMath.zoneFromZ(z: number): number
	local index = math.floor((z + W.HalfDepth) / W.ZoneSpacing) + 1
	return math.clamp(index, 1, #Config.Zones)
end

-- Точка появления на базе зоны
function RiverMath.hubPosition(zoneId: number): Vector3
	return Vector3.new(0, 0, RiverMath.zoneOriginZ(zoneId) + W.HubZ - 10)
end

-- Центр площадки переработки
function RiverMath.sellPadPosition(zoneId: number): Vector3
	return Vector3.new(-26, 0, RiverMath.zoneOriginZ(zoneId) + W.HubZ)
end

-- Стоит ли точка над рекой (для «Водомерки»)
function RiverMath.isOverRiver(pos: Vector3, margin: number?): (boolean, number)
	local zoneId = RiverMath.zoneFromZ(pos.Z)
	local half = W.RiverWidth / 2 + (margin or 0)
	local over = math.abs(pos.Z - RiverMath.riverZ(zoneId)) <= half and math.abs(pos.X) <= W.HalfWidth
	return over, zoneId
end

----------------------------------------------------------------------
-- Движение мусора
----------------------------------------------------------------------
local function motion(origin: Vector3, vel: Vector3, t0: number, seed: number, t: number)
	local dt = math.max(0, t - t0)
	local x = origin.X + vel.X * dt
	local z = origin.Z + vel.Z * dt
	local moving = vel.X ~= 0 or vel.Z ~= 0
	if moving then
		-- плавное покачивание поперёк течения
		z += math.sin(t * 0.55 + seed) * 1.1
	end
	local bob = math.sin(t * 2.1 + seed * 1.7) * (if moving then 0.2 else 0.12)
	local y = W.WaterY + 0.1 + bob
	return x, y, z, dt, moving
end

function RiverMath.trashPosition(origin: Vector3, vel: Vector3, t0: number, seed: number, t: number): Vector3
	local x, y, z = motion(origin, vel, t0, seed, t)
	return Vector3.new(x, y, z)
end

function RiverMath.trashCFrame(origin: Vector3, vel: Vector3, t0: number, seed: number, t: number): CFrame
	local x, y, z, dt, moving = motion(origin, vel, t0, seed, t)
	local spin = if moving then 0.18 + (seed % 1) * 0.25 else 0.03
	local yaw = seed * 2.3 + dt * spin
	local pitch = math.cos(t * 1.1 + seed) * 0.12
	local roll = math.sin(t * 1.35 + seed * 0.7) * 0.14
	return CFrame.new(x, y, z) * CFrame.Angles(pitch, yaw, roll)
end

-- Сколько секунд мусор плывёт от начала до конца реки
function RiverMath.flowLifetime(speed: number): number
	return (W.RiverEndX - W.RiverStartX) / math.max(0.1, speed)
end

return RiverMath
