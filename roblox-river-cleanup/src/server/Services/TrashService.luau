--[[
	TrashService — сердце игры.

	• Мусор появляется у труб плотины и плывёт по течению (или застревает у берега).
	• Позиция считается формулой от времени — сервер и клиенты видят одно и то же.
	• Вылов: клиент присылает Id предмета, сервер проверяет дальность сачка,
	  перезарядку, открыта ли зона и есть ли место в рюкзаке.
	• Продажа: площадка ♻️ на базе каждой зоны (или перк «Продажа где угодно»).
	• Авто-сбор (перк), авто-продажа (перк).
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)
local Remotes = require(Shared.Remotes)
local RiverMath = require(Shared.RiverMath)
local TrashModels = require(Shared.TrashModels)
local Util = require(Shared.Util)

local TrashService = {}

local W = Config.World
local Services
local folder: Folder
local rng = Random.new()

type Rec = {
	Id: number,
	Key: string,
	Zone: number,
	Origin: Vector3,
	Vel: Vector3,
	T0: number,
	Seed: number,
	Expire: number,
	Model: Model?,
}

local active: { [number]: Rec } = {}
local zoneRecs: { [number]: { [number]: Rec } } = {}
local zoneCounts: { [number]: number } = {}
local nextSpawn: { [number]: number } = {}
local zoneActive: { [number]: boolean } = {}
local nextId = 0

local lastCollect: { [Player]: number } = {}
local nextAuto: { [Player]: number } = {}
local lastFullWarn: { [Player]: number } = {}
local padDebounce: { [Player]: number } = {}

local function serverNow(): number
	return workspace:GetServerTimeNow()
end

local function rootOf(player: Player): BasePart?
	local character = player.Character
	return character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
end

local function statsFor(data)
	return Formulas.getStats(data, os.time(), Services.EventService.current())
end

function TrashService.position(rec: Rec, t: number): Vector3
	return RiverMath.trashPosition(rec.Origin, rec.Vel, rec.T0, rec.Seed, t)
end

function TrashService.count(zoneId: number): number
	return zoneCounts[zoneId] or 0
end

local function removeRecord(rec: Rec)
	if not active[rec.Id] then
		return
	end
	active[rec.Id] = nil
	zoneRecs[rec.Zone][rec.Id] = nil
	zoneCounts[rec.Zone] -= 1
	if rec.Model then
		rec.Model:Destroy()
		rec.Model = nil
	end
end

----------------------------------------------------------------------
-- Появление мусора
----------------------------------------------------------------------
local function pickType(zoneId: number, luck: number): string
	local list, total = Formulas.trashWeights(zoneId, luck)
	local roll = rng:NextNumber() * total
	for _, entry in list do
		roll -= entry.Weight
		if roll <= 0 then
			return entry.Key
		end
	end
	return list[#list].Key
end

local function spawnTrash(zoneId: number, t: number, luck: number, prefill: boolean?)
	local zone = Config.Zones[zoneId]
	local key = pickType(zoneId, luck)
	local rz = RiverMath.riverZ(zoneId)
	local half = W.RiverWidth / 2
	local seed = rng:NextNumber(0, 100)

	local origin, vel, t0, expire
	if rng:NextNumber() < Config.Spawning.StuckChance then
		-- застрял у берега: не уплывает, но через пару минут тонет
		local side = if rng:NextNumber() < 0.5 then -1 else 1
		local z = rz + side * (half - rng:NextNumber(1.5, 6))
		local x = rng:NextNumber(W.RiverStartX + 12, W.RiverEndX - 12)
		origin = Vector3.new(x, W.WaterY, z)
		vel = Vector3.zero
		t0 = t
		expire = t + rng:NextNumber(Config.Spawning.StuckLife[1], Config.Spawning.StuckLife[2])
	else
		local z = rz + rng:NextNumber(-half + 3, half - 3)
		local speed = rng:NextNumber(zone.FlowSpeed[1], zone.FlowSpeed[2])
		local lifetime = RiverMath.flowLifetime(speed)
		origin = Vector3.new(W.RiverStartX, W.WaterY, z)
		vel = Vector3.new(speed, 0, 0)
		t0 = if prefill then t - rng:NextNumber(0, lifetime * 0.9) else t
		expire = t0 + lifetime
	end

	nextId += 1
	local id = nextId
	local model = TrashModels.build(key)
	TrashModels.decorate(model, key)
	model.Name = "T" .. id
	local cf = RiverMath.trashCFrame(origin, vel, t0, seed, t)
	model:PivotTo(cf)
	model:SetAttribute("Id", id)
	model:SetAttribute("Type", key)
	model:SetAttribute("Zone", zoneId)
	model:SetAttribute("T0", t0)
	model:SetAttribute("Origin", origin)
	model:SetAttribute("Vel", vel)
	model:SetAttribute("Seed", seed)
	model:SetAttribute("Pivot0", cf)
	model.Parent = folder

	local rec: Rec = {
		Id = id,
		Key = key,
		Zone = zoneId,
		Origin = origin,
		Vel = vel,
		T0 = t0,
		Seed = seed,
		Expire = expire,
		Model = model,
	}
	active[id] = rec
	zoneRecs[zoneId][id] = rec
	zoneCounts[zoneId] += 1
end

-- Удача зоны: лучшая удача среди игроков в ней (немного ослабленная) + событие
local function zoneLuck(players: { Player }): number
	local best = 1
	for _, player in players do
		local data = Services.DataService.get(player)
		if data then
			best = math.max(best, Formulas.luck(data, os.time(), nil))
		end
	end
	local luck = best ^ 0.5
	local event = Services.EventService.def()
	if event and event.LuckMult then
		luck *= event.LuckMult
	end
	return luck
end

----------------------------------------------------------------------
-- Поиск и вылов
----------------------------------------------------------------------
function TrashService.findNearest(zoneId: number, pos: Vector3, range: number, exclude: { [Rec]: boolean }?): (Rec?, number)
	local best: Rec? = nil
	local bestDist = range
	local recs = zoneRecs[zoneId]
	if not recs then
		return nil, math.huge
	end
	local t = serverNow()
	for _, rec in recs do
		if not (exclude and exclude[rec]) then
			local d = Util.flatDistance(TrashService.position(rec, t), pos)
			if d <= bestDist then
				best = rec
				bestDist = d
			end
		end
	end
	return best, bestDist
end

local function warnFull(player: Player, data)
	local now = os.clock()
	if now - (lastFullWarn[player] or 0) < 3 then
		return
	end
	lastFullWarn[player] = now
	local text = "🎒 Рюкзак полон! Неси мусор на ♻️ переработку"
	if (data.Perks.SellAnywhere or 0) > 0 then
		text = "🎒 Рюкзак полон! Нажми «Продать» ♻️"
	end
	Services.NetService.notify(player, text, "error")
end

-- Положить предмет в рюкзак. source: "click" | "auto" | "helper"
function TrashService.collect(player: Player, data, rec: Rec, source: string, helperIndex: number?): (boolean, string?)
	if not active[rec.Id] then
		return false, "gone"
	end
	local def = Config.Trash[rec.Key]
	local stats = statsFor(data)

	if data.InvSize + def.Size > stats.Capacity then
		if (data.Perks.AutoSell or 0) > 0 and data.Settings.AutoSell then
			TrashService.sell(player, data, "auto")
		end
		if data.InvSize + def.Size > stats.Capacity then
			return false, "full"
		end
	end

	local t = serverNow()
	local pos = TrashService.position(rec, t)
	removeRecord(rec)

	local shiny = rng:NextNumber() < stats.ShinyChance
	local value = def.Value * (if shiny then Config.Shiny.ValueMult else 1)

	data.Inventory[rec.Key] = (data.Inventory[rec.Key] or 0) + 1
	data.InvSize += def.Size
	data.InvValue += value
	data.Stats.TrashCollected += 1
	data.Tutorial.Collected = true
	if shiny then
		data.Stats.Shiny += 1
	end
	if source == "helper" then
		data.Stats.HelperCollected += 1
	end

	local Net = Services.NetService
	local rarity = Config.Rarities[def.Rarity]
	if not data.Discovered[rec.Key] then
		data.Discovered[rec.Key] = true
		Net.notify(
			player,
			string.format("📖 Новое в коллекции: %s (+%s к монетам навсегда)", def.Name, Format.percent(Config.Collection.BonusPerItem)),
			"info"
		)
	end
	if def.Rarity == "Legendary" then
		data.Stats.Legendary += 1
		Net.notifyAll(string.format("🌟 %s: легендарная находка — %s!", player.DisplayName, def.Name), "legendary")
	elseif rarity.Order == 4 then
		Net.notify(player, "💜 Эпическая находка: " .. def.Name .. "!", "info")
	end
	if shiny then
		Net.notify(player, string.format("✨ Сияющий «%s»! Стоит в %d раз дороже", def.Name, Config.Shiny.ValueMult), "success")
	end

	Services.QuestService.onCollect(player, data, rec.Key, source, rec.Zone, shiny)
	Net.effectAll("collect", player.UserId, rec.Key, pos, shiny, helperIndex or 0)
	Net.markDirty(player)
	return true, nil
end

-- Продать весь рюкзак. Возвращает полученные монеты
function TrashService.sell(player: Player, data, source: string): number
	if data.InvSize <= 0 or data.InvValue <= 0 then
		data.Inventory = {}
		data.InvSize = 0
		data.InvValue = 0
		return 0
	end
	local mult = Formulas.coinMultiplier(data, os.time(), Services.EventService.current())
	local coins = math.max(1, math.floor(data.InvValue * mult + 0.5))
	local items = 0
	for _, count in data.Inventory do
		items += count
	end

	data.Coins += coins
	data.TotalCoins += coins
	data.Inventory = {}
	data.InvSize = 0
	data.InvValue = 0
	data.Stats.Sells += 1
	data.Stats.BestSell = math.max(data.Stats.BestSell or 0, coins)
	data.Tutorial.Sold = true

	Services.QuestService.onSell(player, data, coins)
	Services.NetService.effect(player, "sell", coins, items, source)
	Services.NetService.markDirty(player)
	return coins
end

local function nearSellPad(player: Player): boolean
	local root = rootOf(player)
	if not root then
		return false
	end
	local zone = RiverMath.zoneFromZ(root.Position.Z)
	local pad = RiverMath.sellPadPosition(zone)
	return Util.flatDistance(root.Position, pad) <= 9 and math.abs(root.Position.Y - pad.Y) < 8
end

----------------------------------------------------------------------
-- Запуск
----------------------------------------------------------------------
local function onClick(player: Player, id: any)
	if type(id) ~= "number" then
		return
	end
	local data = Services.DataService.get(player)
	local rec = active[id]
	local root = rootOf(player)
	if not data or not rec or not root then
		return
	end
	if rec.Zone > data.MaxZone then
		return
	end

	local stats = statsFor(data)
	local t = serverNow()
	if t - (lastCollect[player] or 0) < stats.Cooldown * 0.75 then
		return
	end
	local pos = TrashService.position(rec, t)
	local reach = stats.Range + 6 + root.AssemblyLinearVelocity.Magnitude * 0.25
	if Util.flatDistance(root.Position, pos) > reach then
		return
	end
	lastCollect[player] = t

	local targets = { rec }
	if stats.Multi > 1 then
		local others = {}
		for _, other in zoneRecs[rec.Zone] do
			if other ~= rec then
				local op = TrashService.position(other, t)
				local d = Util.flatDistance(op, pos)
				if d <= 10 and Util.flatDistance(op, root.Position) <= reach then
					table.insert(others, { rec = other, d = d })
				end
			end
		end
		table.sort(others, function(a, b)
			return a.d < b.d
		end)
		for i = 1, math.min(#others, stats.Multi - 1) do
			table.insert(targets, others[i].rec)
		end
	end

	for _, target in targets do
		local ok, reason = TrashService.collect(player, data, target, "click")
		if not ok then
			if reason == "full" then
				warnFull(player, data)
			end
			break
		end
	end
end

local function hookSellPad(pad: BasePart)
	pad.Touched:Connect(function(hit)
		local character = hit:FindFirstAncestorOfClass("Model")
		local player = character and Players:GetPlayerFromCharacter(character)
		if not player then
			return
		end
		local now = os.clock()
		if now - (padDebounce[player] or 0) < 1 then
			return
		end
		padDebounce[player] = now
		local data = Services.DataService.get(player)
		if data and data.InvSize > 0 then
			TrashService.sell(player, data, "pad")
		end
	end)
end

function TrashService:Init(services)
	Services = services
	for zoneId in Config.Zones do
		zoneRecs[zoneId] = {}
		zoneCounts[zoneId] = 0
		nextSpawn[zoneId] = 0
	end
	local old = workspace:FindFirstChild("Trash")
	if old then
		old:Destroy()
	end
	folder = Instance.new("Folder")
	folder.Name = "Trash"
	folder.Parent = workspace
end

function TrashService:Start()
	local Net = Services.NetService

	Remotes.get("Collect").OnServerEvent:Connect(onClick)

	Net.on("SellAll", function(player, data)
		if data.InvSize <= 0 then
			return false, "Рюкзак пуст — сначала налови мусора 🎣"
		end
		if (data.Perks.SellAnywhere or 0) <= 0 and not nearSellPad(player) then
			return false, "Подойди к ♻️ переработке или купи перк «Продажа где угодно»"
		end
		TrashService.sell(player, data, "button")
		return true
	end)

	for _, pad in Services.WorldService.folder("SellPads"):GetDescendants() do
		if pad:IsA("BasePart") and pad:GetAttribute("SellPad") then
			hookSellPad(pad)
		end
	end

	Players.PlayerRemoving:Connect(function(player)
		lastCollect[player] = nil
		nextAuto[player] = nil
		lastFullWarn[player] = nil
		padDebounce[player] = nil
	end)

	-- сразу немного мусора, чтобы река не была пустой
	local t0 = serverNow()
	for zoneId in Config.Zones do
		for _ = 1, Config.Spawning.PrefillCount do
			spawnTrash(zoneId, t0, 1, true)
		end
	end

	local lastPollution = 0
	local lastPadCheck = 0
	while true do
		task.wait(0.1)
		local t = serverNow()
		local event = Services.EventService.def()
		local spawnMult = event and event.SpawnMult or 1
		local maxMult = event and event.MaxMult or 1

		-- появление и исчезновение
		for zoneId, zone in Config.Zones do
			for _, rec in zoneRecs[zoneId] do
				if t >= rec.Expire then
					removeRecord(rec)
				end
			end
			local present = #Services.ZoneService.playersIn(zoneId) > 0
			if present and not zoneActive[zoneId] then
				-- в пустую зону пришёл игрок: сразу оживляем реку,
				-- мусор раскидан по всей длине (а не только у труб)
				local players = Services.ZoneService.playersIn(zoneId)
				local target = math.floor(zone.MaxTrash * Config.Spawning.ArrivalFill)
				local luck = zoneLuck(players)
				for _ = 1, math.max(0, target - zoneCounts[zoneId]) do
					spawnTrash(zoneId, t, luck, true)
				end
			end
			zoneActive[zoneId] = present
			if t >= nextSpawn[zoneId] then
				local players = Services.ZoneService.playersIn(zoneId)
				local max = if #players > 0 then math.floor(zone.MaxTrash * maxMult) else Config.Spawning.IdleMax
				if zoneCounts[zoneId] < max then
					spawnTrash(zoneId, t, zoneLuck(players))
				end
				local speedup = 1 + Config.Spawning.PlayerSpawnBonus * math.max(0, #players - 1)
				local interval = zone.SpawnInterval / speedup / spawnMult
				if #players == 0 then
					interval *= 3
				end
				nextSpawn[zoneId] = t + interval * rng:NextNumber(0.7, 1.3)
			end
		end

		-- авто-сбор
		for _, player in Players:GetPlayers() do
			local data = Services.DataService.get(player)
			if data and (data.Perks.AutoCollect or 0) > 0 and data.Settings.AutoCollect and t >= (nextAuto[player] or 0) then
				local root = rootOf(player)
				local zone = Services.ZoneService.zoneOf(player)
				if root and zone <= data.MaxZone then
					local stats = statsFor(data)
					local rec = TrashService.findNearest(zone, root.Position, stats.Range)
					if rec then
						local ok, reason = TrashService.collect(player, data, rec, "auto")
						if not ok and reason == "full" then
							warnFull(player, data)
							nextAuto[player] = t + 2
						else
							nextAuto[player] = t + stats.AutoCollectInterval
						end
					else
						nextAuto[player] = t + 0.3
					end
				end
			end
		end

		-- стоишь на площадке — продаём (Touched срабатывает только при касании)
		if t - lastPadCheck > 1 then
			lastPadCheck = t
			for _, player in Players:GetPlayers() do
				local data = Services.DataService.get(player)
				if data and data.InvSize > 0 and nearSellPad(player) then
					TrashService.sell(player, data, "pad")
				end
			end
		end

		-- загрязнение реки (для цвета воды у клиентов)
		if t - lastPollution > 2 then
			lastPollution = t
			for zoneId, zone in Config.Zones do
				ReplicatedStorage:SetAttribute("Pollution" .. zoneId, math.clamp(zoneCounts[zoneId] / zone.MaxTrash, 0, 1))
			end
		end
	end
end

return TrashService
