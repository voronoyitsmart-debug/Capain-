--[[
	Интеграционный тест: запускает собранное место (place/ChistayaReka.rbxlx)
	в тестовом движке и проходит всю игру как настоящий игрок.

	Запуск из папки roblox-river-cleanup:
		rojo build default.project.json -o place/ChistayaReka.rbxlx
		lune run tests/integration.spec.luau
]]

local process = require("@lune/process")
local roblox = require("@lune/roblox")
local Engine = require("./engine")
local H = require("./harness")

local V3 = roblox.Vector3
local CF = roblox.CFrame

-- зерно случайности: SEED=123 lune run tests/integration.spec.luau — повторить прогон
local seed = tonumber(process.env.SEED) or os.time()
math.randomseed(seed)

-- время теста = виртуальное время движка
local function vnow(): number
	return math.floor(Engine.Sched.now)
end

local function check(label: string)
	local errors = Engine.takeErrors()
	local warnings = Engine.takeWarnings()
	if #errors > 0 then
		error(label .. ": ошибки в скриптах:\n" .. table.concat(errors, "\n---\n"), 2)
	end
	if #warnings > 0 then
		error(label .. ": предупреждения:\n" .. table.concat(warnings, "\n"), 2)
	end
end

local function findByOrder(parent, order: number)
	for _, child in parent:GetChildren() do
		if child:IsA("GuiObject") and child.LayoutOrder == order then
			return child
		end
	end
	return nil
end

----------------------------------------------------------------------
-- Запуск сервера
----------------------------------------------------------------------
local game = Engine.loadPlace("place/ChistayaReka.rbxlx")
local workspace = game.Workspace
local camera = Engine.wrap(roblox.Instance.new("Camera"))
camera.Parent = workspace
workspace.CurrentCamera = camera

local SSS = game:GetService("ServerScriptService")
local seenEvents = {}
Engine.runScript("server", SSS.Server)
Engine.advance(0.1)
Engine.signal(game.ReplicatedStorage, "@EventId"):Connect(function()
	local id = game.ReplicatedStorage:GetAttribute("EventId")
	if id ~= "" then
		table.insert(seenEvents, id)
	end
end)
Engine.advance(1)

local Services = SSS.Server.Services
local DataService = Engine.require("server", Services.DataService)
local NetService = Engine.require("server", Services.NetService)
local TrashService = Engine.require("server", Services.TrashService)
local ZoneService = Engine.require("server", Services.ZoneService)
local Shared = game.ReplicatedStorage.Shared
local Config = Engine.require("server", Shared.Config)
local RiverMath = Engine.require("server", Shared.RiverMath)
local Formulas = Engine.require("server", Shared.Formulas)

H.test("сервер запустился без ошибок", function()
	check("старт сервера")
	H.ok(table.find(Engine.logs, "[server] [Чистая Река] Сервер запущен ✔"), "нет сообщения о запуске")
end)

H.test("мир построен", function()
	local map = workspace.Map
	H.eq(#map.Gates:GetChildren(), #Config.Zones - 1, "ворота")
	H.eq(#map.SellPads:GetChildren(), #Config.Zones, "станции переработки")
	H.ok(map.Leaderboards:FindFirstChild("TopTrash"), "доска рекордов")
	H.ok(map.Leaderboards:FindFirstChild("TopRebirth"), "доска перерождений")
	H.ok(map:FindFirstChild("Spawn"), "точка появления")
	H.ok(Engine.terrainFills > 60, "рельеф: " .. Engine.terrainFills)
	local parts = 0
	for _, d in map:GetDescendants() do
		if d:IsA("BasePart") then
			parts += 1
		end
	end
	H.ok(parts > 800 and parts < 6000, "деталей на карте: " .. parts)
	local prompts = 0
	for _, d in map:GetDescendants() do
		if d:IsA("ProximityPrompt") then
			prompts += 1
			H.ok(d:GetAttribute("OpenUI"), "у подсказки нет OpenUI")
		end
	end
	H.ok(prompts >= 14, "подсказок E: " .. prompts)
	H.eq(game.Players.CharacterAutoLoads, false, "CharacterAutoLoads")
end)

H.test("мусор плавает во всех зонах", function()
	local trash = workspace.Trash:GetChildren()
	H.ok(#trash >= #Config.Zones * Config.Spawning.PrefillCount, "предметов: " .. #trash)
	for zoneId in Config.Zones do
		H.ok(TrashService.count(zoneId) >= Config.Spawning.PrefillCount, "мало мусора в зоне " .. zoneId)
	end
	local model = trash[1]
	for _, attr in { "Id", "Type", "Zone", "T0", "Origin", "Vel", "Seed", "Pivot0" } do
		H.ok(model:GetAttribute(attr) ~= nil, "нет атрибута " .. attr)
	end
	H.ok(model.PrimaryPart and model.PrimaryPart.Name == "Hitbox", "Hitbox")
	H.eq(game.ReplicatedStorage:GetAttribute("EventId"), "", "события ещё нет")
end)

----------------------------------------------------------------------
-- Игрок заходит
----------------------------------------------------------------------
local player = Engine.addPlayer("Tester", 1001, true)
local clientScript = game.StarterPlayer.StarterPlayerScripts.Client
Engine.runScript("client", clientScript)
Engine.advance(4)

local State = Engine.require("client", clientScript.State)
local Windows = Engine.require("client", clientScript.UI.Windows)
local ClientNet = Engine.require("client", clientScript.ClientNet)
local data = DataService.get(player)

local function root()
	return player.Character.HumanoidRootPart
end

local function moveTo(pos)
	root().CFrame = CF.new(pos)
end

local function serverDirty()
	NetService.markDirty(player)
	Engine.advance(0.4)
end

H.test("игрок загрузился", function()
	check("вход игрока")
	H.ok(data ~= nil, "данные не загружены")
	H.ok(player.Character and player.Character:FindFirstChild("HumanoidRootPart"), "нет персонажа")
	H.ok(player:FindFirstChild("leaderstats"), "нет leaderstats")
	H.eq(player.leaderstats["💰 Монеты"].Value, "0")
	H.ok(State.Data ~= nil, "клиент не получил данные")
	H.eq(State.Data.Coins, 0)
	H.eq(#State.Data.Quests, 3, "задания")
	H.eq(player:GetAttribute("Zone"), 1)
	H.ok(table.find(Engine.logs, "[client] [Чистая Река] Клиент запущен ✔"), "клиент не стартовал")
	local hum = player.Character.Humanoid
	H.eq(hum.WalkSpeed, 16)
	H.eq(hum.UseJumpPower, false)
	-- новичок: ежедневная награда открывается сама
	Engine.advance(4)
	H.eq(Windows.current(), "Rewards", "окно наград при входе")
	Engine.run("client", function()
		Windows.close()
	end)
	check("окно наград")
end)

H.test("интерфейс построен", function()
	local gui = player.PlayerGui.ChistayaRekaUI
	for _, name in { "ShopWindow", "HelpersWindow", "FactoryWindow", "BoostsWindow", "QuestsWindow", "CollectionWindow", "RebirthWindow", "TeleportWindow", "RewardsWindow", "SettingsWindow" } do
		H.ok(gui:FindFirstChild(name), "нет окна " .. name)
	end
	H.ok(gui.Top.Coins.Value.Text == "0", "монеты на экране: " .. gui.Top.Coins.Value.Text)
	H.ok(gui.Hint.Visible, "подсказка новичку")
	H.ok(string.find(gui.Hint:FindFirstChildOfClass("TextLabel").Text, "Кликай"), "текст подсказки")
	local buttons = 0
	for _, child in gui.Menu:GetChildren() do
		if child:IsA("TextButton") then
			buttons += 1
		end
	end
	H.eq(buttons, 10, "кнопок меню")
end)

----------------------------------------------------------------------
-- Ловля мусора кликом
----------------------------------------------------------------------
local TrashAnimator = Engine.require("client", clientScript.Controllers.TrashAnimator)
local UIS = game:GetService("UserInputService")

local function nearestTrash(zoneId: number, from)
	local best, bestDist = nil, math.huge
	for model, info in TrashAnimator.tracked() do
		if model:GetAttribute("Zone") == zoneId then
			local pos = info.CFrame.Position
			local d = (V3.new(pos.X, 0, pos.Z) - V3.new(from.X, 0, from.Z)).Magnitude
			if d < bestDist then
				best, bestDist = model, d
			end
		end
	end
	return best, bestDist
end

local function clickTrash(model)
	local pos = TrashAnimator.position(model)
	camera.CFrame = CF.lookAt(pos + V3.new(0, 25, -18), pos)
	local screen = camera:WorldToScreenPoint(pos)
	local input = Engine.input(roblox.Enum.UserInputType.MouseButton1, screen.X, screen.Y)
	Engine.fire(UIS, "InputBegan", input, false)
	Engine.advance(0.1)
	Engine.fire(UIS, "InputEnded", input, false)
	Engine.advance(0.3)
end

H.test("клик по мусору ловит его сачком", function()
	local rz = RiverMath.riverZ(1)
	local bankZ = rz - Config.World.RiverWidth / 2 - 1
	local caught = 0
	for _ = 1, 20 do
		-- как игрок: подходим к берегу напротив ближайшего к нам предмета
		local target = nil
		for model, info in TrashAnimator.tracked() do
			local pos = info.CFrame.Position
			if model:GetAttribute("Zone") == 1 and math.abs(pos.Z - bankZ) < 12 and math.abs(pos.X) < 100 then
				target = model
				break
			end
		end
		if target then
			local pos = TrashAnimator.position(target)
			moveTo(V3.new(pos.X + 1, 3, bankZ))
			Engine.advance(0.1)
			local before = data.Stats.TrashCollected
			clickTrash(target)
			if data.Stats.TrashCollected > before then
				caught += 1
			end
		else
			Engine.advance(1)
		end
		if caught >= 3 then
			break
		end
	end
	check("ловля")
	H.ok(caught >= 3, "поймано кликом: " .. caught)
	H.ok(data.InvSize > 0, "рюкзак пуст")
	H.ok(data.Tutorial.Collected, "флаг обучения")
	H.eq(State.Data.InvSize, data.InvSize, "клиент видит рюкзак")
	H.ok(next(data.Discovered) ~= nil, "коллекция пополнилась")
end)

H.test("промах мимо предмета тоже ловит ближайший (помощь прицеливанию)", function()
	local rz = RiverMath.riverZ(1)
	local bankZ = rz - Config.World.RiverWidth / 2 - 1
	local done = false
	for _ = 1, 20 do
		for model, info in TrashAnimator.tracked() do
			local pos = info.CFrame.Position
			if not done and model:GetAttribute("Zone") == 1 and math.abs(pos.Z - bankZ) < 10 and math.abs(pos.X) < 100 then
				moveTo(V3.new(pos.X, 3, bankZ))
				Engine.advance(0.1)
				pos = TrashAnimator.position(model)
				camera.CFrame = CF.lookAt(pos + V3.new(0, 25, -18), pos)
				local screen = camera:WorldToScreenPoint(pos)
				local before = data.Stats.TrashCollected
				-- кликаем на 40 пикселей в сторону от предмета
				local input = Engine.input(roblox.Enum.UserInputType.MouseButton1, screen.X + 40, screen.Y + 10)
				Engine.fire(UIS, "InputBegan", input, false)
				Engine.advance(0.1)
				Engine.fire(UIS, "InputEnded", input, false)
				Engine.advance(0.3)
				done = data.Stats.TrashCollected > before
				break
			end
		end
		if done then
			break
		end
		Engine.advance(1)
	end
	H.ok(done, "промах не засчитан")
	check("прицеливание")
end)

H.test("сервер не даёт ловить издалека и в закрытой зоне", function()
	local before = data.Stats.TrashCollected
	moveTo(V3.new(0, 3, RiverMath.zoneOriginZ(1) - 80))
	Engine.advance(0.2)
	-- ловим предмет далеко от игрока напрямую через Remote (как читер)
	local far = nearestTrash(1, V3.new(100, 0, RiverMath.riverZ(1)))
	Engine.run("client", function()
		ClientNet.collect(far:GetAttribute("Id"))
	end)
	Engine.advance(0.5)
	H.eq(data.Stats.TrashCollected, before, "поймал издалека")
	-- зона 2 закрыта
	local other = nearestTrash(2, V3.new(0, 0, RiverMath.riverZ(2)))
	moveTo(V3.new(0, 3, RiverMath.riverZ(1) - 25))
	Engine.run("client", function()
		ClientNet.collect(other:GetAttribute("Id"))
	end)
	Engine.advance(0.5)
	H.eq(data.Stats.TrashCollected, before, "поймал в закрытой зоне")
	check("античит")
end)

H.test("полный рюкзак и продажа на площадке", function()
	-- заполняем рюкзак напрямую
	data.Inventory = { bottle = 15 }
	data.InvSize = 15
	data.InvValue = 30
	serverDirty()
	local gui = player.PlayerGui.ChistayaRekaUI
	H.ok(string.find(gui.Hint:FindFirstChildOfClass("TextLabel").Text, "Рюкзак полон"), "подсказка про полный рюкзак")
	local guide = workspace:FindFirstChild("SellGuide")
	H.ok(guide and guide:FindFirstChildOfClass("Beam").Enabled, "луч к переработке")

	local coinsBefore = data.Coins
	moveTo(RiverMath.sellPadPosition(1) + V3.new(0, 3, 0))
	Engine.advance(1.5)
	check("продажа")
	H.eq(data.InvSize, 0, "рюкзак не опустел")
	H.ok(data.Coins > coinsBefore, "монеты не начислились")
	H.ok(data.Coins >= 30, "мало монет: " .. data.Coins)
	H.ok(data.Tutorial.Sold, "флаг продажи")
	H.eq(State.Data.Coins, data.Coins, "клиент видит монеты")
	H.ok(not guide:FindFirstChildOfClass("Beam").Enabled, "луч должен погаснуть")
end)

----------------------------------------------------------------------
-- Магазин через интерфейс
----------------------------------------------------------------------
H.test("покупка сачка кнопкой в магазине", function()
	data.Coins = 5000
	serverDirty()
	Engine.run("client", function()
		Windows.open("Shop")
	end)
	Engine.advance(0.5)
	local page = player.PlayerGui.ChistayaRekaUI.ShopWindow.Panel.Body.Content.Nets
	local card = findByOrder(page, 2)
	H.ok(card, "карточка сачка 2")
	H.ok(string.find(card.Action.Text, "120"), "цена на кнопке: " .. card.Action.Text)
	Engine.fire(card.Action, "Activated")
	Engine.advance(1)
	check("покупка сачка")
	H.eq(data.Net, 2, "сачок не куплен")
	H.eq(data.Coins, 5000 - 120)
	H.eq(card.Action.Text, "✓ Сейчас", "кнопка после покупки")
	-- нельзя перепрыгнуть уровень
	local card4 = findByOrder(page, 4)
	Engine.fire(card4.Action, "Activated")
	Engine.advance(1)
	H.eq(data.Net, 2, "перепрыгнул уровень")
	Engine.takeWarnings()
	check("пропуск уровня")
end)

H.test("рюкзак, обувь и перки", function()
	local ok1 = Engine.run("client", function()
		return ClientNet.request("BuyBackpack", 2)
	end)
	H.ok(ok1, "рюкзак")
	H.eq(data.Backpack, 2)
	local ok2 = Engine.run("client", function()
		return ClientNet.request("BuyBoots", 2)
	end)
	H.ok(ok2, "обувь")
	H.eq(player.Character.Humanoid.WalkSpeed, 19, "скорость после покупки")
	data.Coins += 100000
	local ok3 = Engine.run("client", function()
		return ClientNet.request("BuyPerk", "AutoCollect")
	end)
	H.ok(ok3, "авто-сбор")
	local ok4 = Engine.run("client", function()
		return ClientNet.request("BuyPerk", "AutoCollect")
	end)
	H.eq(ok4, false, "второй раз авто-сбор купить нельзя")
	local ok5 = Engine.run("client", function()
		return ClientNet.request("BuyPerk", "Luck")
	end)
	H.ok(ok5, "удача")
	H.eq(data.Perks.Luck, 1)
	local bad = Engine.run("client", function()
		return ClientNet.request("BuyPerk", "Robux")
	end)
	H.eq(bad, false, "несуществующий перк")
	Engine.advance(0.5)
	check("перки")
end)

H.test("авто-сбор ловит сам", function()
	local before = data.Stats.TrashCollected
	local rz = RiverMath.riverZ(1)
	moveTo(V3.new(-30, 3, rz - Config.World.RiverWidth / 2 + 4))
	Engine.advance(15)
	check("авто-сбор")
	H.ok(data.Stats.TrashCollected > before, "авто-сбор ничего не поймал")
	local gui = player.PlayerGui.ChistayaRekaUI
	H.ok(gui.Right.Auto.Visible, "кнопка авто-сбора видна")
end)

----------------------------------------------------------------------
-- Зоны
----------------------------------------------------------------------
H.test("покупка зоны 2, ворота и телепорт", function()
	data.Coins += 2000
	local gate = workspace.Map.Gates.Gate_2
	H.eq(gate.Gate.CanCollide, true, "ворота закрыты")
	local ok = Engine.run("client", function()
		return ClientNet.request("BuyZone", 2)
	end)
	H.ok(ok, "зона не куплена")
	H.eq(data.MaxZone, 2)
	Engine.advance(0.5)
	H.eq(gate.Gate.CanCollide, false, "ворота у клиента открылись")
	H.ok(string.find(gate.GateSign.SurfaceFront.Label.Text, "✅"), "табличка ворот")
	H.eq(workspace.Map.Gates.Gate_3.Gate.CanCollide, true, "следующие ворота закрыты")
	local tp = Engine.run("client", function()
		return ClientNet.request("Teleport", 2)
	end)
	H.ok(tp, "телепорт")
	Engine.advance(1)
	H.eq(player:GetAttribute("Zone"), 2)
	H.eq(RiverMath.zoneFromZ(root().Position.Z), 2)
	local bad = Engine.run("client", function()
		return ClientNet.request("BuyZone", 4)
	end)
	H.eq(bad, false, "через зону купить нельзя")
	check("зоны")
end)

H.test("в закрытую зону не пройти", function()
	moveTo(V3.new(0, 3, RiverMath.zoneOriginZ(3)))
	Engine.advance(1)
	H.eq(RiverMath.zoneFromZ(root().Position.Z), 2, "сервер вернул в открытую зону")
	moveTo(V3.new(0, -100, 0))
	Engine.advance(1)
	H.ok(root().Position.Y > -10, "упавшего под карту вернули")
	check("закрытая зона")
end)

----------------------------------------------------------------------
-- Фабрика, бусты, задания, награды
----------------------------------------------------------------------
H.test("фабрика строится, копит и отдаёт монеты", function()
	data.Coins += 1000
	local ok = Engine.run("client", function()
		return ClientNet.request("FactoryUpgrade")
	end)
	H.ok(ok, "стройка не началась")
	H.eq(data.Factory.BuildingTo, 1)
	local again = Engine.run("client", function()
		return ClientNet.request("FactoryUpgrade")
	end)
	H.eq(again, false, "вторая стройка")
	Engine.advance(Formulas.factoryBuildTime(1) + 3)
	H.eq(data.Factory.Level, 1, "уровень после стройки")
	Engine.advance(100)
	local before = data.Coins
	local claimed = Engine.run("client", function()
		return ClientNet.request("FactoryClaim")
	end)
	H.ok(claimed, "забрать")
	H.ok(data.Coins - before >= 95, "фабрика дала " .. (data.Coins - before))
	Engine.run("client", function()
		Windows.open("Factory")
	end)
	Engine.advance(1)
	check("фабрика")
end)

H.test("бесплатный буст x2 удваивает продажу", function()
	local ok = Engine.run("client", function()
		return ClientNet.request("ActivateBoost", "Coins2x")
	end)
	H.ok(ok, "буст")
	local again = Engine.run("client", function()
		return ClientNet.request("ActivateBoost", "Coins2x")
	end)
	H.eq(again, false, "повторно нельзя")
	local mult = Formulas.coinMultiplier(data, vnow(), nil)
	data.Inventory = { cup = 1 }
	data.InvSize = 1
	data.InvValue = 10
	local before = data.Coins
	local sold = Engine.run("client", function()
		return ClientNet.request("SellAll")
	end)
	H.eq(sold, false, "без перка продажа только на площадке")
	moveTo(RiverMath.sellPadPosition(2) + V3.new(0, 3, 0))
	Engine.advance(1.5)
	H.eq(data.Coins - before, math.floor(10 * mult + 0.5), "сумма продажи")
	H.ok(mult >= 2, "множитель с бустом: " .. mult)
	Engine.advance(Config.BoostByKey.Coins2x.Duration + 2)
	H.ok(Formulas.coinMultiplier(data, vnow(), nil) < mult, "буст закончился")
	check("бусты")
end)

H.test("задания выполняются и заменяются", function()
	local quest = data.Quests[1]
	local id = quest.Id
	local early = Engine.run("client", function()
		return ClientNet.request("ClaimQuest", id)
	end)
	H.eq(early, false, "невыполненное не забрать")
	quest.Progress = quest.Target
	quest.Done = true
	local before = data.Coins
	local ok = Engine.run("client", function()
		return ClientNet.request("ClaimQuest", id)
	end)
	H.ok(ok, "награда за задание")
	H.eq(data.Coins - before, quest.Reward)
	H.eq(#data.Quests, 3)
	H.ok(data.Quests[1].Id ~= id, "задание заменено")
	local reroll = Engine.run("client", function()
		return ClientNet.request("RerollQuest", data.Quests[2].Id)
	end)
	H.ok(reroll, "замена задания")
	local reroll2 = Engine.run("client", function()
		return ClientNet.request("RerollQuest", data.Quests[2].Id)
	end)
	H.eq(reroll2, false, "замена на перезарядке")
	-- ловля продвигает задания «Собери N»
	data.Quests[3] = { Id = "test", Kind = "Collect", Target = 1, Progress = 0, Reward = 5, Text = "x", Done = false }
	Engine.advance(10)
	check("задания")
end)

H.test("ежедневная награда и подарки за время", function()
	local first = Engine.run("client", function()
		return ClientNet.request("ClaimDaily")
	end)
	H.ok(first, "ежедневка")
	H.eq(data.Daily.Streak, 1)
	local second = Engine.run("client", function()
		return ClientNet.request("ClaimDaily")
	end)
	H.eq(second, false, "дважды за день нельзя")
	local gift = Engine.run("client", function()
		return ClientNet.request("ClaimGift", 1)
	end)
	H.ok(gift, "подарок за 3 минуты (мы в игре уже дольше)")
	local gift6 = Engine.run("client", function()
		return ClientNet.request("ClaimGift", 6)
	end)
	H.eq(gift6, false, "подарок за час ещё рано")
	Engine.run("client", function()
		Windows.open("Rewards")
	end)
	Engine.advance(1)
	check("награды")
end)

H.test("помощник покупается и ловит мусор", function()
	data.Coins += 1000
	local ok = Engine.run("client", function()
		return ClientNet.request("BuyHelper", "duck")
	end)
	H.ok(ok, "утёнок")
	H.eq(data.Equipped[1], "duck")
	H.eq(player:GetAttribute("Helpers"), "duck")
	Engine.advance(0.5)
	H.ok(workspace.LocalHelpers:FindFirstChild("duck"), "модель помощника у клиента")
	local before = data.Stats.HelperCollected
	ZoneService.teleport(player, 1)
	data.Settings.AutoCollect = false
	Engine.advance(1)
	-- река в зоне 1 сразу оживилась, когда мы пришли
	H.ok(TrashService.count(1) >= math.floor(Config.Zones[1].MaxTrash * Config.Spawning.ArrivalFill), "река не заполнилась при входе")
	local bankZ = RiverMath.riverZ(1) - Config.World.RiverWidth / 2 - 1
	for _ = 1, 6 do
		-- встаём на берег напротив ближайшего мусора и ждём помощника
		for model, info in TrashAnimator.tracked() do
			local pos = info.CFrame.Position
			if model:GetAttribute("Zone") == 1 and math.abs(pos.Z - bankZ) < 15 and math.abs(pos.X) < 90 then
				moveTo(V3.new(pos.X, 3, bankZ))
				break
			end
		end
		Engine.advance(5)
		if data.Stats.HelperCollected > before then
			break
		end
	end
	H.ok(data.Stats.HelperCollected > before, "помощник ничего не поймал")
	local full = Engine.run("client", function()
		return ClientNet.request("EquipHelper", "duck")
	end)
	H.eq(full, false, "дважды не надеть")
	check("помощники")
end)

H.test("все окна открываются и рисуются без ошибок", function()
	for _, name in { "Shop", "Helpers", "Factory", "Boosts", "Quests", "Collection", "Rebirth", "Teleport", "Rewards", "Settings" } do
		Engine.run("client", function()
			Windows.open(name)
		end)
		Engine.advance(1.2)
		H.eq(Windows.current(), name)
		check("окно " .. name)
	end
	Engine.run("client", function()
		Windows.open("Shop", { tab = "Zones" })
	end)
	Engine.advance(0.5)
	local content = player.PlayerGui.ChistayaRekaUI.ShopWindow.Panel.Body.Content
	H.ok(content.Zones.Visible and not content.Nets.Visible, "вкладка «Зоны»")
	-- кнопка E у ларька открывает окно
	local stall = workspace.Map.Hubs.ShopStall_1.Counter:FindFirstChildOfClass("ProximityPrompt")
	Engine.run("client", function()
		Windows.close()
	end)
	Engine.fire(game:GetService("ProximityPromptService"), "PromptTriggered", stall, player)
	Engine.advance(0.5)
	H.eq(Windows.current(), "Shop", "подсказка E")
	check("окна")
end)

H.test("настройки переключаются", function()
	local ok = Engine.run("client", function()
		return ClientNet.request("SetSetting", "Sounds", false)
	end)
	H.ok(ok)
	H.eq(data.Settings.Sounds, false)
	local bad = Engine.run("client", function()
		return ClientNet.request("SetSetting", "Hack", true)
	end)
	H.eq(bad, false)
	local bad2 = Engine.run("client", function()
		return ClientNet.request("SetSetting", "Sounds", "yes")
	end)
	H.eq(bad2, false)
	check("настройки")
end)

H.test("перерождение", function()
	data.Coins = Formulas.rebirthCost(0) + 10
	local ok = Engine.run("client", function()
		return ClientNet.request("Rebirth")
	end)
	H.ok(ok, "перерождение")
	H.eq(data.Rebirths, 1)
	H.eq(data.Coins, 0)
	H.eq(data.Net, 1)
	H.eq(data.MaxZone, 1)
	H.eq(data.HelpersOwned.duck, true, "помощник остался")
	H.eq(data.Factory.Level, 1, "фабрика осталась")
	H.ok(Formulas.coinMultiplier(data, vnow(), nil) >= 1.5, "бонус перерождения")
	for _, quest in data.Quests do
		if quest.Kind == "ZoneCollect" then
			H.eq(quest.Param, 1, "задание из закрытой зоны")
		end
	end
	Engine.advance(1)
	check("перерождение")
end)

H.test("глобальное событие запускается", function()
	local waited = 0
	while game.ReplicatedStorage:GetAttribute("EventId") == "" and waited < 700 do
		Engine.advance(5)
		waited += 5
	end
	local id = game.ReplicatedStorage:GetAttribute("EventId")
	H.ok(Config.EventByKey[id], "событие не началось: " .. tostring(id))
	H.ok(#seenEvents >= 1, "события не было")
	local gui = player.PlayerGui.ChistayaRekaUI
	Engine.advance(1)
	H.ok(gui.Top.Event.Visible, "баннер события")
	Engine.advance(Config.EventByKey[id].Duration + 2)
	H.eq(game.ReplicatedStorage:GetAttribute("EventId"), "", "событие закончилось")
	check("событие")
end)

H.test("доски рекордов заполняются", function()
	Engine.advance(Config.LeaderboardRefresh + 2)
	local row = workspace.Map.Leaderboards.TopTrash.Board.SurfaceFront.Root.Row1
	H.ok(row.PlayerName.Text ~= "—", "строка рекордов пустая")
	check("рекорды")
end)

----------------------------------------------------------------------
-- Сохранение
----------------------------------------------------------------------
H.test("сохранение при выходе и загрузка при входе", function()
	local coins = data.Coins
	data.Coins = coins + 777
	local expected = data.Coins
	local trash = data.Stats.TrashCollected
	Engine.removePlayer(player)
	Engine.advance(2)
	local saved = Engine.readStore("DS:" .. Config.DataStoreName, "Player_1001")
	H.ok(saved and saved.Data, "нет сохранения")
	H.eq(saved.Data.Coins, expected, "монеты в сохранении")
	H.eq(saved.Lock, nil, "блокировка снята при выходе")
	-- снова заходит (уже не как клиент)
	local again = Engine.addPlayer("Tester", 1001, false)
	Engine.advance(3)
	local loaded = DataService.get(again)
	H.ok(loaded, "не загрузилось")
	H.eq(loaded.Coins, expected)
	H.eq(loaded.Stats.TrashCollected, trash)
	H.eq(loaded.Rebirths, 1)
	H.eq(loaded.HelpersOwned.duck, true)
	local locked = Engine.readStore("DS:" .. Config.DataStoreName, "Player_1001")
	H.ok(locked.Lock ~= nil, "сессия заблокирована")
	Engine.removePlayer(again)
	Engine.advance(2)
	check("сохранение")
end)

H.test("Studio без доступа к DataStore: играем без сохранений", function()
	Engine.dataStoreMode = "fail"
	local offline = Engine.addPlayer("Offline", 2002, false)
	Engine.advance(3)
	local d = DataService.get(offline)
	H.ok(d, "игрок должен играть с новыми данными")
	H.eq(DataService.canSave(offline), false)
	H.eq(#Engine.kicks, 0, "в Studio не выгоняем")
	local warnings = Engine.takeWarnings()
	H.ok(#warnings >= 1 and string.find(warnings[1], "Studio"), "предупреждение про Studio")
	Engine.removePlayer(offline)
	Engine.advance(1)
	-- на живом сервере при сбое загрузки игрока лучше выгнать, чем затереть сохранение
	Engine.studio = false
	Engine.addPlayer("Unlucky", 3003, false)
	Engine.advance(40)
	H.eq(#Engine.kicks, 1, "на живом сервере выгоняем при сбое загрузки")
	Engine.studio = true
	Engine.dataStoreMode = "ok"
	Engine.takeWarnings()
	check("Studio")
end)

H.test("выключение сервера сохраняет всех", function()
	local p = Engine.addPlayer("Last", 4004, false)
	Engine.advance(2)
	DataService.get(p).Coins = 4242
	Engine.shutdown()
	local saved = Engine.readStore("DS:" .. Config.DataStoreName, "Player_4004")
	H.ok(saved and saved.Data.Coins == 4242, "BindToClose не сохранил")
	check("выключение")
end)

-- Список использованных свойств/методов (для проверки тегов API)
local usagePath = process.env.USAGE_OUT
if usagePath then
	local list = {}
	for key in Engine.usage do
		table.insert(list, key)
	end
	table.sort(list)
	require("@lune/fs").writeFile(usagePath, table.concat(list, "\n"))
end

local failed = H.finish()
if failed > 0 then
	print("Зерно случайности этого прогона: SEED=" .. seed)
end
local leftover = Engine.takeErrors()
if #leftover > 0 then
	print("Ошибки после тестов:\n" .. table.concat(leftover, "\n---\n"))
	failed += 1
end
process.exit(failed)
