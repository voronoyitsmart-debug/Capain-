--[[
	ZoneController — всё, что связано с зонами на клиенте:
	• открывает ворота купленных зон (только для тебя);
	• меняет цвет воды: чем больше мусора, тем грязнее река;
	• туман по теме зоны;
	• «Водомерка» — ходьба по воде;
	• сигнал о смене зоны (для баннера).
]]

local Lighting = game:GetService("Lighting")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local RiverMath = require(Shared.RiverMath)
local Signal = require(Shared.Signal)

local Client = script.Parent.Parent
local State = require(Client.State)

local ZoneController = {}
ZoneController.ZoneChanged = Signal.new() -- (zoneId)

local player = Players.LocalPlayer
local currentZone = 0
local platform: Part
local lastWater: Color3? = nil

function ZoneController.current(): number
	return math.max(1, currentZone)
end

local function rootPart(): BasePart?
	local character = player.Character
	return character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
end

local function updateGates()
	local data = State.Data
	local map = workspace:FindFirstChild("Map")
	local gates = map and map:FindFirstChild("Gates")
	if not data or not gates then
		return
	end
	for _, gate in gates:GetChildren() do
		local zoneId = gate:GetAttribute("Zone")
		local zone = type(zoneId) == "number" and Config.Zones[zoneId]
		if zone then
			local open = zoneId <= data.MaxZone
			local blocker = gate:FindFirstChild("Gate") :: BasePart?
			local field = gate:FindFirstChild("GateField") :: BasePart?
			local sign = gate:FindFirstChild("GateSign")
			if blocker then
				blocker.CanCollide = not open
			end
			if field then
				field.Transparency = if open then 1 else 0
				local prompt = field:FindFirstChildOfClass("ProximityPrompt")
				if prompt then
					prompt.Enabled = not open
				end
			end
			if sign then
				for _, gui in sign:GetChildren() do
					local label = gui:FindFirstChild("Label") :: TextLabel?
					if label then
						if open then
							label.Text = string.format("✅ Зона %d: %s", zoneId, zone.Name)
						elseif zoneId == data.MaxZone + 1 then
							label.Text = string.format("🔒 Зона %d: %s\n💰 %s монет", zoneId, zone.Name, Format.number(zone.Cost))
						else
							label.Text = string.format("🔒 Зона %d: %s\nсначала открой зону %d", zoneId, zone.Name, zoneId - 1)
						end
					end
				end
			end
		end
	end
end

local function updateEnvironment(zoneId: number)
	local zone = Config.Zones[zoneId]
	local pollution = ReplicatedStorage:GetAttribute("Pollution" .. zoneId) or 0.5
	local color = zone.Theme.WaterClean:Lerp(zone.Theme.WaterDirty, math.clamp(pollution, 0, 1))
	local terrain = workspace.Terrain
	local previous = lastWater
	local changed = previous == nil
		or math.abs(previous.R - color.R) + math.abs(previous.G - color.G) + math.abs(previous.B - color.B) > 0.01
	if changed then
		lastWater = color
		TweenService:Create(terrain, TweenInfo.new(1.5), { WaterColor = color }):Play()
	end
	local atmosphere = Lighting:FindFirstChildOfClass("Atmosphere")
	if atmosphere then
		TweenService:Create(atmosphere, TweenInfo.new(2), { Density = zone.Theme.Fog }):Play()
	end
end

function ZoneController.start()
	platform = Instance.new("Part")
	platform.Name = "WaterWalk"
	platform.Size = Vector3.new(9, 1, 9)
	platform.Transparency = 1
	platform.Anchored = true
	platform.CanCollide = true
	platform.CanQuery = false
	platform.CanTouch = false
	platform.CastShadow = false

	State.Changed:Connect(updateGates)
	task.spawn(function()
		local map = workspace:WaitForChild("Map")
		map:WaitForChild("Gates")
		State.waitReady()
		updateGates()
	end)

	-- текущая зона и окружение
	task.spawn(function()
		local tick = 0
		while true do
			task.wait(0.25)
			tick += 1
			local root = rootPart()
			if root then
				local zone = RiverMath.zoneFromZ(root.Position.Z)
				if zone ~= currentZone then
					currentZone = zone
					ZoneController.ZoneChanged:Fire(zone)
					updateEnvironment(zone)
				elseif tick % 8 == 0 then
					updateEnvironment(zone)
				end
			end
		end
	end)

	-- ходьба по воде
	RunService.Heartbeat:Connect(function()
		local data = State.Data
		local root = rootPart()
		local enabled = data and (data.Perks.WaterWalk or 0) > 0 and data.Settings.WaterWalk
		if not enabled or not root then
			platform.Parent = nil
			return
		end
		local over = RiverMath.isOverRiver(root.Position, 2)
		local waterY = Config.World.WaterY
		if over and root.Position.Y > waterY + 1.3 then
			platform.CFrame = CFrame.new(root.Position.X, waterY - 0.15, root.Position.Z)
			platform.Parent = workspace
		else
			platform.Parent = nil
		end
	end)
end

return ZoneController
