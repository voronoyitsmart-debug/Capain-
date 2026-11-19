--[[
	SettingsWindow — переключатели и статистика игрока.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Format = require(Shared.Format)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local State = require(Client.State)
local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local SettingsWindow = {}

local T = UIKit.Theme

local TOGGLES = {
	{ Key = "AutoCollect", Icon = "🤖", Title = "Авто-сбор", Desc = "Сачок сам ловит ближайший мусор", Perk = "AutoCollect" },
	{ Key = "AutoSell", Icon = "♻️", Title = "Авто-продажа", Desc = "Полный рюкзак продаётся сам", Perk = "AutoSell" },
	{ Key = "WaterWalk", Icon = "🦶", Title = "Ходьба по воде", Desc = "Перк «Водомерка»", Perk = "WaterWalk" },
	{ Key = "ShowRange", Icon = "⭕", Title = "Кольцо дальности", Desc = "Показывать радиус сачка на земле" },
	{ Key = "Effects", Icon = "✨", Title = "Эффекты", Desc = "Брызги, летящий мусор, подписи" },
	{ Key = "Sounds", Icon = "🔊", Title = "Звуки", Desc = "Звуки вылова, продажи и кнопок" },
	{ Key = "Music", Icon = "🎵", Title = "Музыка", Desc = "Фоновая музыка (если задана в Config)" },
}

function SettingsWindow.build()
	local window = Windows.create("Settings", "⚙️ Настройки и статистика", Vector2.new(720, 560), Color3.fromRGB(150, 160, 180))
	local scroll = UIKit.scroll(window.Body, {})
	UIKit.list(scroll, 8)
	UIKit.padding(scroll, 2, 4, 4)

	local toggles = {}
	for index, def in TOGGLES do
		toggles[def.Key] = UIKit.toggle(scroll, def.Icon, def.Title, def.Desc, index, function()
			local data = State.Data
			if not data then
				return
			end
			if def.Perk and (data.Perks[def.Perk] or 0) <= 0 then
				-- перк ещё не куплен — открываем магазин на вкладке «Перки»
				Windows.open("Shop", { tab = "Perks" })
				return
			end
			local value = not (data.Settings[def.Key] ~= false)
			ClientNet.request("SetSetting", def.Key, value)
			State.SettingChanged:Fire(def.Key, value)
		end)
	end

	local stats = UIKit.frame(scroll, {
		LayoutOrder = 100,
		BackgroundColor3 = T.Card,
		Size = UDim2.new(1, -10, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
	})
	UIKit.corner(stats, 14)
	UIKit.padding(stats, 14)
	local statsText = UIKit.text(stats, {
		Text = "",
		TextSize = 16,
		TextYAlignment = Enum.TextYAlignment.Top,
		Size = UDim2.new(1, 0, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
		RichText = true,
	})

	window.onRender = function(data)
		for _, def in TOGGLES do
			local available = def.Perk == nil or (data.Perks[def.Perk] or 0) > 0
			toggles[def.Key].set(data.Settings[def.Key] ~= false, available)
		end
		local s = data.Stats
		local playtime = (s.PlayTime or 0) + math.max(0, State.now() - (State.Meta.SessionStart or State.now()))
		local save = if State.Meta.CanSave == false
			then "<font color=\"#ff7070\">выключено (Studio без доступа к API)</font>"
			else "<font color=\"#70e090\">включено ✅</font>"
		statsText.Text = table.concat({
			"<b>📊 Статистика</b>",
			"🗑️ Выловлено мусора: " .. Format.spaced(s.TrashCollected),
			"🌟 Легендарных: " .. Format.spaced(s.Legendary) .. "   ✨ Сияющих: " .. Format.spaced(s.Shiny),
			"🐾 Поймали помощники: " .. Format.spaced(s.HelperCollected),
			"♻️ Продаж: " .. Format.spaced(s.Sells) .. "   🏆 Лучшая продажа: " .. Format.number(s.BestSell or 0) .. " 💰",
			"💰 Заработано за всё время: " .. Format.number(data.TotalCoins),
			"⏱️ Время в игре: " .. Format.duration(playtime),
			"💾 Сохранение: " .. save,
		}, "\n")
	end
end

return SettingsWindow
