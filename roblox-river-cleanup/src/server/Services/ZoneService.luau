--[[
	ZoneService — зоны: покупка, телепорт, кто в какой зоне,
	и защита от прохода в закрытую зону (ворота открываются только на клиенте
	у того, кто зону купил, а сервер дополнительно проверяет позицию).
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local RiverMath = require(Shared.RiverMath)

local ZoneService = {}

local Services
local playerZone: { [Player]: number } = {}
local lastWarn: { [Player]: number } = {}
local lastTeleport: { [Player]: number } = {}

local function rootOf(player: Player): BasePart?
	local character = player.Character
	return character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
end

function ZoneService.zoneOf(player: Player): number
	return playerZone[player] or 1
end

function ZoneService.playersIn(zoneId: number): { Player }
	local list = {}
	for player, zone in playerZone do
		if zone == zoneId and player.Parent then
			table.insert(list, player)
		end
	end
	return list
end

function ZoneService.teleport(player: Player, zoneId: number): boolean
	local character = player.Character
	local root = rootOf(player)
	if not character or not root then
		return false
	end
	local pos = RiverMath.hubPosition(zoneId) + Vector3.new(math.random(-3, 3), 4, math.random(-2, 2))
	character:PivotTo(CFrame.lookAt(pos, pos + Vector3.new(0, 0, 10)))
	playerZone[player] = zoneId
	player:SetAttribute("Zone", zoneId)
	local data = Services.DataService.get(player)
	if data then
		data.LastZone = zoneId
	end
	return true
end

function ZoneService:Init(services)
	Services = services
end

function ZoneService:Start()
	local Net = Services.NetService

	Net.on("BuyZone", function(player, data, zoneId)
		if type(zoneId) ~= "number" then
			return false
		end
		zoneId = math.floor(zoneId)
		local zone = Config.Zones[zoneId]
		if not zone then
			return false, "Такой зоны нет"
		end
		if zoneId <= data.MaxZone then
			return false, "Эта зона уже открыта"
		end
		if zoneId ~= data.MaxZone + 1 then
			return false, "Сначала открой предыдущую зону"
		end
		if data.Coins < zone.Cost then
			return false, "Не хватает монет: нужно ещё " .. Format.number(zone.Cost - data.Coins) .. " 💰"
		end
		data.Coins -= zone.Cost
		data.MaxZone = zoneId
		data.Tutorial.Bought = true
		Net.notifyAll(string.format("🎉 %s открывает зону «%s»!", player.DisplayName, zone.Name), "info")
		return true, "Зона «" .. zone.Name .. "» открыта! Проходи через ворота или жми 🗺️ Телепорт"
	end)

	Net.on("Teleport", function(player, data, zoneId)
		if type(zoneId) ~= "number" then
			return false
		end
		zoneId = math.floor(zoneId)
		if not Config.Zones[zoneId] then
			return false
		end
		if zoneId > data.MaxZone then
			return false, "Эта зона ещё закрыта 🔒"
		end
		local now = os.clock()
		if now - (lastTeleport[player] or 0) < 2 then
			return false, "Телепорт перезаряжается…"
		end
		lastTeleport[player] = now
		if not ZoneService.teleport(player, zoneId) then
			return false, "Персонаж ещё не появился"
		end
		return true, "🗺️ " .. Config.Zones[zoneId].Name
	end)

	Players.PlayerRemoving:Connect(function(player)
		playerZone[player] = nil
		lastWarn[player] = nil
		lastTeleport[player] = nil
	end)

	-- следим, кто где находится
	while true do
		task.wait(0.4)
		for _, player in Players:GetPlayers() do
			local data = Services.DataService.get(player)
			local root = rootOf(player)
			if data and root then
				local pos = root.Position
				local zone = RiverMath.zoneFromZ(pos.Z)
				if pos.Y < -70 then
					-- упал под карту
					ZoneService.teleport(player, math.min(data.LastZone, data.MaxZone))
				elseif zone > data.MaxZone then
					ZoneService.teleport(player, data.MaxZone)
					local now = os.clock()
					if now - (lastWarn[player] or 0) > 3 then
						lastWarn[player] = now
						Net.notify(player, "🔒 Эта зона ещё закрыта! Открой её в магазине (вкладка «Зоны»)", "error")
					end
				elseif zone ~= playerZone[player] then
					playerZone[player] = zone
					player:SetAttribute("Zone", zone)
					data.LastZone = zone
				end
			end
		end
	end
end

return ZoneService
