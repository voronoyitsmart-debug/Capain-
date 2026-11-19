--[[
	HelperService — помощники. Покупаются за монеты один раз навсегда,
	надеваются в слоты и сами ловят ближайший мусор рядом с хозяином.
	Модели помощников рисует клиент (по атрибуту игрока "Helpers").
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local HelperService = {}

local Services
local timers: { [Player]: { [number]: number } } = {}

function HelperService.refresh(player: Player, data)
	player:SetAttribute("Helpers", table.concat(data.Equipped, ","))
end

local function slotsOf(data): number
	return 1 + (data.Perks.HelperSlots or 0)
end

function HelperService:Init(services)
	Services = services
	Services.DataService.Loaded:Connect(function(player, data)
		HelperService.refresh(player, data)
	end)
end

function HelperService:Start()
	local Net = Services.NetService

	Net.on("BuyHelper", function(player, data, key)
		local def = type(key) == "string" and Config.HelperByKey[key]
		if not def then
			return false
		end
		if data.HelpersOwned[key] then
			return false, "Этот помощник у тебя уже есть"
		end
		if data.Coins < def.Cost then
			return false, "Не хватает " .. Format.number(def.Cost - data.Coins) .. " 💰"
		end
		data.Coins -= def.Cost
		data.HelpersOwned[key] = true
		data.Tutorial.Bought = true
		if #data.Equipped < slotsOf(data) then
			table.insert(data.Equipped, key)
		end
		HelperService.refresh(player, data)
		return true, "🐾 Новый помощник: " .. def.Name .. "!"
	end)

	Net.on("EquipHelper", function(player, data, key)
		local def = type(key) == "string" and Config.HelperByKey[key]
		if not def or not data.HelpersOwned[key] then
			return false
		end
		if table.find(data.Equipped, key) then
			return false, "Уже помогает тебе"
		end
		if #data.Equipped >= slotsOf(data) then
			return false, "Все слоты заняты — сними помощника или купи слот во вкладке «Перки»"
		end
		table.insert(data.Equipped, key)
		HelperService.refresh(player, data)
		return true
	end)

	Net.on("UnequipHelper", function(player, data, key)
		local index = type(key) == "string" and table.find(data.Equipped, key)
		if not index then
			return false
		end
		table.remove(data.Equipped, index)
		HelperService.refresh(player, data)
		timers[player] = nil
		return true
	end)

	Players.PlayerRemoving:Connect(function(player)
		timers[player] = nil
	end)

	while true do
		task.wait(0.1)
		local t = workspace:GetServerTimeNow()
		for _, player in Players:GetPlayers() do
			local data = Services.DataService.get(player)
			local character = player.Character
			local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
			if data and root and #data.Equipped > 0 then
				local zone = Services.ZoneService.zoneOf(player)
				if zone <= data.MaxZone then
					local stats = Formulas.getStats(data, os.time(), Services.EventService.current())
					local mine = timers[player]
					if not mine then
						mine = {}
						timers[player] = mine
					end
					for index, key in data.Equipped do
						if index > stats.HelperSlots then
							break
						end
						local def = Config.HelperByKey[key]
						if def and t >= (mine[index] or 0) then
							local rec = Services.TrashService.findNearest(zone, root.Position, def.Range)
							if rec then
								local ok, reason = Services.TrashService.collect(player, data, rec, "helper", index)
								if not ok and reason == "full" then
									mine[index] = t + 2
								else
									mine[index] = t + def.Interval / stats.HelperSpeed
								end
							else
								mine[index] = t + 0.5
							end
						end
					end
				end
			end
		end
	end
end

return HelperService
