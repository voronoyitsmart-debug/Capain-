--[[
	TeleportWindow — быстрый переход в любую открытую зону.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local State = require(Client.State)
local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local TeleportWindow = {}

local T = UIKit.Theme

function TeleportWindow.build()
	local window = Windows.create("Teleport", "🗺️ Телепорт", Vector2.new(640, 540), Color3.fromRGB(90, 200, 170))
	local scroll = UIKit.scroll(window.Body, {})
	UIKit.list(scroll, 8)
	UIKit.padding(scroll, 2, 4, 4)

	local updaters = {}
	for zoneId, zone in Config.Zones do
		local card = UIKit.card(scroll, {
			LayoutOrder = zoneId,
			Height = 72,
			Icon = tostring(zoneId),
			Color = zone.Theme.Accent,
			Title = zone.Name,
			Desc = "",
			ButtonWidth = 160,
			OnClick = function()
				local data = State.Data
				if not data then
					return
				end
				if zoneId <= data.MaxZone then
					if ClientNet.request("Teleport", zoneId) then
						Windows.close()
					end
				else
					Windows.open("Shop", { tab = "Zones" })
				end
			end,
		})
		table.insert(updaters, function(data)
			if zoneId <= data.MaxZone then
				card.Desc.Text = "Открыта ✅"
				UIKit.setButton(card.Button, "Перенестись", T.Blue)
			else
				card.Desc.Text = "Открывается за " .. Format.number(zone.Cost) .. " 💰"
				UIKit.setButton(card.Button, "🔒 В магазин", T.Disabled)
			end
		end)
	end

	window.onRender = function(data)
		for _, update in updaters do
			update(data)
		end
	end
end

return TeleportWindow
