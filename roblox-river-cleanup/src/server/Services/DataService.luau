--[[
	DataService — загрузка и сохранение прогресса игроков (DataStoreService).

	• Защита от одновременной игры на двух серверах (блокировка сессии).
	• Повторные попытки при ошибках, автосохранение, сохранение при выходе
	  и при выключении сервера.
	• В Studio без доступа к API игра работает, но прогресс не сохраняется.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Signal = require(Shared.Signal)
local Util = require(Shared.Util)

local DataService = {}
DataService.Loaded = Signal.new() -- (player, data, info)

local LOCK_FRESH = 300 -- блокировка считается живой 5 минут
local profiles: { [Player]: any } = {}
local beforeSave: { (Player, any) -> () } = {}
local store: DataStore? = nil
local storeError: string? = nil

local function keyFor(player: Player): string
	return "Player_" .. player.UserId
end

function DataService.template()
	local now = os.time()
	return {
		Version = 1,
		Coins = 0,
		TotalCoins = 0,
		Net = 1,
		Backpack = 1,
		Boots = 1,
		MaxZone = 1,
		LastZone = 1,
		Inventory = {},
		InvSize = 0,
		InvValue = 0,
		Perks = {},
		HelpersOwned = {},
		Equipped = {},
		Factory = { Level = 0, Stored = 0, LastCalc = now, BuildingTo = 0, BuildEndsAt = 0 },
		Rebirths = 0,
		Discovered = {},
		Boosts = {},
		Daily = { Streak = 0, LastClaim = 0 },
		Quests = {},
		QuestsDone = 0,
		QuestRerollAt = 0,
		Settings = {
			AutoCollect = true,
			AutoSell = true,
			WaterWalk = true,
			ShowRange = true,
			Sounds = true,
			Music = true,
			Effects = true,
		},
		Stats = {
			TrashCollected = 0,
			Legendary = 0,
			Shiny = 0,
			Sells = 0,
			HelperCollected = 0,
			PlayTime = 0,
			BestSell = 0,
		},
		Tutorial = { Collected = false, Sold = false, Bought = false },
		FirstJoin = now,
		LastOnline = now,
	}
end

-- Чиним данные: значения в допустимых границах, мусорные ключи удаляем
function DataService.sanitize(data)
	data.Net = math.clamp(math.floor(tonumber(data.Net) or 1), 1, #Config.Nets)
	data.Backpack = math.clamp(math.floor(tonumber(data.Backpack) or 1), 1, #Config.Backpacks)
	data.Boots = math.clamp(math.floor(tonumber(data.Boots) or 1), 1, #Config.Boots)
	data.MaxZone = math.clamp(math.floor(tonumber(data.MaxZone) or 1), 1, #Config.Zones)
	data.LastZone = math.clamp(math.floor(tonumber(data.LastZone) or 1), 1, data.MaxZone)
	data.Coins = math.max(0, tonumber(data.Coins) or 0)
	data.Rebirths = math.max(0, math.floor(tonumber(data.Rebirths) or 0))

	for key, level in data.Perks do
		local def = Config.Perks[key]
		if not def then
			data.Perks[key] = nil
		else
			data.Perks[key] = math.clamp(math.floor(tonumber(level) or 0), 0, def.MaxLevel)
		end
	end

	for key in data.HelpersOwned do
		if not Config.HelperByKey[key] then
			data.HelpersOwned[key] = nil
		end
	end
	local equipped = {}
	local slots = 1 + (data.Perks.HelperSlots or 0)
	for _, key in data.Equipped do
		if data.HelpersOwned[key] and not table.find(equipped, key) and #equipped < slots then
			table.insert(equipped, key)
		end
	end
	data.Equipped = equipped

	-- инвентарь: пересчитываем занятое место
	local size = 0
	for key, count in data.Inventory do
		local def = Config.Trash[key]
		if not def or type(count) ~= "number" or count <= 0 then
			data.Inventory[key] = nil
		else
			size += def.Size * count
		end
	end
	data.InvSize = size
	if size == 0 then
		data.InvValue = 0
	end

	for key in data.Boosts do
		if not Config.BoostByKey[key] then
			data.Boosts[key] = nil
		end
	end

	local f = data.Factory
	f.Level = math.clamp(math.floor(tonumber(f.Level) or 0), 0, Config.Factory.MaxLevel)
	f.BuildingTo = math.clamp(math.floor(tonumber(f.BuildingTo) or 0), 0, Config.Factory.MaxLevel)
	if f.BuildingTo ~= 0 and f.BuildingTo ~= f.Level + 1 then
		f.BuildingTo = 0
		f.BuildEndsAt = 0
	end
	f.Stored = math.max(0, tonumber(f.Stored) or 0)
	f.LastCalc = math.min(tonumber(f.LastCalc) or os.time(), os.time())

	for key, value in data.Settings do
		if Config.SettingKeys[key] == nil or type(value) ~= "boolean" then
			data.Settings[key] = nil
		end
	end
	Util.reconcile(data.Settings, DataService.template().Settings)
end

----------------------------------------------------------------------
-- Хранилище
----------------------------------------------------------------------
local function openStore()
	local ok, result = pcall(function()
		return DataStoreService:GetDataStore(Config.DataStoreName)
	end)
	if ok then
		store = result
	else
		storeError = tostring(result)
		warn("[Данные] Не удалось открыть DataStore:", storeError)
	end
end

local function loadRaw(player: Player): (boolean, any, string?)
	if not store then
		return false, nil, storeError or "DataStore недоступен"
	end
	local key = keyFor(player)
	local lastError = "неизвестная ошибка"
	for attempt = 1, 6 do
		local lockedByOther = false
		local ok, result = pcall(function()
			return (store :: DataStore):UpdateAsync(key, function(old)
				local now = os.time()
				if type(old) == "table" and type(old.Lock) == "table" then
					local lock = old.Lock
					local fresh = now - (tonumber(lock.Time) or 0) < LOCK_FRESH
					-- другой сервер держит сохранение: ждём, на последних попытках забираем
					if lock.JobId ~= game.JobId and fresh and attempt < 5 then
						lockedByOther = true
						return nil
					end
				end
				local wrapper = if type(old) == "table" then old else {}
				wrapper.Lock = { JobId = game.JobId, Time = now }
				return wrapper
			end)
		end)
		if ok and not lockedByOther then
			local data = if type(result) == "table" then result.Data else nil
			return true, data, nil
		end
		if not ok then
			lastError = tostring(result)
			if RunService:IsStudio() then
				break
			end
			task.wait(1.5 * attempt)
		else
			lastError = "сохранение занято другим сервером"
			task.wait(4)
		end
		if not player.Parent then
			break
		end
	end
	return false, nil, lastError
end

function DataService.save(player: Player, release: boolean?): boolean
	local profile = profiles[player]
	if not profile or not profile.CanSave or not store then
		return false
	end
	for _, hook in beforeSave do
		local ok, err = pcall(hook, player, profile.Data)
		if not ok then
			warn("[Данные] Ошибка перед сохранением:", err)
		end
	end
	local data = profile.Data
	data.LastOnline = os.time()

	local ok, err = pcall(function()
		(store :: DataStore):UpdateAsync(profile.Key, function(old)
			if type(old) == "table" and type(old.Lock) == "table" then
				local lock = old.Lock
				local fresh = os.time() - (tonumber(lock.Time) or 0) < LOCK_FRESH
				if lock.JobId ~= game.JobId and fresh then
					-- сохранение забрал другой сервер — не затираем его данные
					return nil
				end
			end
			return {
				Data = data,
				Lock = if release then nil else { JobId = game.JobId, Time = os.time() },
				SavedAt = os.time(),
			}
		end)
	end)
	if not ok then
		warn("[Данные] Ошибка сохранения для " .. player.Name .. ":", err)
	end
	profile.LastSave = os.clock()
	return ok
end

----------------------------------------------------------------------
-- Публичное API
----------------------------------------------------------------------
function DataService.get(player: Player)
	local profile = profiles[player]
	return profile and profile.Data or nil
end

function DataService.canSave(player: Player): boolean
	local profile = profiles[player]
	return profile ~= nil and profile.CanSave
end

function DataService.isNew(player: Player): boolean
	local profile = profiles[player]
	return profile ~= nil and profile.IsNew
end

function DataService.addBeforeSave(fn: (Player, any) -> ())
	table.insert(beforeSave, fn)
end

function DataService.players(): { Player }
	local list = {}
	for player in profiles do
		if player.Parent then
			table.insert(list, player)
		end
	end
	return list
end

local function onPlayerAdded(player: Player)
	local ok, raw, err = loadRaw(player)
	if not player.Parent then
		return
	end

	local canSave = ok
	if not ok then
		if RunService:IsStudio() then
			warn(
				"[Данные] Сохранения не работают в Studio. Чтобы включить: Home → Game Settings → Security → "
					.. "Enable Studio Access to API Services (нужно сначала опубликовать игру). Ошибка: "
					.. tostring(err)
			)
		else
			player:Kick("Не удалось загрузить сохранение 😢 Перезайди через минуту. (" .. tostring(err) .. ")")
			return
		end
	end

	local isNew = raw == nil
	local data = if type(raw) == "table" then raw else DataService.template()
	Util.reconcile(data, DataService.template())
	DataService.sanitize(data)

	profiles[player] = {
		Data = data,
		CanSave = canSave,
		Key = keyFor(player),
		IsNew = isNew,
		LastSave = os.clock(),
	}

	DataService.Loaded:Fire(player, data, { IsNew = isNew, CanSave = canSave })
end

local function onPlayerRemoving(player: Player)
	if profiles[player] then
		DataService.save(player, true)
		profiles[player] = nil
	end
end

function DataService:Init()
	openStore()
end

function DataService:Start()
	Players.PlayerAdded:Connect(onPlayerAdded)
	Players.PlayerRemoving:Connect(onPlayerRemoving)
	for _, player in Players:GetPlayers() do
		task.spawn(onPlayerAdded, player)
	end

	game:BindToClose(function()
		local pending = 0
		for player in profiles do
			pending += 1
			task.spawn(function()
				DataService.save(player, true)
				pending -= 1
			end)
		end
		local started = os.clock()
		while pending > 0 and os.clock() - started < 25 do
			task.wait(0.1)
		end
	end)

	-- автосохранение
	while true do
		task.wait(Config.AutoSaveInterval)
		for player, profile in profiles do
			if player.Parent and profile.CanSave then
				task.spawn(DataService.save, player, false)
				task.wait(0.5)
			end
		end
	end
end

return DataService
