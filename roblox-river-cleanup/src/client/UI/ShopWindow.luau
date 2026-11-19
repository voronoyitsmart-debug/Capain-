--[[
	ShopWindow — магазин: сачки, рюкзаки, обувь, перки, зоны.
	Всё только за монеты. Доната нет.
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

local ShopWindow = {}

local T = UIKit.Theme
local pages: { [string]: ScrollingFrame } = {}
local updaters: { (any) -> () } = {}
local tabs

local function priceButton(button: TextButton, cost: number, coins: number)
	local affordable = coins >= cost
	UIKit.setButton(button, "💰 " .. Format.number(cost), if affordable then T.Green else T.Disabled)
end

local function buy(action: string, ...)
	local ok = ClientNet.request(action, ...)
	if ok then
		Sounds.play("Buy", 0.6, 1.1)
	end
end

local function page(key: string): ScrollingFrame
	local scroll = pages[key]
	return scroll
end

-- Вкладка с уровнями (сачки, рюкзаки, обувь)
local function buildTiers(key: string, list, field: string, action: string, describe: (any) -> string, color: Color3)
	local scroll = page(key)
	for tier, item in list do
		local card = UIKit.card(scroll, {
			LayoutOrder = tier,
			Icon = item.Icon,
			Color = color,
			Title = item.Name,
			Desc = describe(item),
			OnClick = function()
				buy(action, tier)
			end,
		})
		table.insert(updaters, function(data)
			local current = data[field]
			if tier < current then
				UIKit.setButton(card.Button, "✓ Было", T.Disabled, false)
				card.Stroke.Color = T.Stroke
				card.Stroke.Transparency = 0.35
			elseif tier == current then
				UIKit.setButton(card.Button, "✓ Сейчас", T.GreenDark, false)
				card.Stroke.Color = T.Gold
				card.Stroke.Transparency = 0
			elseif tier == current + 1 then
				priceButton(card.Button, item.Cost, data.Coins)
				card.Stroke.Color = T.Blue
				card.Stroke.Transparency = 0.2
			else
				UIKit.setButton(card.Button, "🔒 " .. Format.number(item.Cost), T.Panel2, false)
				card.Stroke.Color = T.Stroke
				card.Stroke.Transparency = 0.35
			end
		end)
	end
end

local function buildPerks()
	local scroll = page("Perks")
	for index, key in Config.PerkOrder do
		local def = Config.Perks[key]
		local card = UIKit.card(scroll, {
			LayoutOrder = index,
			Icon = def.Icon,
			Color = T.Gold,
			Title = def.Name,
			Desc = def.Desc,
			OnClick = function()
				buy("BuyPerk", key)
			end,
		})
		table.insert(updaters, function(data)
			local level = data.Perks[key] or 0
			if def.MaxLevel > 1 then
				card.Title.Text = string.format("%s  (ур. %d/%d)", def.Name, level, def.MaxLevel)
			else
				card.Title.Text = def.Name
			end
			if level >= def.MaxLevel then
				UIKit.setButton(card.Button, if def.MaxLevel > 1 then "✓ Максимум" else "✓ Куплено", T.GreenDark, false)
			else
				priceButton(card.Button, Formulas.perkCost(key, level + 1) :: number, data.Coins)
			end
			if key == "Storage" then
				card.Desc.Text = string.format(
					"%s Сейчас: %d ч → дальше %d ч.",
					def.Desc,
					Formulas.factoryStorageHours(data),
					Config.Factory.StorageHours[math.min(level + 2, #Config.Factory.StorageHours)]
				)
			elseif key == "HelperSlots" then
				card.Desc.Text = string.format("%s Сейчас слотов: %d.", def.Desc, 1 + level)
			end
		end)
	end
end

local function buildZones()
	local scroll = page("Zones")
	for zoneId, zone in Config.Zones do
		local legend = Config.Trash[zone.Trash[#zone.Trash]]
		local common = Config.Trash[zone.Trash[1]]
		local card = UIKit.card(scroll, {
			LayoutOrder = zoneId,
			Icon = tostring(zoneId),
			Color = zone.Theme.Accent,
			Title = "Зона " .. zoneId .. ": " .. zone.Name,
			Desc = string.format(
				"Мусор от %s 💰 • ★ Легенда: %s (%s 💰)",
				Format.number(common.Value),
				legend.Name,
				Format.number(legend.Value)
			),
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
					buy("BuyZone", zoneId)
				end
			end,
		})
		table.insert(updaters, function(data)
			if zoneId <= data.MaxZone then
				UIKit.setButton(card.Button, "🗺️ Телепорт", T.Blue)
				card.Stroke.Color = zone.Theme.Accent
				card.Stroke.Transparency = 0.2
			elseif zoneId == data.MaxZone + 1 then
				priceButton(card.Button, zone.Cost, data.Coins)
				card.Stroke.Color = T.Gold
				card.Stroke.Transparency = 0
			else
				UIKit.setButton(card.Button, "🔒 " .. Format.number(zone.Cost), T.Panel2, false)
				card.Stroke.Color = T.Stroke
				card.Stroke.Transparency = 0.35
			end
		end)
	end
end

function ShopWindow.build()
	local window = Windows.create("Shop", "🛒 Магазин", Vector2.new(780, 540), T.Blue)
	local body = window.Body

	local content = UIKit.frame(body, {
		Name = "Content",
		BackgroundTransparency = 1,
		Position = UDim2.fromOffset(0, 50),
		Size = UDim2.new(1, 0, 1, -82),
	})
	local footer = UIKit.text(body, {
		Name = "Footer",
		Text = "💡 Здесь нет доната: всё покупается за монеты, заработанные уборкой реки!",
		TextSize = 14,
		TextColor3 = T.Sub,
		TextXAlignment = Enum.TextXAlignment.Center,
		AnchorPoint = Vector2.new(0, 1),
		Position = UDim2.fromScale(0, 1),
		Size = UDim2.new(1, 0, 0, 24),
	})
	footer.Font = UIKit.FontMedium

	local tabList = {
		{ Key = "Nets", Text = "🥅 Сачки" },
		{ Key = "Backpacks", Text = "🎒 Рюкзаки" },
		{ Key = "Boots", Text = "👟 Обувь" },
		{ Key = "Perks", Text = "⭐ Перки" },
		{ Key = "Zones", Text = "🗺️ Зоны" },
	}
	for _, tab in tabList do
		local scroll = UIKit.scroll(content, { Name = tab.Key, Visible = false })
		UIKit.list(scroll, 8)
		UIKit.padding(scroll, 2, 4, 4)
		pages[tab.Key] = scroll
	end

	tabs = UIKit.tabs(body, tabList, function(key)
		for name, scroll in pages do
			scroll.Visible = name == key
		end
	end)

	buildTiers("Nets", Config.Nets, "Net", "BuyNet", function(item)
		return string.format("Дальность %d • Взмах раз в %.2f с • Ловит до %d шт. за раз", item.Range, item.Cooldown, item.Multi)
	end, T.Cyan)
	buildTiers("Backpacks", Config.Backpacks, "Backpack", "BuyBackpack", function(item)
		return "Вместимость: " .. Format.number(item.Capacity) .. " мест"
	end, T.Orange)
	buildTiers("Boots", Config.Boots, "Boots", "BuyBoots", function(item)
		return string.format("Скорость бега %d • Прыжок %.1f", item.WalkSpeed, item.JumpHeight)
	end, T.Purple)
	buildPerks()
	buildZones()
	tabs.select("Nets")

	window.onOpen = function(arg)
		if type(arg) == "table" and arg.tab and pages[arg.tab] then
			tabs.select(arg.tab)
		end
	end
	window.onRender = function(data)
		for _, update in updaters do
			update(data)
		end
	end
end

return ShopWindow
