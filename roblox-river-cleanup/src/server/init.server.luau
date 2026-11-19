--[[
	Чистая Река — точка входа сервера.

	Все системы лежат в папке Services. Сначала у каждой вызывается Init
	(подготовка, постройка карты), потом Start (циклы, подписки на события).
]]

local Players = game:GetService("Players")

-- Персонажей загружаем сами, когда карта построена и данные игрока загружены
Players.CharacterAutoLoads = false

local ORDER = {
	"DataService",
	"NetService",
	"WorldService",
	"EventService",
	"ZoneService",
	"PlayerService",
	"QuestService",
	"TrashService",
	"HelperService",
	"ShopService",
	"FactoryService",
	"BoostService",
	"RewardService",
	"RebirthService",
	"LeaderboardService",
}

local servicesFolder = script:WaitForChild("Services")
local Services = {}

for _, name in ORDER do
	Services[name] = require(servicesFolder:WaitForChild(name))
end

for _, name in ORDER do
	local service = Services[name]
	if service.Init then
		local ok, err = pcall(service.Init, service, Services)
		if not ok then
			warn(string.format("[Чистая Река] Ошибка в %s:Init — %s", name, tostring(err)))
		end
	end
end

for _, name in ORDER do
	local service = Services[name]
	if service.Start then
		task.spawn(function()
			local ok, err = pcall(service.Start, service)
			if not ok then
				warn(string.format("[Чистая Река] Ошибка в %s:Start — %s", name, tostring(err)))
			end
		end)
	end
end

print("[Чистая Река] Сервер запущен ✔")
