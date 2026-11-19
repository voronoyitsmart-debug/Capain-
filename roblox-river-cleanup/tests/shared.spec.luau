--[[
	Проверки общих модулей: форматирование, формулы, модели, геометрия.
	Запуск из папки roblox-river-cleanup:  lune run tests/shared.spec.luau
]]

local process = require("@lune/process")
local H = require("./harness")

local Config = H.shared("Config")
local Format = H.shared("Format")
local Formulas = H.shared("Formulas")
local RiverMath = H.shared("RiverMath")
local TrashModels = H.shared("TrashModels")
local HelperModels = H.shared("HelperModels")
local Util = H.shared("Util")

local function freshData()
	return {
		Coins = 0,
		Net = 1,
		Backpack = 1,
		Boots = 1,
		MaxZone = 1,
		Rebirths = 0,
		Perks = {},
		Discovered = {},
		Boosts = {},
		Daily = { Streak = 0, LastClaim = 0 },
		Factory = { Level = 0, Stored = 0, LastCalc = 1000, BuildingTo = 0, BuildEndsAt = 0 },
	}
end

H.test("Format.number", function()
	H.eq(Format.number(0), "0")
	H.eq(Format.number(999), "999")
	H.eq(Format.number(1000), "1K")
	H.eq(Format.number(1999), "1.99K")
	H.eq(Format.number(12345), "12.3K")
	H.eq(Format.number(250000), "250K")
	H.eq(Format.number(1500000), "1.5M")
	H.eq(Format.number(40000000), "40M")
	H.eq(Format.number(900000000), "900M")
	H.eq(Format.number(2.5e12), "2.5T")
	H.eq(Format.number(-1500), "-1.5K")
	H.eq(Format.number(nil), "0")
end)

H.test("Format.time и plural", function()
	H.eq(Format.time(5), "0:05")
	H.eq(Format.time(125), "2:05")
	H.eq(Format.time(3725), "1ч 02м")
	H.eq(Format.duration(7200), "2 ч")
	H.eq(Format.duration(90), "1 мин 30 сек")
	H.eq(Format.plural(1, "предмет", "предмета", "предметов"), "предмет")
	H.eq(Format.plural(3, "предмет", "предмета", "предметов"), "предмета")
	H.eq(Format.plural(11, "предмет", "предмета", "предметов"), "предметов")
	H.eq(Format.plural(21, "предмет", "предмета", "предметов"), "предмет")
	H.eq(Format.plural(25, "предмет", "предмета", "предметов"), "предметов")
	H.eq(Format.spaced(1234567), "1 234 567")
	H.eq(Format.spaced(100), "100")
	H.eq(Format.multiplier(2), "x2")
	H.eq(Format.multiplier(1.5), "x1.5")
end)

H.test("Config: у каждого мусора есть модель и зона", function()
	local count = 0
	for key, def in Config.Trash do
		count += 1
		H.ok(TrashModels.has(key), "нет модели для " .. key)
		H.ok(Config.Rarities[def.Rarity], "плохая редкость у " .. key)
		H.ok(table.find(Config.Zones[def.Zone].Trash, key), key .. " не входит в свою зону")
		H.ok(def.Size >= 1 and def.Value >= 1, "размер/цена у " .. key)
	end
	H.eq(count, 42, "всего мусора")
	for zoneId, zone in Config.Zones do
		H.eq(#zone.Trash, 7, "предметов в зоне " .. zoneId)
		for rarity in Config.Rarities do
			H.ok(Config.ZoneRarityCount[zoneId][rarity], "в зоне " .. zoneId .. " нет редкости " .. rarity)
		end
	end
	for _, helper in Config.Helpers do
		H.ok(HelperModels.has(helper.Key), "нет модели помощника " .. helper.Key)
	end
end)

H.test("Config: цены растут", function()
	for _, list in { Config.Nets, Config.Backpacks, Config.Boots, Config.Helpers, Config.Zones } do
		for i = 2, #list do
			H.ok(list[i].Cost > list[i - 1].Cost, "цена не растёт на шаге " .. i)
		end
	end
	for i = 2, #Config.Nets do
		H.ok(Config.Nets[i].Range > Config.Nets[i - 1].Range, "дальность сачка")
	end
	-- Ни одного Robux: в конфиге нет полей с донатом
	for _, perk in Config.Perks do
		H.ok(perk.Robux == nil and perk.ProductId == nil and perk.GamePassId == nil, "донат в перке!")
	end
end)

H.test("Formulas: стартовые характеристики", function()
	local data = freshData()
	local stats = Formulas.getStats(data, 2000, nil)
	H.eq(stats.Range, 16)
	H.eq(stats.Capacity, 15)
	H.eq(stats.WalkSpeed, 16)
	H.eq(stats.CoinMult, 1)
	H.eq(stats.Luck, 1)
	H.eq(stats.HelperSlots, 1)
	H.near(stats.ShinyChance, 0.03, 1e-9)
end)

H.test("Formulas: множители и бусты", function()
	local data = freshData()
	data.Rebirths = 2
	data.Perks.Banker = 1
	data.Discovered = { paper = true, bottle = true, fake = true }
	data.Boosts.Coins2x = { StartAt = 0, EndsAt = 3000, ReadyAt = 5000 }
	-- 2 перерождения = x2, банкир = x1.2, коллекция 2 шт = x1.03, буст x2
	H.near(Formulas.coinMultiplier(data, 2000, nil), 2 * 1.2 * 1.03 * 2, 1e-9)
	H.near(Formulas.coinMultiplier(data, 2000, "GoldenHour"), 2 * 1.2 * 1.03 * 4, 1e-9)
	H.near(Formulas.coinMultiplier(data, 4000, nil), 2 * 1.2 * 1.03, 1e-9, "после конца буста")

	local state, left = Formulas.boostState(data, "Coins2x", 2000)
	H.eq(state, "active")
	H.eq(left, 1000)
	state, left = Formulas.boostState(data, "Coins2x", 4000)
	H.eq(state, "cooldown")
	H.eq(left, 1000)
	state = Formulas.boostState(data, "Coins2x", 6000)
	H.eq(state, "ready")

	data.Boosts.SuperNet = { StartAt = 0, EndsAt = 3000, ReadyAt = 5000 }
	local stats = Formulas.getStats(data, 2000, nil)
	H.near(stats.Range, 24, 1e-9)
	H.near(stats.Cooldown, 0.39, 1e-9)
end)

H.test("Formulas: цены перков", function()
	H.eq(Formulas.perkCost("AutoCollect", 1), 2500)
	H.eq(Formulas.perkCost("AutoCollect", 2), nil)
	H.eq(Formulas.perkCost("Luck", 1), 6000)
	H.eq(Formulas.perkCost("Luck", 2), 19200)
	H.eq(Formulas.perkCost("HelperSlots", 3), 6000000)
	H.eq(Formulas.rebirthCost(0), 1000000)
	H.eq(Formulas.rebirthCost(2), 16000000)
end)

H.test("Formulas: фабрика копит и упирается в склад", function()
	local data = freshData()
	data.Factory = { Level = 1, Stored = 0, LastCalc = 1000, BuildingTo = 0, BuildEndsAt = 0 }
	local sim = Formulas.simulateFactory(data, 1100)
	H.near(sim.Stored, 100, 1e-6, "100 секунд на 1 уровне")
	-- склад 2 часа = 7200 монет
	sim = Formulas.simulateFactory(data, 1000 + 100000)
	H.near(sim.Stored, 7200, 1e-6, "упёрлись в склад")
	-- турбо x3 на 100 секунд из 200
	data.Boosts.FactoryTurbo = { StartAt = 1050, EndsAt = 1150, ReadyAt = 9999 }
	sim = Formulas.simulateFactory(data, 1200)
	H.near(sim.Stored, 200 + 100 * 2, 1e-6, "турбо")
end)

H.test("Formulas: стройка фабрики завершается вовремя", function()
	local data = freshData()
	data.Factory = { Level = 1, Stored = 0, LastCalc = 1000, BuildingTo = 2, BuildEndsAt = 1100 }
	local sim = Formulas.simulateFactory(data, 1050)
	H.eq(sim.Level, 1)
	H.eq(sim.Completed, false)
	H.near(sim.Stored, 50, 1e-6)
	sim = Formulas.simulateFactory(data, 1200)
	H.eq(sim.Level, 2)
	H.eq(sim.Completed, true)
	H.near(sim.Stored, 100 + 100 * 1.7, 1e-6, "100с на 1 ур + 100с на 2 ур")
	-- settle меняет данные
	local completed, gained = Formulas.settleFactory(data, 1200)
	H.eq(completed, true)
	H.near(gained, 270, 1e-6)
	H.eq(data.Factory.BuildingTo, 0)
	H.eq(data.Factory.Level, 2)
	-- с нулевого уровня
	local fresh = freshData()
	fresh.Factory = { Level = 0, Stored = 0, LastCalc = 1000, BuildingTo = 1, BuildEndsAt = 1020 }
	sim = Formulas.simulateFactory(fresh, 1030)
	H.eq(sim.Level, 1)
	H.near(sim.Stored, 10, 1e-6)
end)

H.test("Formulas: ежедневка", function()
	local data = freshData()
	local available, streak = Formulas.dailyStatus(data, 100000)
	H.eq(available, true)
	H.eq(streak, 1)
	data.Daily = { Streak = 1, LastClaim = 100000 }
	local wait
	available, streak, wait = Formulas.dailyStatus(data, 100000 + 3600)
	H.eq(available, false)
	H.eq(wait, 19 * 3600)
	available, streak = Formulas.dailyStatus(data, 100000 + 21 * 3600)
	H.eq(available, true)
	H.eq(streak, 2)
	available, streak = Formulas.dailyStatus(data, 100000 + 50 * 3600)
	H.eq(streak, 1, "серия сброшена")
	data.Daily = { Streak = 7, LastClaim = 100000 }
	available, streak = Formulas.dailyStatus(data, 100000 + 21 * 3600)
	H.eq(streak, 1, "после 7 дня снова 1")
	H.eq(Formulas.dailyReward(freshData(), 1), 120)
end)

H.test("Formulas: удача повышает шанс редкостей", function()
	local list1, total1 = Formulas.trashWeights(1, 1)
	local list3, total3 = Formulas.trashWeights(1, 3)
	local function share(list, total, key)
		for _, entry in list do
			if entry.Key == key then
				return entry.Weight / total
			end
		end
		return 0
	end
	H.ok(share(list3, total3, "goldbottle") > share(list1, total1, "goldbottle") * 5, "легендарка с удачей x3")
	H.ok(share(list3, total3, "paper") < share(list1, total1, "paper"), "обычные реже")
	H.near(share(list1, total1, "goldbottle"), 0.007, 1e-6)
end)

H.test("RiverMath: зоны и движение", function()
	H.eq(RiverMath.zoneFromZ(0), 1)
	H.eq(RiverMath.zoneFromZ(-99), 1)
	H.eq(RiverMath.zoneFromZ(101), 2)
	H.eq(RiverMath.zoneFromZ(1000), 6)
	H.eq(RiverMath.zoneFromZ(5000), 6)
	H.eq(RiverMath.riverZ(2), 210)
	local origin = H.roblox.Vector3.new(-114, -2, 10)
	local vel = H.roblox.Vector3.new(3, 0, 0)
	local p = RiverMath.trashPosition(origin, vel, 100, 5, 110)
	H.near(p.X, -84, 1e-6)
	H.ok(math.abs(p.Z - 10) <= 1.2, "покачивание поперёк")
	H.ok(math.abs(p.Y - (Config.World.WaterY + 0.1)) <= 0.21, "на поверхности воды")
	local cf = RiverMath.trashCFrame(origin, vel, 100, 5, 110)
	H.near(cf.Position.X, p.X, 1e-6)
	local over = RiverMath.isOverRiver(H.roblox.Vector3.new(0, 0, 10))
	H.eq(over, true)
	over = RiverMath.isOverRiver(H.roblox.Vector3.new(0, 0, -50))
	H.eq(over, false)
	H.near(RiverMath.flowLifetime(3), 228 / 3, 1e-6)
end)

H.test("TrashModels: все модели собираются (свойства проверяет база Roblox)", function()
	for key in Config.Trash do
		local model = TrashModels.build(key)
		H.ok(model.PrimaryPart ~= nil, "нет PrimaryPart у " .. key)
		H.eq(model.PrimaryPart.Name, "Hitbox")
		local parts = 0
		for _, child in model:GetChildren() do
			if child:IsA("BasePart") then
				parts += 1
				H.eq(child.Anchored, true, key .. " Anchored")
				H.eq(child.CanCollide, false, key .. " CanCollide")
			end
		end
		H.ok(parts >= 3, "слишком мало деталей у " .. key)
		for _, child in model:GetChildren() do
			if child:IsA("BasePart") then
				local p = child.CFrame.Position
				H.ok(p.X == p.X and p.Y == p.Y and p.Z == p.Z, "координаты NaN у детали " .. child.Name .. " в " .. key)
				local look = child.CFrame.LookVector
				H.ok(look.X == look.X and math.abs(look.Magnitude - 1) < 1e-3, "битый поворот у " .. child.Name .. " в " .. key)
				H.ok(p.Magnitude < 6, "деталь далеко от центра в " .. key)
				if child.Shape == H.roblox.Enum.PartType.Cylinder then
					H.near(child.Size.Y, child.Size.Z, 1e-3, "цилиндр с разными Y и Z в " .. key)
				end
			end
		end
		TrashModels.decorate(model, key)
		local rarity = Config.Rarities[Config.Trash[key].Rarity]
		if rarity.Order >= 3 then
			H.ok(model.PrimaryPart:FindFirstChild("Tag"), "нет подписи у " .. key)
		end
		if rarity.Order >= 4 then
			H.ok(model.PrimaryPart:FindFirstChild("Sparkles"), "нет искр у " .. key)
		end
	end
end)

H.test("HelperModels: все помощники собираются", function()
	for _, helper in Config.Helpers do
		local model = HelperModels.build(helper.Key)
		H.ok(model.PrimaryPart and model.PrimaryPart.Name == "Root", "Root у " .. helper.Key)
		H.ok(#model:GetChildren() >= 5, "детали у " .. helper.Key)
		for _, child in model:GetChildren() do
			local p = child.CFrame.Position
			H.ok(p.X == p.X and p.Y == p.Y and p.Z == p.Z, "NaN у помощника " .. helper.Key)
			if child.Shape == H.roblox.Enum.PartType.Cylinder then
				H.near(child.Size.Y, child.Size.Z, 1e-3, "цилиндр с разными Y и Z у " .. helper.Key)
			end
		end
	end
	local drone = HelperModels.build("drone")
	H.ok(drone:FindFirstChild("Rotor"), "у дрона есть винты")
end)

H.test("Util.reconcile дополняет данные", function()
	local data = { Coins = 5, Perks = { Luck = 2 }, Settings = { Sounds = false } }
	Util.reconcile(data, { Coins = 0, Perks = {}, Settings = { Sounds = true, ShowRange = true }, Quests = {} })
	H.eq(data.Coins, 5)
	H.eq(data.Perks.Luck, 2)
	H.eq(data.Settings.Sounds, false)
	H.eq(data.Settings.ShowRange, true)
	H.ok(type(data.Quests) == "table")
	H.eq(Util.material("Cardboard").Name, "Cardboard")
	H.eq(Util.material("НетТакого"), H.roblox.Enum.Material.SmoothPlastic)
end)

process.exit(H.finish())
