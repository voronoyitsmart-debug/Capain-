--[[
	BoostsWindow — бесплатные бусты с перезарядкой.
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

local BoostsWindow = {}

local T = UIKit.Theme

function BoostsWindow.build()
	local window = Windows.create("Boosts", "⚡ Бесплатные бусты", Vector2.new(720, 520), T.Cyan)
	local body = window.Body

	local info = UIKit.text(body, {
		Text = "Все бусты бесплатные! Включил — работает, потом перезаряжается. Купить нельзя — только подождать ⏳",
		TextSize = 15,
		TextColor3 = T.Sub,
		Size = UDim2.new(1, 0, 0, 40),
	})
	info.Font = UIKit.FontMedium

	local scroll = UIKit.scroll(body, {
		Position = UDim2.fromOffset(0, 44),
		Size = UDim2.new(1, 0, 1, -44),
	})
	UIKit.list(scroll, 8)
	UIKit.padding(scroll, 2, 4, 4)

	local updaters = {}
	for index, def in Config.Boosts do
		local card = UIKit.card(scroll, {
			LayoutOrder = index,
			Icon = def.Icon,
			Color = T.Cyan,
			Title = def.Name,
			Desc = def.Desc,
			ButtonWidth = 170,
			OnClick = function()
				if ClientNet.request("ActivateBoost", def.Key) then
					Sounds.play("Buy", 0.6, 1.3)
				end
			end,
		})
		table.insert(updaters, function(data)
			local state, left = Formulas.boostState(data, def.Key, State.now())
			if state == "active" then
				UIKit.setButton(card.Button, "✅ Работает\n" .. Format.time(left), T.GreenDark, false)
				card.Stroke.Color = T.Green
				card.Stroke.Transparency = 0
				card.Desc.Text = def.Desc
			elseif state == "cooldown" then
				UIKit.setButton(card.Button, "⏳ " .. Format.time(left), T.Disabled, false)
				card.Stroke.Color = T.Stroke
				card.Stroke.Transparency = 0.35
				card.Desc.Text = def.Desc .. "\nПерезарядка, подожди немного."
			else
				UIKit.setButton(card.Button, "⚡ Включить", T.Cyan)
				card.Stroke.Color = T.Cyan
				card.Stroke.Transparency = 0.1
				card.Desc.Text = string.format("%s\nДействует %s, перезарядка %s.", def.Desc, Format.duration(def.Duration), Format.duration(def.Cooldown))
			end
		end)
	end

	local function render(data)
		for _, update in updaters do
			update(data)
		end
	end
	window.onRender = render
	window.onTick = render
end

return BoostsWindow
