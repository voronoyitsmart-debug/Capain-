--[[
	RebirthService — перерождение. Сбрасывает монеты, сачок, рюкзак, обувь и зоны,
	но навсегда даёт +50% монет и +5% удачи. Перки, помощники, фабрика,
	коллекция и статистика остаются.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local RebirthService = {}

local Services

function RebirthService:Init(services)
	Services = services
end

function RebirthService:Start()
	local Net = Services.NetService

	Net.on("Rebirth", function(player, data)
		local cost = Formulas.rebirthCost(data.Rebirths)
		if data.Coins < cost then
			return false, "Для перерождения нужно " .. Format.number(cost) .. " 💰"
		end

		Formulas.settleFactory(data, os.time())
		data.Coins = 0
		data.Net = 1
		data.Backpack = 1
		data.Boots = 1
		data.MaxZone = 1
		data.LastZone = 1
		data.Inventory = {}
		data.InvSize = 0
		data.InvValue = 0
		data.Rebirths += 1

		Services.QuestService.reset(data)
		Services.ZoneService.teleport(player, 1)
		Services.PlayerService.applyStats(player)

		local mult = Formulas.rebirthMultiplier(data.Rebirths)
		Net.notifyAll(string.format("🌀 %s совершает перерождение №%d!", player.DisplayName, data.Rebirths), "legendary")
		return true, "🌀 Перерождение №" .. data.Rebirths .. "! Теперь монеты " .. Format.multiplier(mult)
	end)
end

return RebirthService
