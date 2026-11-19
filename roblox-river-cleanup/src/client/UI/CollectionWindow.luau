--[[
	CollectionWindow — коллекция мусора: 42 предмета по зонам.
	Каждый найденный предмет навсегда даёт +1.5% к монетам.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)
local TrashModels = require(Shared.TrashModels)

local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local CollectionWindow = {}

local T = UIKit.Theme

function CollectionWindow.build()
	local window = Windows.create("Collection", "📖 Коллекция мусора", Vector2.new(800, 560), T.Purple)
	local body = window.Body

	local summary = UIKit.text(body, {
		Text = "",
		Font = UIKit.FontBlack,
		TextSize = 18,
		Size = UDim2.new(1, 0, 0, 26),
	})
	local scroll = UIKit.scroll(body, {
		Position = UDim2.fromOffset(0, 32),
		Size = UDim2.new(1, 0, 1, -32),
	})
	UIKit.list(scroll, 10)
	UIKit.padding(scroll, 2, 4, 4)

	local cells: { [string]: any } = {}
	local headers: { [number]: TextLabel } = {}
	local built = false

	local function build()
		built = true
		for zoneId, zone in Config.Zones do
			local section = UIKit.frame(scroll, {
				Name = "Zone" .. zoneId,
				LayoutOrder = zoneId,
				BackgroundColor3 = T.Panel2,
				Size = UDim2.new(1, -10, 0, 0),
				AutomaticSize = Enum.AutomaticSize.Y,
			})
			UIKit.corner(section, 14)
			UIKit.padding(section, 10)
			UIKit.list(section, 8)
			headers[zoneId] = UIKit.text(section, {
				LayoutOrder = 0,
				Text = "",
				Font = UIKit.FontBlack,
				TextSize = 17,
				TextColor3 = zone.Theme.Accent,
				Size = UDim2.new(1, 0, 0, 22),
			})
			local grid = UIKit.frame(section, {
				Name = "Grid",
				LayoutOrder = 1,
				BackgroundTransparency = 1,
				Size = UDim2.new(1, 0, 0, 0),
				AutomaticSize = Enum.AutomaticSize.Y,
			})
			UIKit.grid(grid, UDim2.fromOffset(100, 132), 8)
			for index, key in zone.Trash do
				local def = Config.Trash[key]
				local rarity = Config.Rarities[def.Rarity]
				local cell = UIKit.frame(grid, {
					Name = key,
					LayoutOrder = index,
					BackgroundColor3 = T.Card,
				})
				UIKit.corner(cell, 12)
				UIKit.stroke(cell, rarity.Color, 2, 0.15)
				local preview = UIKit.frame(cell, {
					Name = "Preview",
					BackgroundTransparency = 1,
					Position = UDim2.fromOffset(10, 4),
					Size = UDim2.fromOffset(80, 70),
				})
				local unknown = UIKit.text(cell, {
					Text = "❓",
					TextSize = 40,
					TextXAlignment = Enum.TextXAlignment.Center,
					Position = UDim2.fromOffset(10, 4),
					Size = UDim2.fromOffset(80, 70),
				})
				local name = UIKit.text(cell, {
					Text = "???",
					TextSize = 12,
					TextXAlignment = Enum.TextXAlignment.Center,
					Position = UDim2.fromOffset(4, 74),
					Size = UDim2.new(1, -8, 0, 30),
				})
				local info = UIKit.text(cell, {
					Text = rarity.Name,
					TextSize = 11,
					TextColor3 = rarity.Color,
					TextXAlignment = Enum.TextXAlignment.Center,
					Position = UDim2.fromOffset(4, 104),
					Size = UDim2.new(1, -8, 0, 24),
				})
				cells[key] = { Preview = preview, Unknown = unknown, Name = name, Info = info, Model = false }
			end
		end
	end

	window.onRender = function(data)
		if not built then
			build()
		end
		local count = Formulas.collectionCount(data)
		summary.Text = string.format(
			"Найдено %d из %d  •  Бонус коллекции: +%s к монетам навсегда",
			count,
			Config.TotalTrashTypes,
			Format.percent(Formulas.collectionBonus(data))
		)
		for zoneId, zone in Config.Zones do
			local found = 0
			for _, key in zone.Trash do
				if data.Discovered[key] then
					found += 1
				end
			end
			local locked = if zoneId > data.MaxZone then "  🔒" else ""
			headers[zoneId].Text = string.format("Зона %d • %s  (%d/%d)%s", zoneId, zone.Name, found, #zone.Trash, locked)
		end
		for key, cell in cells do
			local def = Config.Trash[key]
			local known = data.Discovered[key] == true
			cell.Unknown.Visible = not known
			cell.Preview.Visible = known
			if known then
				cell.Name.Text = def.Name
				cell.Info.Text = Format.number(def.Value) .. " 💰 • " .. def.Size .. " м."
				if not cell.Model then
					cell.Model = true
					pcall(function()
						UIKit.viewport(cell.Preview, TrashModels.build(key), { Size = UDim2.fromScale(1, 1) })
					end)
				end
			else
				cell.Name.Text = "???"
				cell.Info.Text = Config.Rarities[def.Rarity].Name
			end
		end
	end
end

return CollectionWindow
