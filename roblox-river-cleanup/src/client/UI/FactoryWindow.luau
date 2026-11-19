--[[
	FactoryWindow — фабрика переработки: забрать накопленное, построить/улучшить.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local Sounds = require(Client.Sounds)
local State = require(Client.State)
local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local FactoryWindow = {}

local T = UIKit.Theme

local function rateText(perSecond: number): string
	if perSecond < 10 then
		return string.format("%.1f", perSecond)
	end
	return Format.number(perSecond)
end

function FactoryWindow.build()
	local window = Windows.create("Factory", "🏭 Фабрика переработки", Vector2.new(700, 520), T.Gold)
	local body = window.Body
	UIKit.list(body, 10)

	local status = UIKit.text(body, {
		LayoutOrder = 1,
		Text = "",
		Font = UIKit.FontBlack,
		TextSize = 24,
		Size = UDim2.new(1, 0, 0, 30),
	})
	local stats = UIKit.text(body, {
		LayoutOrder = 2,
		Text = "",
		TextSize = 17,
		TextColor3 = T.Sub,
		Size = UDim2.new(1, 0, 0, 44),
	})

	local storageLabel = UIKit.text(body, {
		LayoutOrder = 3,
		Text = "📦 Склад",
		TextSize = 16,
		Size = UDim2.new(1, 0, 0, 20),
	})
	storageLabel.Font = UIKit.FontMedium
	local storage = UIKit.bar(body, { LayoutOrder = 4, Size = UDim2.new(1, 0, 0, 30), Color = T.Gold })

	local claim = UIKit.button(body, {
		LayoutOrder = 5,
		Text = "Забрать",
		TextSize = 20,
		Color = T.Green,
		Size = UDim2.new(1, 0, 0, 52),
	}, function()
		if ClientNet.request("FactoryClaim") then
			Sounds.play("Sell", 0.6, 1)
		end
	end)

	local buildLabel = UIKit.text(body, {
		LayoutOrder = 6,
		Text = "🏗️ Стройка",
		TextSize = 16,
		Size = UDim2.new(1, 0, 0, 20),
	})
	buildLabel.Font = UIKit.FontMedium
	local progress = UIKit.bar(body, { LayoutOrder = 7, Size = UDim2.new(1, 0, 0, 30), Color = T.Blue })

	local upgrade = UIKit.button(body, {
		LayoutOrder = 8,
		Text = "Построить",
		TextSize = 18,
		Color = T.Blue,
		Size = UDim2.new(1, 0, 0, 52),
	}, function()
		if ClientNet.request("FactoryUpgrade") then
			Sounds.play("Buy", 0.6, 0.9)
		end
	end)

	local note = UIKit.text(body, {
		LayoutOrder = 9,
		Text = "Фабрика работает, даже когда тебя нет в игре — пока не заполнится склад. "
			.. "Ускорить стройку за робуксы нельзя: тут всё бесплатно, нужно просто подождать 😉",
		TextSize = 14,
		TextColor3 = T.Sub,
		Size = UDim2.new(1, 0, 0, 40),
	})
	note.Font = UIKit.FontMedium

	local function render(data)
		local now = State.now()
		local f = Formulas.simulateFactory(data, now)
		local multiplier = Formulas.rebirthMultiplier(data.Rebirths)
		local turbo = Formulas.boostActive(data, "FactoryTurbo", now)
		local rate = Formulas.factoryRate(f.Level) * multiplier * (if turbo then 3 else 1)
		local cap = Formulas.factoryCap(data, f.Level)
		local hours = Formulas.factoryStorageHours(data)

		if f.Level == 0 then
			status.Text = "Фабрика ещё не построена"
			stats.Text = "Построй её — и монеты начнут капать сами, даже пока ты спишь 💤"
		else
			status.Text = string.format("Уровень %d из %d%s", f.Level, Config.Factory.MaxLevel, if turbo then "  ⚡ ТУРБО x3" else "")
			stats.Text = string.format(
				"Доход: %s 💰/сек (≈ %s в час)  •  Склад на %d ч",
				rateText(rate),
				Format.number(rate * 3600),
				hours
			)
		end

		if cap > 0 then
			storage.set(f.Stored / cap, Format.number(f.Stored) .. " / " .. Format.number(cap), if f.Stored >= cap then T.Red else T.Gold)
		else
			storage.set(0, "—")
		end

		local amount = math.floor(f.Stored)
		if amount >= 1 then
			UIKit.setButton(claim, "💰 Забрать " .. Format.number(amount), T.Green)
		else
			UIKit.setButton(claim, "Пока пусто ⏳", T.Disabled)
		end

		if f.BuildingTo > 0 then
			local total = Formulas.factoryBuildTime(f.BuildingTo)
			local left = math.max(0, f.BuildEndsAt - now)
			progress.set(1 - left / math.max(1, total), "Строится ур. " .. f.BuildingTo .. " — осталось " .. Format.time(left), T.Blue)
			UIKit.setButton(upgrade, "⏳ Идёт стройка… просто подожди", T.Disabled, false)
		elseif f.Level >= Config.Factory.MaxLevel then
			progress.set(1, "Максимальный уровень 🏆", T.Gold)
			UIKit.setButton(upgrade, "🏆 Фабрика на максимуме", T.GreenDark, false)
		else
			local target = f.Level + 1
			local cost = Formulas.factoryCost(target)
			local nextRate = Formulas.factoryRate(target) * multiplier
			progress.set(0, string.format("Ур. %d: %s 💰/сек  •  стройка %s", target, rateText(nextRate), Format.duration(Formulas.factoryBuildTime(target))))
			local label = if f.Level == 0 then "🏗️ Построить за " else "⬆️ Улучшить за "
			UIKit.setButton(upgrade, label .. Format.number(cost) .. " 💰", if data.Coins >= cost then T.Blue else T.Disabled)
		end
	end

	window.onRender = render
	window.onTick = render
end

return FactoryWindow
