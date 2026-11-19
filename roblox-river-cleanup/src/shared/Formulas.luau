--[[
	Formulas — вся математика игры. Используется и сервером, и клиентом,
	поэтому интерфейс всегда показывает те же числа, что считает сервер.

	now — время в секундах (сервер: os.time(), клиент: workspace:GetServerTimeNow())
	eventId — ключ активного события сервера или nil
]]

local Config = require(script.Parent.Config)

local Formulas = {}

local function perks(data)
	return data.Perks or {}
end

----------------------------------------------------------------------
-- Бусты
----------------------------------------------------------------------
function Formulas.boostActive(data, key: string, now: number): boolean
	local record = data.Boosts and data.Boosts[key]
	return record ~= nil and (record.EndsAt or 0) > now
end

-- "active", осталось | "cooldown", осталось | "ready", 0
function Formulas.boostState(data, key: string, now: number): (string, number)
	local record = data.Boosts and data.Boosts[key]
	if record then
		if (record.EndsAt or 0) > now then
			return "active", record.EndsAt - now
		end
		if (record.ReadyAt or 0) > now then
			return "cooldown", record.ReadyAt - now
		end
	end
	return "ready", 0
end

local function eventDef(eventId: string?)
	return eventId and Config.EventByKey[eventId] or nil
end

----------------------------------------------------------------------
-- Множители
----------------------------------------------------------------------
function Formulas.rebirthMultiplier(rebirths: number): number
	return 1 + Config.Rebirth.CoinBonus * (rebirths or 0)
end

function Formulas.rebirthCost(rebirths: number): number
	return math.floor(Config.Rebirth.BaseCost * Config.Rebirth.CostGrowth ^ (rebirths or 0))
end

function Formulas.collectionCount(data): number
	local n = 0
	if data.Discovered then
		for key in data.Discovered do
			if Config.Trash[key] then
				n += 1
			end
		end
	end
	return n
end

function Formulas.collectionBonus(data): number
	return Formulas.collectionCount(data) * Config.Collection.BonusPerItem
end

function Formulas.coinMultiplier(data, now: number, eventId: string?): number
	local m = Formulas.rebirthMultiplier(data.Rebirths)
	m *= 1 + (perks(data).Banker or 0) * Config.Perks.Banker.BonusPerLevel
	m *= 1 + Formulas.collectionBonus(data)
	if Formulas.boostActive(data, "Coins2x", now) then
		m *= 2
	end
	local ev = eventDef(eventId)
	if ev and ev.CoinMult then
		m *= ev.CoinMult
	end
	return m
end

function Formulas.luck(data, now: number, eventId: string?): number
	local l = 1
		+ (perks(data).Luck or 0) * Config.Perks.Luck.BonusPerLevel
		+ (data.Rebirths or 0) * Config.Rebirth.LuckBonus
	if Formulas.boostActive(data, "Luck2x", now) then
		l *= 2
	end
	local ev = eventDef(eventId)
	if ev and ev.LuckMult then
		l *= ev.LuckMult
	end
	return l
end

----------------------------------------------------------------------
-- Цены
----------------------------------------------------------------------
-- Цена покупки уровня `level` перка `key`
function Formulas.perkCost(key: string, level: number): number?
	local def = Config.Perks[key]
	if not def or level < 1 or level > def.MaxLevel then
		return nil
	end
	if def.Costs then
		return def.Costs[level]
	end
	return math.floor(def.BaseCost * def.Growth ^ (level - 1))
end

function Formulas.rewardBase(data): number
	local zone = Config.Zones[math.clamp(data.MaxZone or 1, 1, #Config.Zones)]
	return zone.RewardBase * Formulas.rebirthMultiplier(data.Rebirths)
end

----------------------------------------------------------------------
-- Фабрика
----------------------------------------------------------------------
function Formulas.factoryRate(level: number): number
	if level <= 0 then
		return 0
	end
	return Config.Factory.BaseRate * Config.Factory.RateGrowth ^ (level - 1)
end

-- Цена постройки уровня `level`
function Formulas.factoryCost(level: number): number
	return math.floor(Config.Factory.BaseCost * Config.Factory.CostGrowth ^ (level - 1))
end

-- Сколько секунд строится уровень `level`
function Formulas.factoryBuildTime(level: number): number
	local t = Config.Factory.BaseBuildTime * Config.Factory.BuildGrowth ^ (level - 1)
	return math.min(Config.Factory.MaxBuildTime, math.floor(t))
end

function Formulas.factoryStorageHours(data): number
	local hours = Config.Factory.StorageHours
	local level = math.clamp(perks(data).Storage or 0, 0, #hours - 1)
	return hours[level + 1]
end

local function rateFor(data, level: number): number
	return Formulas.factoryRate(level) * Formulas.rebirthMultiplier(data.Rebirths)
end

function Formulas.factoryCap(data, level: number?): number
	local lvl = level or data.Factory.Level
	return rateFor(data, lvl) * Formulas.factoryStorageHours(data) * 3600
end

-- Сколько произведено на уровне `level` между fromTime и toTime (без учёта склада)
local function accrual(data, level: number, fromTime: number, toTime: number): number
	if level <= 0 or toTime <= fromTime then
		return 0
	end
	local seconds = toTime - fromTime
	local turbo = data.Boosts and data.Boosts.FactoryTurbo
	if turbo and turbo.StartAt and turbo.EndsAt then
		local overlap = math.max(0, math.min(toTime, turbo.EndsAt) - math.max(fromTime, turbo.StartAt))
		local mult = Config.BoostByKey.FactoryTurbo.FactoryMult or 3
		seconds += overlap * (mult - 1)
	end
	return rateFor(data, level) * seconds
end

--[[
	Возвращает состояние фабрики на момент now, НЕ меняя data:
	{ Level, Stored, LastCalc, BuildingTo, BuildEndsAt, Completed }
]]
function Formulas.simulateFactory(data, now: number)
	local f = data.Factory
	local level = f.Level or 0
	local stored = f.Stored or 0
	local last = f.LastCalc or now
	local buildingTo = f.BuildingTo or 0
	local buildEnds = f.BuildEndsAt or 0
	local completed = false

	-- копим на уровне lvl от from до to, но не больше вместимости склада
	local function advance(lvl: number, fromTime: number, toTime: number)
		if toTime <= fromTime then
			return
		end
		local cap = Formulas.factoryCap(data, lvl)
		if stored < cap then
			stored = math.min(cap, stored + accrual(data, lvl, fromTime, toTime))
		end
	end

	if buildingTo > 0 and now >= buildEnds then
		-- до конца стройки фабрика работала на старом уровне
		if buildEnds > last then
			advance(level, last, buildEnds)
			last = buildEnds
		end
		level = buildingTo
		buildingTo = 0
		buildEnds = 0
		completed = true
	end

	if now > last then
		advance(level, last, now)
		last = now
	end

	return {
		Level = level,
		Stored = stored,
		LastCalc = last,
		BuildingTo = buildingTo,
		BuildEndsAt = buildEnds,
		Completed = completed,
	}
end

-- Применяет simulateFactory к данным (только на сервере). Возвращает (completed, gained)
function Formulas.settleFactory(data, now: number): (boolean, number)
	local before = data.Factory.Stored or 0
	local result = Formulas.simulateFactory(data, now)
	local f = data.Factory
	f.Level = result.Level
	f.Stored = result.Stored
	f.LastCalc = result.LastCalc
	f.BuildingTo = result.BuildingTo
	f.BuildEndsAt = result.BuildEndsAt
	return result.Completed, math.max(0, result.Stored - before)
end

----------------------------------------------------------------------
-- Ежедневная награда
----------------------------------------------------------------------
-- (доступна?, номер дня серии, сколько ждать)
function Formulas.dailyStatus(data, now: number): (boolean, number, number)
	local daily = data.Daily or {}
	local last = daily.LastClaim or 0
	local since = now - last
	if last > 0 and since < Config.Daily.MinInterval then
		local nextStreak = ((daily.Streak or 0) % #Config.Daily.Mults) + 1
		return false, nextStreak, Config.Daily.MinInterval - since
	end
	local streak = 1
	if last > 0 and since < Config.Daily.StreakWindow then
		streak = ((daily.Streak or 0) % #Config.Daily.Mults) + 1
	end
	return true, streak, 0
end

function Formulas.dailyReward(data, streak: number): number
	return math.floor(Formulas.rewardBase(data) * Config.Daily.Mults[streak])
end

function Formulas.giftReward(data, index: number): number
	local gift = Config.Gifts[index]
	return math.floor(Formulas.rewardBase(data) * gift.Mult)
end

----------------------------------------------------------------------
-- Шансы выпадения мусора
----------------------------------------------------------------------
-- Возвращает список { {Key, Weight} }, общий вес
function Formulas.trashWeights(zoneId: number, luck: number)
	local zone = Config.Zones[zoneId]
	local counts = Config.ZoneRarityCount[zoneId]
	local list = {}
	local total = 0
	for _, key in zone.Trash do
		local def = Config.Trash[key]
		local rarity = Config.Rarities[def.Rarity]
		local weight = rarity.Weight / counts[def.Rarity] * (math.max(1, luck) ^ rarity.LuckExp)
		total += weight
		table.insert(list, { Key = key, Weight = weight })
	end
	return list, total
end

----------------------------------------------------------------------
-- Итоговые характеристики игрока
----------------------------------------------------------------------
function Formulas.getStats(data, now: number, eventId: string?)
	local net = Config.Nets[data.Net] or Config.Nets[1]
	local backpack = Config.Backpacks[data.Backpack] or Config.Backpacks[1]
	local boots = Config.Boots[data.Boots] or Config.Boots[1]

	local range = net.Range
	local cooldown = net.Cooldown
	if Formulas.boostActive(data, "SuperNet", now) then
		range *= 1.5
		cooldown *= 0.6
	end

	local luck = Formulas.luck(data, now, eventId)
	local factoryRate = rateFor(data, data.Factory and data.Factory.Level or 0)
	if Formulas.boostActive(data, "FactoryTurbo", now) then
		factoryRate *= Config.BoostByKey.FactoryTurbo.FactoryMult or 3
	end

	return {
		Range = range,
		Cooldown = cooldown,
		Multi = net.Multi,
		Capacity = backpack.Capacity,
		WalkSpeed = boots.WalkSpeed,
		JumpHeight = boots.JumpHeight,
		CoinMult = Formulas.coinMultiplier(data, now, eventId),
		Luck = luck,
		ShinyChance = math.min(Config.Shiny.MaxChance, Config.Shiny.BaseChance * luck),
		HelperSlots = 1 + (perks(data).HelperSlots or 0),
		HelperSpeed = if Formulas.boostActive(data, "HelpersFast", now) then 2 else 1,
		FactoryRate = factoryRate,
		AutoCollectInterval = cooldown * Config.AutoCollect.CooldownMult,
	}
end

return Formulas
