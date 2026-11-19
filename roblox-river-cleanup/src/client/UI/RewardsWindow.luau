--[[
	RewardsWindow — ежедневная награда (серия 7 дней) и подарки за время в игре.
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

local RewardsWindow = {}

local T = UIKit.Theme

function RewardsWindow.build()
	local window = Windows.create("Rewards", "🎁 Бесплатные награды", Vector2.new(780, 560), T.Red)
	local body = window.Body

	UIKit.text(body, {
		Text = "📅 Ежедневная награда — заходи каждый день, серия растёт!",
		Font = UIKit.FontBlack,
		TextSize = 17,
		Size = UDim2.new(1, 0, 0, 24),
	})

	local strip = UIKit.frame(body, {
		Name = "Days",
		BackgroundTransparency = 1,
		Position = UDim2.fromOffset(0, 30),
		Size = UDim2.new(1, 0, 0, 92),
	})
	UIKit.list(strip, 6, true)
	local days = {}
	for day = 1, #Config.Daily.Mults do
		local cell = UIKit.frame(strip, {
			LayoutOrder = day,
			BackgroundColor3 = T.Card,
			Size = UDim2.new(1 / #Config.Daily.Mults, -6, 1, 0),
		})
		UIKit.corner(cell, 12)
		local stroke = UIKit.stroke(cell, T.Stroke, 2, 0.3)
		UIKit.text(cell, {
			Text = "День " .. day,
			TextSize = 14,
			TextXAlignment = Enum.TextXAlignment.Center,
			Position = UDim2.fromOffset(0, 6),
			Size = UDim2.new(1, 0, 0, 18),
		})
		UIKit.text(cell, {
			Text = if day == #Config.Daily.Mults then "🎉" else "💰",
			TextSize = 26,
			TextXAlignment = Enum.TextXAlignment.Center,
			Position = UDim2.fromOffset(0, 24),
			Size = UDim2.new(1, 0, 0, 30),
		})
		local amount = UIKit.text(cell, {
			Text = "",
			TextSize = 14,
			TextColor3 = T.Gold,
			TextXAlignment = Enum.TextXAlignment.Center,
			Position = UDim2.fromOffset(2, 58),
			Size = UDim2.new(1, -4, 0, 30),
		})
		days[day] = { Cell = cell, Stroke = stroke, Amount = amount }
	end

	local dailyButton = UIKit.button(body, {
		Position = UDim2.fromOffset(0, 130),
		Size = UDim2.new(1, 0, 0, 50),
		Text = "Забрать",
		TextSize = 19,
		Color = T.Green,
	}, function()
		if ClientNet.request("ClaimDaily") then
			Sounds.play("Sell", 0.7, 1)
		end
	end)

	UIKit.text(body, {
		Text = "⏱️ Подарки за время в игре (каждый заход заново)",
		Font = UIKit.FontBlack,
		TextSize = 17,
		Position = UDim2.fromOffset(0, 192),
		Size = UDim2.new(1, 0, 0, 24),
	})

	local gifts = UIKit.frame(body, {
		Name = "Gifts",
		BackgroundTransparency = 1,
		Position = UDim2.fromOffset(0, 222),
		Size = UDim2.new(1, 0, 1, -222),
	})
	UIKit.grid(gifts, UDim2.new(1 / 3, -8, 0, 96), 8)
	local giftCells = {}
	for index, gift in Config.Gifts do
		local cell = UIKit.frame(gifts, {
			LayoutOrder = index,
			BackgroundColor3 = T.Card,
		})
		UIKit.corner(cell, 12)
		local stroke = UIKit.stroke(cell, T.Stroke, 2, 0.3)
		local title = UIKit.text(cell, {
			Text = string.format("🎁 %d мин", gift.Minutes),
			Font = UIKit.FontBlack,
			TextSize = 16,
			Position = UDim2.fromOffset(12, 6),
			Size = UDim2.new(1, -24, 0, 22),
		})
		local amount = UIKit.text(cell, {
			Text = "",
			TextSize = 14,
			TextColor3 = T.Gold,
			Position = UDim2.fromOffset(12, 28),
			Size = UDim2.new(1, -24, 0, 18),
		})
		local button = UIKit.button(cell, {
			AnchorPoint = Vector2.new(0.5, 1),
			Position = UDim2.new(0.5, 0, 1, -8),
			Size = UDim2.new(1, -20, 0, 36),
			Text = "",
			TextSize = 15,
			Color = T.Disabled,
		}, function()
			if ClientNet.request("ClaimGift", index) then
				Sounds.play("Sell", 0.6, 1.2)
			end
		end)
		giftCells[index] = { Stroke = stroke, Title = title, Amount = amount, Button = button }
	end

	local function render(data)
		local now = State.now()
		local available, streak, wait = Formulas.dailyStatus(data, now)
		local doneUpTo = if available then streak - 1 else (data.Daily.Streak or 0)
		for day, cell in days do
			cell.Amount.Text = Format.number(Formulas.dailyReward(data, day))
			if day <= doneUpTo then
				cell.Cell.BackgroundColor3 = T.GreenDark
				cell.Stroke.Color = T.Green
			elseif day == streak then
				cell.Cell.BackgroundColor3 = T.Card
				cell.Stroke.Color = T.Gold
				cell.Stroke.Transparency = 0
			else
				cell.Cell.BackgroundColor3 = T.Card
				cell.Stroke.Color = T.Stroke
				cell.Stroke.Transparency = 0.3
			end
		end
		if available then
			local extra = if streak == #Config.Daily.Mults then " + все бусты ⚡" else ""
			UIKit.setButton(
				dailyButton,
				string.format("🎁 Забрать день %d: %s 💰%s", streak, Format.number(Formulas.dailyReward(data, streak)), extra),
				T.Green
			)
		else
			UIKit.setButton(dailyButton, "⏳ Следующая награда через " .. Format.time(wait), T.Disabled, false)
		end

		local claimed = State.Meta.GiftsClaimed or {}
		local start = State.Meta.SessionStart or now
		local elapsed = now - start
		for index, gift in Config.Gifts do
			local cell = giftCells[index]
			local extra = ""
			if gift.Boost then
				local boost = Config.BoostByKey[gift.Boost]
				extra = " + " .. boost.Icon
			end
			cell.Amount.Text = Format.number(Formulas.giftReward(data, index)) .. " 💰" .. extra
			if table.find(claimed, index) then
				UIKit.setButton(cell.Button, "✓ Получено", T.GreenDark, false)
				cell.Stroke.Color = T.Stroke
			elseif elapsed >= gift.Minutes * 60 then
				UIKit.setButton(cell.Button, "Забрать!", T.Green)
				cell.Stroke.Color = T.Gold
			else
				UIKit.setButton(cell.Button, "⏳ " .. Format.time(gift.Minutes * 60 - elapsed), T.Disabled, false)
				cell.Stroke.Color = T.Stroke
			end
		end
	end

	window.onRender = render
	window.onTick = render
end

return RewardsWindow
