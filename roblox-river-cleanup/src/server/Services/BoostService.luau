--[[
	BoostService — бесплатные бусты. Включил — работает N минут,
	потом перезарядка. Купить нельзя — только подождать ⏳
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local BoostService = {}

local Services
local announced: { [Player]: { [string]: string } } = {}

-- Включить буст бесплатно, не трогая перезарядку (подарки, ежедневка)
function BoostService.grant(data, key: string)
	local def = Config.BoostByKey[key]
	if not def then
		return
	end
	local now = os.time()
	if key == "FactoryTurbo" then
		Formulas.settleFactory(data, now)
	end
	local record = data.Boosts[key] or {}
	if (record.EndsAt or 0) > now then
		record.EndsAt += def.Duration
	else
		record.StartAt = now
		record.EndsAt = now + def.Duration
	end
	record.ReadyAt = math.max(record.ReadyAt or 0, 0)
	data.Boosts[key] = record
end

function BoostService.resetCooldowns(data)
	for _, record in data.Boosts do
		record.ReadyAt = 0
	end
end

function BoostService:Init(services)
	Services = services
end

function BoostService:Start()
	local Net = Services.NetService

	Net.on("ActivateBoost", function(player, data, key)
		local def = type(key) == "string" and Config.BoostByKey[key]
		if not def then
			return false
		end
		local now = os.time()
		local state, left = Formulas.boostState(data, key, now)
		if state == "active" then
			return false, "Уже работает! Осталось " .. Format.time(left)
		elseif state == "cooldown" then
			return false, "Перезарядка: " .. Format.duration(left) .. " ⏳ Просто подожди!"
		end
		if key == "FactoryTurbo" then
			Formulas.settleFactory(data, now)
		end
		data.Boosts[key] = { StartAt = now, EndsAt = now + def.Duration, ReadyAt = now + def.Cooldown }
		Services.PlayerService.applyStats(player)
		return true, string.format("%s %s включён на %s!", def.Icon, def.Name, Format.duration(def.Duration))
	end)

	Players.PlayerRemoving:Connect(function(player)
		announced[player] = nil
	end)

	-- сообщаем, когда буст закончился и когда он снова готов
	while true do
		task.wait(1)
		local now = os.time()
		for _, player in Players:GetPlayers() do
			local data = Services.DataService.get(player)
			if data then
				local mine = announced[player]
				if not mine then
					mine = {}
					announced[player] = mine
					for key in data.Boosts do
						mine[key] = (Formulas.boostState(data, key, now))
					end
				end
				for _, def in Config.Boosts do
					local state = Formulas.boostState(data, def.Key, now)
					local previous = mine[def.Key]
					if previous and previous ~= state then
						if previous == "active" then
							Net.notify(player, def.Icon .. " «" .. def.Name .. "» закончился", "info")
							Net.markDirty(player)
							Services.PlayerService.applyStats(player)
						end
						if state == "ready" then
							Net.notify(player, "⚡ Бесплатный буст «" .. def.Name .. "» снова готов!", "success")
							Net.markDirty(player)
						end
					end
					mine[def.Key] = state
				end
			end
		end
	end
end

return BoostService
