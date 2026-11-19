--[[
	FactoryService — фабрика переработки: пассивный доход.
	Копит монеты даже когда игрока нет в игре (до заполнения склада).
	Улучшение строится по времени — ускорить нельзя, только подождать ⏳
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local FactoryService = {}

local Services

function FactoryService.settle(player: Player, data)
	local completed = Formulas.settleFactory(data, os.time())
	if completed then
		Services.NetService.notify(player, "🏭 Стройка завершена! Фабрика теперь " .. data.Factory.Level .. " уровня", "success")
		Services.NetService.markDirty(player)
	end
end

function FactoryService:Init(services)
	Services = services

	Services.DataService.Loaded:Connect(function(player, data)
		local before = data.Factory.Stored
		local completed = Formulas.settleFactory(data, os.time())
		local gained = math.floor(data.Factory.Stored - before)
		if data.Factory.Level > 0 and gained >= 1 then
			task.delay(4, function()
				Services.NetService.notify(
					player,
					"🏭 Пока тебя не было, фабрика накопила " .. Format.number(gained) .. " 💰 — забери в меню «Фабрика»!",
					"success"
				)
			end)
		end
		if completed then
			task.delay(5, function()
				Services.NetService.notify(player, "🏗️ Пока тебя не было, стройка фабрики завершилась!", "success")
			end)
		end
	end)

	Services.DataService.addBeforeSave(function(_player, data)
		Formulas.settleFactory(data, os.time())
	end)
end

function FactoryService:Start()
	local Net = Services.NetService

	Net.on("FactoryClaim", function(player, data)
		FactoryService.settle(player, data)
		local amount = math.floor(data.Factory.Stored)
		if amount < 1 then
			if data.Factory.Level <= 0 then
				return false, "Сначала построй фабрику!"
			end
			return false, "Пока пусто — фабрика копит монеты ⏳"
		end
		data.Factory.Stored -= amount
		data.Coins += amount
		data.TotalCoins += amount
		return true, "🏭 +" .. Format.number(amount) .. " 💰 с фабрики"
	end)

	Net.on("FactoryUpgrade", function(player, data)
		FactoryService.settle(player, data)
		local f = data.Factory
		local now = os.time()
		if f.BuildingTo > 0 then
			return false, "Уже строится! Осталось " .. Format.duration(f.BuildEndsAt - now) .. " ⏳"
		end
		local target = f.Level + 1
		if target > Config.Factory.MaxLevel then
			return false, "Фабрика уже максимального уровня 🏆"
		end
		local cost = Formulas.factoryCost(target)
		if data.Coins < cost then
			return false, "Не хватает " .. Format.number(cost - data.Coins) .. " 💰"
		end
		data.Coins -= cost
		data.Tutorial.Bought = true
		local buildTime = Formulas.factoryBuildTime(target)
		f.BuildingTo = target
		f.BuildEndsAt = now + buildTime
		if f.Level == 0 then
			return true, "🏗️ Фабрика строится! Готово через " .. Format.duration(buildTime)
		end
		return true, "🏗️ Улучшение до " .. target .. " ур. началось! Готово через " .. Format.duration(buildTime)
	end)

	while true do
		task.wait(2)
		for _, player in Players:GetPlayers() do
			local data = Services.DataService.get(player)
			if data then
				FactoryService.settle(player, data)
			end
		end
	end
end

return FactoryService
