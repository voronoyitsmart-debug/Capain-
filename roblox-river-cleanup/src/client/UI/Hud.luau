--[[
	Hud — то, что всегда на экране:
	монеты, рюкзак, текущая зона, событие, меню слева (с красными значками),
	кнопки справа (подарок, «Продать», авто-сбор), подсказки для новичков,
	баннер новой зоны и луч-указатель к переработке.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)
local RiverMath = require(Shared.RiverMath)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local State = require(Client.State)
local ZoneController = require(Client.Controllers.ZoneController)
local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local Hud = {}

local T = UIKit.Theme
local player = Players.LocalPlayer

local refs: { [string]: any } = {}
local badges: { [string]: GuiObject } = {}
local displayedCoins = 0
local targetCoins = 0
local gainLabel: TextLabel

local MENU = {
	{ Key = "Shop", Icon = "🛒", Label = "Магазин", Color = T.Blue },
	{ Key = "Helpers", Icon = "🐾", Label = "Помощники", Color = T.Orange },
	{ Key = "Factory", Icon = "🏭", Label = "Фабрика", Color = T.Gold },
	{ Key = "Boosts", Icon = "⚡", Label = "Бусты", Color = T.Cyan },
	{ Key = "Quests", Icon = "📜", Label = "Задания", Color = T.Green },
	{ Key = "Collection", Icon = "📖", Label = "Коллекция", Color = T.Purple },
	{ Key = "Rewards", Icon = "🎁", Label = "Награды", Color = T.Red },
	{ Key = "Rebirth", Icon = "🌀", Label = "Перерожд.", Color = Color3.fromRGB(200, 120, 255) },
	{ Key = "Teleport", Icon = "🗺️", Label = "Телепорт", Color = Color3.fromRGB(90, 200, 170) },
	{ Key = "Settings", Icon = "⚙️", Label = "Настройки", Color = Color3.fromRGB(150, 160, 180) },
}

----------------------------------------------------------------------
-- Значки «есть что сделать»
----------------------------------------------------------------------
local function anyGiftReady(): boolean
	local claimed = State.Meta.GiftsClaimed or {}
	local start = State.Meta.SessionStart or State.now()
	local elapsed = State.now() - start
	for index, gift in Config.Gifts do
		if not table.find(claimed, index) and elapsed >= gift.Minutes * 60 then
			return true
		end
	end
	return false
end

local function computeBadges(data)
	local now = State.now()
	local coins = data.Coins
	local result = {}

	local function canBuy(list, current)
		local nextItem = list[current + 1]
		return nextItem ~= nil and coins >= nextItem.Cost
	end
	local nextZone = Config.Zones[data.MaxZone + 1]
	result.Shop = canBuy(Config.Nets, data.Net)
		or canBuy(Config.Backpacks, data.Backpack)
		or canBuy(Config.Boots, data.Boots)
		or (nextZone ~= nil and coins >= nextZone.Cost)

	local helperAffordable = false
	for _, helper in Config.Helpers do
		if not data.HelpersOwned[helper.Key] and coins >= helper.Cost then
			helperAffordable = true
			break
		end
	end
	result.Helpers = helperAffordable

	local factory = Formulas.simulateFactory(data, now)
	local cap = Formulas.factoryCap(data, factory.Level)
	result.Factory = (factory.Level == 0 and factory.BuildingTo == 0 and coins >= Formulas.factoryCost(1))
		or (cap > 0 and factory.Stored >= cap * 0.3)

	local boostReady = false
	for _, boost in Config.Boosts do
		if Formulas.boostState(data, boost.Key, now) == "ready" then
			boostReady = true
			break
		end
	end
	result.Boosts = boostReady

	local questDone = false
	for _, quest in data.Quests do
		if quest.Done then
			questDone = true
			break
		end
	end
	result.Quests = questDone

	local dailyReady = Formulas.dailyStatus(data, now)
	result.Rewards = dailyReady or anyGiftReady()
	result.Rebirth = coins >= Formulas.rebirthCost(data.Rebirths)
	return result
end

----------------------------------------------------------------------
-- Построение
----------------------------------------------------------------------
local function buildTop(gui: ScreenGui)
	local top = UIKit.frame(gui, {
		Name = "Top",
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 4),
		Size = UDim2.fromOffset(420, 160),
		BackgroundTransparency = 1,
	})
	UIKit.scaleGroup(top)

	local coins = UIKit.frame(top, {
		Name = "Coins",
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.fromScale(0.5, 0),
		Size = UDim2.fromOffset(300, 52),
		BackgroundColor3 = T.Panel,
		BackgroundTransparency = 0.1,
	})
	UIKit.corner(coins, 26)
	UIKit.stroke(coins, T.Gold, 3)
	UIKit.text(coins, {
		Text = "💰",
		TextSize = 30,
		Position = UDim2.fromOffset(14, 0),
		Size = UDim2.new(0, 40, 1, 0),
	})
	refs.Coins = UIKit.text(coins, {
		Name = "Value",
		Text = "0",
		Font = UIKit.FontBlack,
		TextSize = 32,
		TextColor3 = T.Gold,
		TextXAlignment = Enum.TextXAlignment.Center,
		Position = UDim2.fromOffset(48, 0),
		Size = UDim2.new(1, -64, 1, 0),
		Stroke = true,
	})
	refs.CoinsScale = UIKit.new("UIScale", { Parent = coins })

	gainLabel = UIKit.text(top, {
		Name = "Gain",
		Text = "",
		Font = UIKit.FontBlack,
		TextSize = 26,
		TextColor3 = T.Gold,
		TextXAlignment = Enum.TextXAlignment.Left,
		AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.new(0.5, 158, 0, 26),
		Size = UDim2.fromOffset(200, 30),
		TextTransparency = 1,
		Stroke = true,
	})

	local backpack = UIKit.frame(top, {
		Name = "Backpack",
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 58),
		Size = UDim2.fromOffset(300, 30),
		BackgroundTransparency = 1,
	})
	refs.Backpack = UIKit.bar(backpack, { Size = UDim2.fromScale(1, 1), Color = T.Green })
	UIKit.stroke(refs.Backpack.Frame, T.Stroke, 2)

	refs.Zone = UIKit.text(top, {
		Name = "Zone",
		Text = "",
		TextSize = 16,
		TextColor3 = T.Sub,
		TextXAlignment = Enum.TextXAlignment.Center,
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 92),
		Size = UDim2.fromOffset(420, 20),
		Stroke = true,
	})

	local event = UIKit.frame(top, {
		Name = "Event",
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 116),
		Size = UDim2.fromOffset(380, 36),
		BackgroundColor3 = T.Purple,
		Visible = false,
	})
	UIKit.corner(event, 18)
	UIKit.gradient(event, T.Purple, T.Blue, 0)
	refs.EventText = UIKit.text(event, {
		Text = "",
		Font = UIKit.FontBlack,
		TextSize = 18,
		TextXAlignment = Enum.TextXAlignment.Center,
		Size = UDim2.fromScale(1, 1),
		Stroke = true,
	})
	refs.Event = event
end

local function buildMenu(gui: ScreenGui)
	local cell = 78
	local gap = 8
	local menu = UIKit.frame(gui, {
		Name = "Menu",
		AnchorPoint = Vector2.new(0, 0.5),
		Position = UDim2.new(0, 10, 0.5, 10),
		Size = UDim2.fromOffset(cell * 2 + gap, cell * 5 + gap * 4),
		BackgroundTransparency = 1,
	})
	UIKit.scaleGroup(menu)
	UIKit.grid(menu, UDim2.fromOffset(cell, cell), gap)

	for index, item in MENU do
		local button = UIKit.button(menu, {
			Name = item.Key,
			Text = "",
			LayoutOrder = index,
			Color = T.Panel,
			Radius = 16,
		}, function()
			Windows.toggle(item.Key)
		end)
		local edge = button:FindFirstChild("Edge") :: UIStroke
		edge.Color = item.Color
		edge.Thickness = 2.5
		UIKit.text(button, {
			Text = item.Icon,
			TextSize = 32,
			TextXAlignment = Enum.TextXAlignment.Center,
			Position = UDim2.fromOffset(0, 6),
			Size = UDim2.new(1, 0, 0, 40),
		})
		UIKit.text(button, {
			Text = item.Label,
			TextSize = 13,
			TextXAlignment = Enum.TextXAlignment.Center,
			Position = UDim2.new(0, 2, 1, -26),
			Size = UDim2.new(1, -4, 0, 20),
			TextScaled = true,
			Stroke = true,
		})
		local badge = UIKit.frame(button, {
			Name = "Badge",
			AnchorPoint = Vector2.new(0.5, 0.5),
			Position = UDim2.new(1, -6, 0, 6),
			Size = UDim2.fromOffset(22, 22),
			BackgroundColor3 = T.Red,
			Visible = false,
			ZIndex = 5,
		})
		UIKit.corner(badge, 11)
		UIKit.stroke(badge, Color3.new(1, 1, 1), 2)
		UIKit.text(badge, {
			Text = "!",
			Font = UIKit.FontBlack,
			TextSize = 16,
			TextXAlignment = Enum.TextXAlignment.Center,
			Size = UDim2.fromScale(1, 1),
			ZIndex = 6,
		})
		badges[item.Key] = badge
	end
end

local function buildRight(gui: ScreenGui)
	local right = UIKit.frame(gui, {
		Name = "Right",
		AnchorPoint = Vector2.new(1, 0.5),
		Position = UDim2.new(1, -10, 0.5, -20),
		Size = UDim2.fromOffset(176, 200),
		BackgroundTransparency = 1,
	})
	UIKit.scaleGroup(right)
	UIKit.list(right, 8, false, Enum.HorizontalAlignment.Right)

	refs.Gift = UIKit.button(right, {
		Name = "Gift",
		Text = "🎁 Подарок",
		TextSize = 17,
		LayoutOrder = 1,
		Color = T.Purple,
		Size = UDim2.fromOffset(176, 54),
	}, function()
		Windows.toggle("Rewards")
	end)

	refs.Sell = UIKit.button(right, {
		Name = "Sell",
		Text = "♻️ Продать",
		TextSize = 20,
		LayoutOrder = 2,
		Color = T.Green,
		Size = UDim2.fromOffset(176, 54),
		Visible = false,
	}, function()
		ClientNet.request("SellAll")
	end)

	refs.Auto = UIKit.button(right, {
		Name = "Auto",
		Text = "🤖 Авто-сбор",
		TextSize = 16,
		LayoutOrder = 3,
		Color = T.Blue,
		Size = UDim2.fromOffset(176, 44),
		Visible = false,
	}, function()
		local data = State.Data
		if data then
			ClientNet.request("SetSetting", "AutoCollect", not data.Settings.AutoCollect)
		end
	end)
end

local function buildHintAndBanner(gui: ScreenGui)
	local hintHolder = UIKit.frame(gui, {
		Name = "Hint",
		AnchorPoint = Vector2.new(0.5, 1),
		Position = UDim2.new(0.5, 0, 1, -96),
		Size = UDim2.fromOffset(660, 46),
		BackgroundColor3 = T.Panel,
		BackgroundTransparency = 0.15,
		Visible = false,
	})
	UIKit.scaleGroup(hintHolder)
	UIKit.corner(hintHolder, 14)
	UIKit.stroke(hintHolder, T.Gold, 2)
	refs.HintText = UIKit.text(hintHolder, {
		Text = "",
		TextSize = 18,
		TextXAlignment = Enum.TextXAlignment.Center,
		Size = UDim2.fromScale(1, 1),
		Stroke = true,
	})
	refs.Hint = hintHolder

	local banner = UIKit.frame(gui, {
		Name = "ZoneBanner",
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.3),
		Size = UDim2.fromOffset(760, 110),
		BackgroundTransparency = 1,
	})
	UIKit.scaleGroup(banner)
	refs.BannerTitle = UIKit.text(banner, {
		Text = "",
		Font = UIKit.FontBlack,
		TextSize = 54,
		TextXAlignment = Enum.TextXAlignment.Center,
		Size = UDim2.new(1, 0, 0, 64),
		TextTransparency = 1,
		Stroke = true,
	})
	refs.BannerSub = UIKit.text(banner, {
		Text = "",
		TextSize = 22,
		TextXAlignment = Enum.TextXAlignment.Center,
		Position = UDim2.fromOffset(0, 66),
		Size = UDim2.new(1, 0, 0, 30),
		TextTransparency = 1,
		TextColor3 = T.Sub,
		Stroke = true,
	})
end

----------------------------------------------------------------------
-- Обновление
----------------------------------------------------------------------
local function setStrokeTransparency(label: TextLabel, value: number)
	local stroke = label:FindFirstChildOfClass("UIStroke")
	if stroke then
		stroke.Transparency = value
	end
end

local bannerToken = 0
local function showBanner(zoneId: number)
	local zone = Config.Zones[zoneId]
	bannerToken += 1
	local token = bannerToken
	refs.BannerTitle.Text = string.format("Зона %d • %s", zoneId, zone.Name)
	refs.BannerTitle.TextColor3 = zone.Theme.Accent
	local data = State.Data
	local best = Config.Trash[zone.Trash[#zone.Trash]]
	refs.BannerSub.Text = "Легенда этой реки: " .. best.Name .. " ★"
	if data and zoneId > data.MaxZone then
		refs.BannerSub.Text = "Зона закрыта 🔒"
	end
	for _, label in { refs.BannerTitle, refs.BannerSub } do
		UIKit.tween(label, 0.4, { TextTransparency = 0 })
		setStrokeTransparency(label, 0.2)
	end
	task.delay(2.6, function()
		if token ~= bannerToken then
			return
		end
		for _, label in { refs.BannerTitle, refs.BannerSub } do
			UIKit.tween(label, 0.6, { TextTransparency = 1 })
			setStrokeTransparency(label, 1)
		end
	end)
end

local function hintFor(data, stats): string?
	local full = data.InvSize >= stats.Capacity
	local sellAnywhere = (data.Perks.SellAnywhere or 0) > 0
	if not data.Tutorial.Collected then
		return "👆 Кликай (или тапай) по мусору в реке — сачок выловит его!"
	end
	if full then
		if sellAnywhere then
			return "🎒 Рюкзак полон! Жми «♻️ Продать» справа"
		end
		return "🎒 Рюкзак полон! Беги на зелёную площадку ♻️ (следуй за лучом)"
	end
	if not data.Tutorial.Sold and data.InvSize > 0 then
		return "♻️ Отнеси мусор на зелёную площадку переработки, чтобы получить монеты"
	end
	if not data.Tutorial.Bought and data.Coins >= Config.Nets[2].Cost then
		return "🛒 Открой Магазин слева и купи улучшение!"
	end
	return nil
end

-- Луч к площадке переработки
local beam: Beam? = nil
local beamTarget: Part? = nil
local beamAttachment: Attachment? = nil

local function updateBeam(show: boolean)
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not show or not root then
		if beam then
			beam.Enabled = false
		end
		return
	end
	if not beam then
		local target = Instance.new("Part")
		target.Name = "SellGuide"
		target.Anchored = true
		target.CanCollide = false
		target.CanQuery = false
		target.CanTouch = false
		target.Transparency = 1
		target.Size = Vector3.new(0.2, 0.2, 0.2)
		target.Parent = workspace
		local a1 = Instance.new("Attachment")
		a1.Parent = target
		local newBeam = Instance.new("Beam")
		newBeam.Attachment1 = a1
		newBeam.Color = ColorSequence.new(Color3.fromRGB(90, 255, 140))
		newBeam.Transparency = NumberSequence.new(0.25)
		newBeam.Width0 = 1
		newBeam.Width1 = 2
		newBeam.FaceCamera = true
		newBeam.LightEmission = 1
		newBeam.Texture = "rbxasset://textures/particles/sparkles_main.dds"
		newBeam.TextureMode = Enum.TextureMode.Wrap
		newBeam.TextureLength = 3
		newBeam.TextureSpeed = 2
		newBeam.Segments = 12
		newBeam.Parent = target
		beam = newBeam
		beamTarget = target
	end
	if not beamAttachment or beamAttachment.Parent ~= root then
		local a0 = Instance.new("Attachment")
		a0.Name = "SellGuideAttachment"
		a0.Parent = root
		beamAttachment = a0
	end
	local zone = ZoneController.current()
	local pad = RiverMath.sellPadPosition(zone)
	local b = beam :: Beam
	local target = beamTarget :: Part
	target.CFrame = CFrame.new(pad + Vector3.new(0, 2.5, 0))
	b.Attachment0 = beamAttachment
	b.Enabled = true
end

function Hud.update(data)
	local stats = State.stats()
	if not stats then
		return
	end
	targetCoins = data.Coins

	local fraction = data.InvSize / math.max(1, stats.Capacity)
	local color = if fraction >= 1 then T.Red elseif fraction >= 0.75 then T.Orange else T.Green
	local valueNow = data.InvValue * stats.CoinMult
	refs.Backpack.set(
		fraction,
		string.format("🎒 %s / %s   •   ≈ %s 💰", Format.number(data.InvSize), Format.number(stats.Capacity), Format.number(valueNow)),
		color
	)

	refs.Sell.Visible = (data.Perks.SellAnywhere or 0) > 0
	refs.Auto.Visible = (data.Perks.AutoCollect or 0) > 0
	if refs.Auto.Visible then
		local on = data.Settings.AutoCollect
		UIKit.setButton(refs.Auto, if on then "🤖 Авто-сбор: ВКЛ" else "🤖 Авто-сбор: ВЫКЛ", if on then T.Blue else T.Disabled)
	end

	local hint = hintFor(data, stats)
	refs.Hint.Visible = hint ~= nil
	refs.HintText.Text = hint or ""

	local full = data.InvSize >= stats.Capacity
	local needGuide = (data.Perks.SellAnywhere or 0) == 0 and (full or (not data.Tutorial.Sold and data.InvSize >= 3))
	updateBeam(needGuide)

	local result = computeBadges(data)
	for key, badge in badges do
		badge.Visible = result[key] == true
	end
end

local function tick()
	local data = State.Data
	if not data then
		return
	end
	-- зона
	local zoneId = ZoneController.current()
	local zone = Config.Zones[zoneId]
	local saveNote = if State.Meta.CanSave == false then "   ⚠️ сохранение выключено" else ""
	refs.Zone.Text = string.format("📍 Зона %d • %s%s", zoneId, zone.Name, saveNote)

	-- событие
	local eventId, endsAt = State.event()
	if eventId then
		local def = Config.EventByKey[eventId]
		refs.Event.Visible = true
		refs.EventText.Text = string.format("%s %s  %s", def.Icon, def.Name, Format.time(endsAt - State.now()))
	else
		refs.Event.Visible = false
	end

	-- подарок за время
	local claimed = State.Meta.GiftsClaimed or {}
	local start = State.Meta.SessionStart or State.now()
	local elapsed = State.now() - start
	local nextGift = nil
	local ready = false
	for index, gift in Config.Gifts do
		if not table.find(claimed, index) then
			if elapsed >= gift.Minutes * 60 then
				ready = true
				break
			elseif not nextGift then
				nextGift = gift.Minutes * 60 - elapsed
			end
		end
	end
	if ready then
		UIKit.setButton(refs.Gift, "🎁 Забери подарок!", T.Green)
	elseif nextGift then
		UIKit.setButton(refs.Gift, "🎁 Подарок через\n" .. Format.time(nextGift), T.Purple)
	else
		UIKit.setButton(refs.Gift, "🎁 Награды", T.Purple)
	end

	local result = computeBadges(data)
	for key, badge in badges do
		badge.Visible = result[key] == true
	end
end

local gainToken = 0
local function showGain(amount: number)
	gainToken += 1
	local token = gainToken
	gainLabel.Text = "+" .. Format.number(amount)
	gainLabel.TextTransparency = 0
	setStrokeTransparency(gainLabel, 0.2)
	gainLabel.Position = UDim2.new(0.5, 158, 0, 26)
	UIKit.tween(gainLabel, 0.8, { Position = UDim2.new(0.5, 158, 0, 10) })
	refs.CoinsScale.Scale = 1.15
	UIKit.tween(refs.CoinsScale, 0.35, { Scale = 1 }, Enum.EasingStyle.Back)
	task.delay(1.2, function()
		if token == gainToken then
			UIKit.tween(gainLabel, 0.5, { TextTransparency = 1 })
			setStrokeTransparency(gainLabel, 1)
		end
	end)
end

function Hud.build(gui: ScreenGui)
	buildTop(gui)
	buildMenu(gui)
	buildRight(gui)
	buildHintAndBanner(gui)
end

function Hud.start()
	State.Changed:Connect(function(data, old)
		if old and data.Coins > old.Coins then
			showGain(data.Coins - old.Coins)
		end
		if not old then
			displayedCoins = data.Coins
		end
		Hud.update(data)
	end)
	if State.Data then
		displayedCoins = State.Data.Coins
		Hud.update(State.Data)
	end

	ZoneController.ZoneChanged:Connect(showBanner)

	RunService.RenderStepped:Connect(function(dt)
		if math.abs(targetCoins - displayedCoins) < 0.5 then
			displayedCoins = targetCoins
		else
			displayedCoins += (targetCoins - displayedCoins) * math.min(1, dt * 7)
		end
		refs.Coins.Text = Format.number(displayedCoins)
	end)

	task.spawn(function()
		while true do
			task.wait(0.5)
			local ok, err = pcall(tick)
			if not ok then
				warn("[HUD]", err)
			end
			if State.Data then
				local stats = State.stats()
				if stats then
					local full = State.Data.InvSize >= stats.Capacity
					local needGuide = (State.Data.Perks.SellAnywhere or 0) == 0
						and (full or (not State.Data.Tutorial.Sold and State.Data.InvSize >= 3))
					updateBeam(needGuide)
				end
			end
		end
	end)
end

return Hud
