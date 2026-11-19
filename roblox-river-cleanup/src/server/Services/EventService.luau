--[[
	EventService — глобальные события сервера: «Мусорный шторм», «Золотой час»,
	«Звездопад удачи». Запускаются сами по таймеру, для всех бесплатно.

	Клиенты узнают о событии через атрибуты ReplicatedStorage: EventId, EventEndsAt.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)

local EventService = {}

local Services
local current: { Key: string, EndsAt: number }? = nil
local rng = Random.new()

function EventService.current(): string?
	if current and os.time() < current.EndsAt then
		return current.Key
	end
	return nil
end

function EventService.def()
	local key = EventService.current()
	return key and Config.EventByKey[key] or nil
end

function EventService.start(key: string)
	local def = Config.EventByKey[key]
	if not def then
		return
	end
	current = { Key = key, EndsAt = os.time() + def.Duration }
	ReplicatedStorage:SetAttribute("EventId", key)
	ReplicatedStorage:SetAttribute("EventEndsAt", current.EndsAt)
	Services.NetService.notifyAll(string.format("%s %s! %s", def.Icon, def.Name, def.Desc), "event")
	for _, player in Services.DataService.players() do
		Services.NetService.markDirty(player)
	end
end

function EventService.stop()
	if current then
		local def = Config.EventByKey[current.Key]
		current = nil
		ReplicatedStorage:SetAttribute("EventId", "")
		ReplicatedStorage:SetAttribute("EventEndsAt", 0)
		if def then
			Services.NetService.notifyAll(def.Icon .. " Событие «" .. def.Name .. "» закончилось. Следующее — скоро!", "info")
		end
	end
end

function EventService:Init(services)
	Services = services
	ReplicatedStorage:SetAttribute("EventId", "")
	ReplicatedStorage:SetAttribute("EventEndsAt", 0)
	ReplicatedStorage:SetAttribute("NextEventAt", os.time() + Config.Events.FirstDelay)
end

function EventService:Start()
	task.wait(Config.Events.FirstDelay)
	local list = Config.Events.List
	local last = nil
	while true do
		local def
		repeat
			def = list[rng:NextInteger(1, #list)]
		until def.Key ~= last or #list == 1
		last = def.Key
		EventService.start(def.Key)
		task.wait(def.Duration)
		EventService.stop()
		local pause = rng:NextInteger(Config.Events.Interval[1], Config.Events.Interval[2])
		ReplicatedStorage:SetAttribute("NextEventAt", os.time() + pause)
		task.wait(pause)
	end
end

return EventService
