--[[
	HelpersWindow — помощники: купить, надеть, снять.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local HelperModels = require(Shared.HelperModels)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local Sounds = require(Client.Sounds)
local State = require(Client.State)
local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local HelpersWindow = {}

local T = UIKit.Theme
local updaters: { (any) -> () } = {}

function HelpersWindow.build()
	local window = Windows.create("Helpers", "🐾 Помощники", Vector2.new(780, 540), T.Orange)
	local body = window.Body

	local info = UIKit.text(body, {
		Name = "Info",
		Text = "",
		TextSize = 16,
		TextColor3 = T.Sub,
		Size = UDim2.new(1, 0, 0, 40),
	})

	local scroll = UIKit.scroll(body, {
		Position = UDim2.fromOffset(0, 44),
		Size = UDim2.new(1, 0, 1, -44),
	})
	UIKit.list(scroll, 8)
	UIKit.padding(scroll, 2, 4, 4)

	for index, helper in Config.Helpers do
		local card = UIKit.card(scroll, {
			LayoutOrder = index,
			Height = 96,
			Title = helper.Name,
			Desc = string.format("%s\nЛовит раз в %.1f с • Радиус %d", helper.Desc, helper.Interval, helper.Range),
			IconNode = function(parent, size)
				local box = UIKit.frame(parent, {
					Name = "Preview",
					BackgroundColor3 = T.Panel2,
					Size = UDim2.fromOffset(size, size),
				})
				UIKit.corner(box, 12)
				UIKit.stroke(box, T.Orange, 2, 0.3)
				local ok = pcall(function()
					UIKit.viewport(box, HelperModels.build(helper.Key), { Size = UDim2.fromScale(1, 1) })
				end)
				if not ok then
					UIKit.text(box, { Text = "🐾", TextScaled = true, Size = UDim2.fromScale(1, 1) })
				end
				return box
			end,
			OnClick = function()
				local data = State.Data
				if not data then
					return
				end
				if not data.HelpersOwned[helper.Key] then
					if ClientNet.request("BuyHelper", helper.Key) then
						Sounds.play("Buy", 0.6, 1.1)
					end
				elseif table.find(data.Equipped, helper.Key) then
					ClientNet.request("UnequipHelper", helper.Key)
				else
					ClientNet.request("EquipHelper", helper.Key)
				end
			end,
		})
		table.insert(updaters, function(data)
			if not data.HelpersOwned[helper.Key] then
				local affordable = data.Coins >= helper.Cost
				UIKit.setButton(card.Button, "💰 " .. Format.number(helper.Cost), if affordable then T.Green else T.Disabled)
				card.Stroke.Color = T.Stroke
				card.Stroke.Transparency = 0.35
			elseif table.find(data.Equipped, helper.Key) then
				UIKit.setButton(card.Button, "✓ Помогает\n(снять)", T.GreenDark)
				card.Stroke.Color = T.Gold
				card.Stroke.Transparency = 0
			else
				UIKit.setButton(card.Button, "Взять с собой", T.Blue)
				card.Stroke.Color = T.Orange
				card.Stroke.Transparency = 0.3
			end
		end)
	end

	window.onRender = function(data)
		local slots = 1 + (data.Perks.HelperSlots or 0)
		info.Text = string.format(
			"Слоты: %d/%d. Помощники летают рядом и сами ловят мусор. Больше слотов — во вкладке «Перки» магазина.",
			#data.Equipped,
			slots
		)
		for _, update in updaters do
			update(data)
		end
	end
end

return HelpersWindow
