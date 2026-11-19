--[[
	Симуляция экономики: сколько времени уходит на каждую зону и перерождение.
	Модель игрока: ловит долю мусора, который появляется в его зоне,
	продаёт (с потерей времени на ходьбу), жадно покупает улучшения,
	строит фабрику и включает бесплатные бусты по готовности.

	Запуск:  lune run tests/economy.luau
]]

local H = require("./harness")
local Config = H.shared("Config")
local Formulas = H.shared("Formulas")
local Format = H.shared("Format")

local function newData()
	return {
		Coins = 0,
		Net = 1,
		Backpack = 1,
		Boots = 1,
		MaxZone = 1,
		Rebirths = 0,
		Perks = {},
		HelpersOwned = {},
		Equipped = {},
		Discovered = {},
		Boosts = {},
		Factory = { Level = 0, Stored = 0, LastCalc = 0, BuildingTo = 0, BuildEndsAt = 0 },
	}
end

-- средняя цена предмета в зоне при удаче luck
local function avgValue(zoneId: number, luck: number, shiny: number): number
	local list, total = Formulas.trashWeights(zoneId, luck)
	local sum = 0
	for _, entry in list do
		sum += entry.Weight / total * Config.Trash[entry.Key].Value
	end
	return sum * (1 + shiny * (Config.Shiny.ValueMult - 1))
end

local function simulate(label: string, catchShare: number, hours: number)
	local data = newData()
	local t = 0
	local dt = 5
	local log = {}
	local function mark(text)
		table.insert(log, string.format("%7s  %s", Format.time(t), text))
	end
	local rebirthAt = nil
	while t < hours * 3600 do
		t += dt
		local stats = Formulas.getStats(data, t, nil)
		local zone = Config.Zones[data.MaxZone]
		-- сколько мусора появляется и сколько ловим (помощники повышают долю)
		local spawnRate = 1 / zone.SpawnInterval
		local helperBonus = 0
		for _, key in data.Equipped do
			helperBonus += 0.6 / Config.HelperByKey[key].Interval
		end
		local caughtPerSec = math.min(spawnRate * 0.95, spawnRate * catchShare * (stats.Range / 30) + helperBonus * 0.25)
		local value = avgValue(data.MaxZone, stats.Luck ^ 0.5, stats.ShinyChance)
		local income = caughtPerSec * value * stats.CoinMult * 0.8 -- 20% времени на ходьбу к переработке
		data.Coins += income * dt
		for _, key in zone.Trash do
			if not data.Discovered[key] and math.random() < caughtPerSec * dt / 30 then
				data.Discovered[key] = true
			end
		end
		-- фабрика
		Formulas.settleFactory(data, t)
		if data.Factory.Stored > 0 then
			data.Coins += data.Factory.Stored
			data.Factory.Stored = 0
		end
		-- бусты по готовности
		for _, boost in Config.Boosts do
			if Formulas.boostState(data, boost.Key, t) == "ready" then
				data.Boosts[boost.Key] = { StartAt = t, EndsAt = t + boost.Duration, ReadyAt = t + boost.Cooldown }
			end
		end
		-- покупки: зона важнее всего, потом сачок, фабрика, помощники
		local bought = true
		while bought do
			bought = false
			local nextZone = Config.Zones[data.MaxZone + 1]
			local nextNet = Config.Nets[data.Net + 1]
			local f = data.Factory
			if nextZone and data.Coins >= nextZone.Cost then
				data.Coins -= nextZone.Cost
				data.MaxZone += 1
				mark("🗺️ Зона " .. data.MaxZone .. " «" .. nextZone.Name .. "»")
				bought = true
			elseif nextNet and data.Coins >= nextNet.Cost and (not nextZone or nextNet.Cost < nextZone.Cost * 0.35) then
				data.Coins -= nextNet.Cost
				data.Net += 1
				bought = true
			elseif f.BuildingTo == 0 and f.Level < Config.Factory.MaxLevel and data.Coins >= Formulas.factoryCost(f.Level + 1) and (not nextZone or Formulas.factoryCost(f.Level + 1) < nextZone.Cost * 0.2) then
				data.Coins -= Formulas.factoryCost(f.Level + 1)
				f.BuildingTo = f.Level + 1
				f.BuildEndsAt = t + Formulas.factoryBuildTime(f.BuildingTo)
				bought = true
			else
				for _, helper in Config.Helpers do
					if not data.HelpersOwned[helper.Key] and data.Coins >= helper.Cost and (not nextZone or helper.Cost < nextZone.Cost * 0.25) then
						data.Coins -= helper.Cost
						data.HelpersOwned[helper.Key] = true
						table.insert(data.Equipped, helper.Key)
						while #data.Equipped > 1 + (data.Perks.HelperSlots or 0) do
							table.remove(data.Equipped, 1)
						end
						bought = true
						break
					end
				end
			end
		end
		if not rebirthAt and data.Coins >= Formulas.rebirthCost(data.Rebirths) and data.MaxZone >= 5 then
			rebirthAt = t
			mark("🌀 Хватает на первое перерождение")
		end
	end
	print(string.format("\n%s (ловит %d%% мусора):", label, math.floor(catchShare * 100)))
	for _, line in log do
		print(line)
	end
	print(string.format("  Итог за %d ч: зона %d, сачок %d, фабрика ур. %d", hours, data.MaxZone, data.Net, data.Factory.Level))
end

math.randomseed(7)
simulate("Обычный игрок", 0.45, 8)
simulate("Активный игрок", 0.7, 8)
