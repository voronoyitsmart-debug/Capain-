--[[
	ShopService — магазин. Всё покупается ТОЛЬКО за внутриигровые монеты.
	Никаких робуксов, геймпассов и developer products в игре нет.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local ShopService = {}

local Services

local function notEnough(data, cost: number): string
	return "Не хватает " .. Format.number(cost - data.Coins) .. " 💰 — лови ещё мусор!"
end

-- Покупка следующего уровня (сачок, рюкзак, обувь)
local function tierHandler(list, field: string, after: ((Player, any) -> ())?)
	return function(player: Player, data, tier: any)
		if type(tier) ~= "number" then
			return false
		end
		tier = math.floor(tier)
		local item = list[tier]
		if not item then
			return false
		end
		local current = data[field]
		if tier <= current then
			return false, "Уже куплено"
		end
		if tier ~= current + 1 then
			return false, "Сначала купи предыдущий уровень"
		end
		if data.Coins < item.Cost then
			return false, notEnough(data, item.Cost)
		end
		data.Coins -= item.Cost
		data[field] = tier
		data.Tutorial.Bought = true
		if after then
			after(player, data)
		end
		return true, item.Icon .. " Куплено: " .. item.Name
	end
end

function ShopService:Init(services)
	Services = services
end

function ShopService:Start()
	local Net = Services.NetService

	Net.on("BuyNet", tierHandler(Config.Nets, "Net"))
	Net.on("BuyBackpack", tierHandler(Config.Backpacks, "Backpack"))
	Net.on(
		"BuyBoots",
		tierHandler(Config.Boots, "Boots", function(player)
			Services.PlayerService.applyStats(player)
		end)
	)

	Net.on("BuyPerk", function(player, data, key)
		local def = type(key) == "string" and Config.Perks[key]
		if not def then
			return false
		end
		local level = data.Perks[key] or 0
		if level >= def.MaxLevel then
			return false, "Уже максимальный уровень 🏆"
		end
		local cost = Formulas.perkCost(key, level + 1) :: number
		if data.Coins < cost then
			return false, notEnough(data, cost)
		end
		if key == "Storage" then
			Formulas.settleFactory(data, os.time())
		end
		data.Coins -= cost
		data.Perks[key] = level + 1
		data.Tutorial.Bought = true
		if key == "HelperSlots" then
			Services.HelperService.refresh(player, data)
		end
		local suffix = if def.MaxLevel > 1 then " (ур. " .. (level + 1) .. ")" else ""
		return true, def.Icon .. " " .. def.Name .. suffix .. " — куплено!"
	end)

	Net.on("SetSetting", function(_player, data, name, value)
		if type(name) ~= "string" or Config.SettingKeys[name] == nil or type(value) ~= "boolean" then
			return false
		end
		data.Settings[name] = value
		return true
	end)
end

return ShopService
