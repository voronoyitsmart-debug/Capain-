--[[
	QuestService — задания. У игрока всегда 3 задания; выполнил — забрал
	награду — получил новое. Не нравится задание — можно заменить (раз в 5 минут).
]]

local HttpService = game:GetService("HttpService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local QuestService = {}

local Services
local rng = Random.new()

local KINDS = { "Collect", "CollectType", "CollectRare", "Earn", "Sell", "Helper", "Shiny", "ZoneCollect" }

local function pickTrash(zoneId: number, rarities: { string }): string
	local list = {}
	for _, key in Config.Zones[zoneId].Trash do
		if table.find(rarities, Config.Trash[key].Rarity) then
			table.insert(list, key)
		end
	end
	return list[rng:NextInteger(1, #list)]
end

function QuestService.generate(data, exclude: { [string]: boolean }?)
	local base = Formulas.rewardBase(data)
	local zoneId = data.MaxZone
	local candidates = {}
	for _, kind in KINDS do
		local allowed = not (exclude and exclude[kind])
		if kind == "Helper" and #data.Equipped == 0 then
			allowed = false
		end
		if allowed then
			table.insert(candidates, kind)
		end
	end
	if #candidates == 0 then
		candidates = { "Collect" }
	end
	local kind = candidates[rng:NextInteger(1, #candidates)]

	local target, reward, text, param = 1, base, "", nil
	if kind == "Collect" then
		target = rng:NextInteger(5, 12) * 5
		reward = base * target / 4
		text = string.format("Собери %d %s мусора", target, Format.plural(target, "предмет", "предмета", "предметов"))
	elseif kind == "CollectType" then
		local uncommon = rng:NextNumber() < 0.4
		param = pickTrash(zoneId, if uncommon then { "Uncommon" } else { "Common" })
		target = if uncommon then rng:NextInteger(4, 8) else rng:NextInteger(8, 16)
		reward = base * target * (if uncommon then 1.4 else 0.6)
		text = string.format("Поймай %d × «%s»", target, Config.Trash[param].Name)
	elseif kind == "CollectRare" then
		target = rng:NextInteger(2, 4)
		reward = base * 6 * target
		text = string.format(
			"Поймай %d %s (или ещё круче)",
			target,
			Format.plural(target, "редкий предмет", "редких предмета", "редких предметов")
		)
	elseif kind == "Earn" then
		target = math.floor(base * rng:NextInteger(15, 30))
		reward = base * 8
		text = "Заработай " .. Format.number(target) .. " монет на переработке"
	elseif kind == "Sell" then
		target = rng:NextInteger(3, 6)
		reward = base * 3 * target
		text = string.format("Сдай мусор на переработку %d %s", target, Format.plural(target, "раз", "раза", "раз"))
	elseif kind == "Helper" then
		target = rng:NextInteger(4, 8) * 5
		reward = base * target / 3
		text = string.format(
			"Пусть помощники поймают %d %s",
			target,
			Format.plural(target, "предмет", "предмета", "предметов")
		)
	elseif kind == "Shiny" then
		target = rng:NextInteger(1, 2)
		reward = base * 12 * target
		text = string.format("Найди %d %s ✨", target, Format.plural(target, "сияющий предмет", "сияющих предмета", "сияющих предметов"))
	elseif kind == "ZoneCollect" then
		param = zoneId
		target = rng:NextInteger(6, 10) * 5
		reward = base * target / 3.5
		text = string.format("Собери %d %s в зоне «%s»", target, Format.plural(target, "предмет", "предмета", "предметов"), Config.Zones[zoneId].Name)
	end

	return {
		Id = HttpService:GenerateGUID(false),
		Kind = kind,
		Target = target,
		Progress = 0,
		Reward = math.max(1, math.floor(reward)),
		Text = text,
		Param = param,
		Done = false,
	}
end

local function activeKinds(data, skipId: string?)
	local kinds = {}
	for _, quest in data.Quests do
		if quest.Id ~= skipId then
			kinds[quest.Kind] = true
		end
	end
	return kinds
end

-- Проверяем, что задание ещё выполнимо (после перерождения зоны закрываются)
local function valid(data, quest): boolean
	if type(quest) ~= "table" or type(quest.Id) ~= "string" or type(quest.Target) ~= "number" then
		return false
	end
	if quest.Kind == "CollectType" then
		local def = Config.Trash[quest.Param]
		return def ~= nil and def.Zone <= data.MaxZone
	elseif quest.Kind == "ZoneCollect" then
		return type(quest.Param) == "number" and quest.Param <= data.MaxZone
	end
	return table.find(KINDS, quest.Kind) ~= nil
end

function QuestService.ensure(data)
	local kept = {}
	for _, quest in data.Quests do
		if valid(data, quest) and #kept < Config.Quests.Slots then
			table.insert(kept, quest)
		end
	end
	data.Quests = kept
	while #data.Quests < Config.Quests.Slots do
		table.insert(data.Quests, QuestService.generate(data, activeKinds(data)))
	end
end

function QuestService.reset(data)
	data.Quests = {}
	QuestService.ensure(data)
end

local function progress(player: Player, quest, amount: number)
	if quest.Done or amount <= 0 then
		return
	end
	quest.Progress = math.min(quest.Target, quest.Progress + amount)
	if quest.Progress >= quest.Target then
		quest.Done = true
		Services.NetService.notify(player, "✅ Задание выполнено! Забери награду в меню 📜", "success")
	end
end

function QuestService.onCollect(player: Player, data, key: string, source: string, zoneId: number, shiny: boolean)
	local def = Config.Trash[key]
	local rarityOrder = Config.Rarities[def.Rarity].Order
	for _, quest in data.Quests do
		local kind = quest.Kind
		local matches = kind == "Collect"
			or (kind == "CollectType" and quest.Param == key)
			or (kind == "CollectRare" and rarityOrder >= 3)
			or (kind == "Helper" and source == "helper")
			or (kind == "Shiny" and shiny)
			or (kind == "ZoneCollect" and quest.Param == zoneId)
		if matches then
			progress(player, quest, 1)
		end
	end
end

function QuestService.onSell(player: Player, data, coins: number)
	for _, quest in data.Quests do
		if quest.Kind == "Earn" then
			progress(player, quest, coins)
		elseif quest.Kind == "Sell" then
			progress(player, quest, 1)
		end
	end
end

local function findQuest(data, id: any)
	if type(id) ~= "string" then
		return nil, nil
	end
	for index, quest in data.Quests do
		if quest.Id == id then
			return quest, index
		end
	end
	return nil, nil
end

function QuestService:Init(services)
	Services = services
	-- подписываемся в Init, чтобы не пропустить первых игроков
	Services.DataService.Loaded:Connect(function(player, data)
		QuestService.ensure(data)
		Services.NetService.markDirty(player)
	end)
end

function QuestService:Start()
	local Net = Services.NetService

	Net.on("ClaimQuest", function(_player, data, id)
		local quest, index = findQuest(data, id)
		if not quest or not index then
			return false, "Задание не найдено"
		end
		if not quest.Done then
			return false, "Задание ещё не выполнено"
		end
		data.Coins += quest.Reward
		data.TotalCoins += quest.Reward
		data.QuestsDone += 1
		table.remove(data.Quests, index)
		table.insert(data.Quests, index, QuestService.generate(data, activeKinds(data)))
		return true, "📜 Награда за задание: +" .. Format.number(quest.Reward) .. " 💰"
	end)

	Net.on("RerollQuest", function(_player, data, id)
		local quest, index = findQuest(data, id)
		if not quest or not index then
			return false, "Задание не найдено"
		end
		if quest.Done then
			return false, "Сначала забери награду!"
		end
		local now = os.time()
		if now < (data.QuestRerollAt or 0) then
			return false, "Заменить можно через " .. Format.duration(data.QuestRerollAt - now) .. " ⏳"
		end
		data.QuestRerollAt = now + Config.Quests.RerollCooldown
		local exclude = activeKinds(data)
		exclude[quest.Kind] = true
		data.Quests[index] = QuestService.generate(data, exclude)
		return true, "🔄 Новое задание!"
	end)
end

return QuestService
