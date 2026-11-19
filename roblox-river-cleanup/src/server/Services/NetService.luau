--[[
	NetService — связь с клиентами.

	• NetService.on("Действие", function(player, data, ...) return ok, "сообщение" end)
	• Защита от спама запросами.
	• Рассылка свежих данных игроку (не чаще 4 раз в секунду — бережём трафик).
	• Уведомления: NetService.notify(player, "текст", "success" | "error" | "info" | "legendary")
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Remotes = require(Shared.Remotes)

local NetService = {}

local Services
local handlers: { [string]: (Player, any, ...any) -> (boolean?, string?) } = {}
local dirty: { [Player]: boolean } = {}
local buckets: { [Player]: { tokens: number, last: number } } = {}
local metaProviders: { (Player, { [string]: any }) -> () } = {}

local BUCKET_SIZE = 25
local BUCKET_REFILL = 12 -- запросов в секунду

local RequestRemote = Remotes.get("Request")
local StateRemote = Remotes.get("State")
local NotifyRemote = Remotes.get("Notify")
local EffectRemote = Remotes.get("Effect")

local function allow(player: Player): boolean
	local now = os.clock()
	local bucket = buckets[player]
	if not bucket then
		bucket = { tokens = BUCKET_SIZE, last = now }
		buckets[player] = bucket
	end
	bucket.tokens = math.min(BUCKET_SIZE, bucket.tokens + (now - bucket.last) * BUCKET_REFILL)
	bucket.last = now
	if bucket.tokens < 1 then
		return false
	end
	bucket.tokens -= 1
	return true
end

function NetService.on(action: string, handler)
	handlers[action] = handler
end

function NetService.addMeta(provider: (Player, { [string]: any }) -> ())
	table.insert(metaProviders, provider)
end

function NetService.markDirty(player: Player)
	dirty[player] = true
end

function NetService.notify(player: Player, text: string, kind: string?)
	if player.Parent then
		NotifyRemote:FireClient(player, text, kind or "info")
	end
end

function NetService.notifyAll(text: string, kind: string?)
	NotifyRemote:FireAllClients(text, kind or "info")
end

function NetService.effectAll(...)
	EffectRemote:FireAllClients(...)
end

function NetService.effect(player: Player, ...)
	if player.Parent then
		EffectRemote:FireClient(player, ...)
	end
end

function NetService.push(player: Player)
	local data = Services.DataService.get(player)
	if not data or not player.Parent then
		return
	end
	local meta = { ServerTime = os.time() }
	for _, provider in metaProviders do
		local ok, err = pcall(provider, player, meta)
		if not ok then
			warn("[Сеть] meta:", err)
		end
	end
	StateRemote:FireClient(player, data, meta)
end

function NetService:Init(services)
	Services = services
end

function NetService:Start()
	RequestRemote.OnServerInvoke = function(player: Player, action: any, ...)
		if type(action) ~= "string" then
			return { ok = false }
		end
		if not allow(player) then
			return { ok = false, msg = "Слишком быстро! Подожди секунду." }
		end
		local data = Services.DataService.get(player)
		if not data then
			return { ok = false, msg = "Данные ещё загружаются…" }
		end
		local handler = handlers[action]
		if not handler then
			return { ok = false, msg = "Неизвестное действие" }
		end
		local ok, result, msg = pcall(handler, player, data, ...)
		if not ok then
			warn(string.format("[Сеть] Ошибка в «%s»: %s", action, tostring(result)))
			return { ok = false, msg = "Ошибка на сервере, попробуй ещё раз" }
		end
		NetService.markDirty(player)
		return { ok = result ~= false, msg = msg }
	end

	-- клиент просит прислать данные (например, после перезапуска скрипта)
	NetService.on("Sync", function()
		return true
	end)

	Players.PlayerRemoving:Connect(function(player)
		dirty[player] = nil
		buckets[player] = nil
	end)

	while true do
		task.wait(0.25)
		for player in dirty do
			dirty[player] = nil
			if player.Parent then
				NetService.push(player)
			end
		end
	end
end

return NetService
