--[[
	RebirthWindow — перерождение с подтверждением.
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

local RebirthWindow = {}

local T = UIKit.Theme
local PURPLE = Color3.fromRGB(190, 110, 255)

function RebirthWindow.build()
	local window = Windows.create("Rebirth", "🌀 Перерождение", Vector2.new(680, 520), PURPLE)
	local body = window.Body
	UIKit.list(body, 10)

	local count = UIKit.text(body, {
		LayoutOrder = 1,
		Text = "",
		Font = UIKit.FontBlack,
		TextSize = 24,
		Size = UDim2.new(1, 0, 0, 30),
	})
	local bonus = UIKit.text(body, {
		LayoutOrder = 2,
		Text = "",
		TextSize = 18,
		TextColor3 = T.Gold,
		Size = UDim2.new(1, 0, 0, 48),
	})
	local progress = UIKit.bar(body, { LayoutOrder = 3, Size = UDim2.new(1, 0, 0, 30), Color = PURPLE })

	local lists = UIKit.frame(body, {
		LayoutOrder = 4,
		BackgroundTransparency = 1,
		Size = UDim2.new(1, 0, 0, 150),
	})
	local function column(x: number, title: string, color: Color3, lines: { string })
		local frame = UIKit.frame(lists, {
			BackgroundColor3 = T.Card,
			Position = UDim2.new(x, if x > 0 then 5 else 0, 0, 0),
			Size = UDim2.new(0.5, -5, 1, 0),
		})
		UIKit.corner(frame, 12)
		UIKit.stroke(frame, color, 2, 0.3)
		UIKit.padding(frame, 12)
		UIKit.list(frame, 4)
		UIKit.text(frame, { Text = title, Font = UIKit.FontBlack, TextSize = 17, TextColor3 = color, Size = UDim2.new(1, 0, 0, 22) })
		for i, line in lines do
			local label = UIKit.text(frame, { LayoutOrder = i, Text = line, TextSize = 15, Size = UDim2.new(1, 0, 0, 18) })
			label.Font = UIKit.FontMedium
		end
	end
	column(0, "Сбросится:", T.Red, { "• монеты", "• сачок, рюкзак, обувь", "• открытые зоны", "• мусор в рюкзаке" })
	column(0.5, "Останется навсегда:", T.Green, { "• перки и помощники", "• фабрика и её уровень", "• коллекция и бусты", "• статистика" })

	local armedUntil = 0
	local button
	button = UIKit.button(body, {
		LayoutOrder = 5,
		Text = "🌀 Переродиться",
		TextSize = 20,
		Color = PURPLE,
		Size = UDim2.new(1, 0, 0, 56),
	}, function()
		local data = State.Data
		if not data then
			return
		end
		local cost = Formulas.rebirthCost(data.Rebirths)
		if data.Coins < cost then
			ClientNet.request("Rebirth") -- сервер покажет, сколько не хватает
			return
		end
		if os.clock() < armedUntil then
			armedUntil = 0
			if ClientNet.request("Rebirth") then
				Sounds.play("Buy", 0.8, 0.7)
				Windows.close()
			end
		else
			armedUntil = os.clock() + 4
			UIKit.setButton(button, "Точно? Нажми ещё раз для подтверждения", T.Red)
		end
	end)

	local function render(data)
		local cost = Formulas.rebirthCost(data.Rebirths)
		local now = Formulas.rebirthMultiplier(data.Rebirths)
		local after = Formulas.rebirthMultiplier(data.Rebirths + 1)
		count.Text = "Перерождений: " .. data.Rebirths
		bonus.Text = string.format(
			"Монеты: %s → %s   •   Удача: +%s → +%s",
			Format.multiplier(now),
			Format.multiplier(after),
			Format.percent(data.Rebirths * Config.Rebirth.LuckBonus),
			Format.percent((data.Rebirths + 1) * Config.Rebirth.LuckBonus)
		)
		progress.set(data.Coins / cost, Format.number(data.Coins) .. " / " .. Format.number(cost) .. " 💰")
		if os.clock() >= armedUntil then
			if data.Coins >= cost then
				UIKit.setButton(button, "🌀 Переродиться", PURPLE)
			else
				UIKit.setButton(button, "Нужно " .. Format.number(cost) .. " 💰", T.Disabled)
			end
		end
	end

	window.onOpen = function()
		armedUntil = 0
	end
	window.onRender = render
	window.onTick = render
end

return RebirthWindow
