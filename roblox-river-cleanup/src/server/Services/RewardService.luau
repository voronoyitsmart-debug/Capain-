--[[
	RewardService — бесплатные награды:
	• ежедневная награда (серия из 7 дней, на 7-й день все бусты перезаряжаются);
	• подарки за время в игре (3, 8, 15, 25, 40, 60 минут за заход).
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)

local RewardService = {}

local Services
local claimedGifts: { [Player]: { [number]: boolean } } = {}

function RewardService:Init(services)
	Services = services
	Services.DataService.Loaded:Connect(function(player, data)
		claimedGifts[player] = {}
		local available = Formulas.dailyStatus(data, os.time())
		if available then
			task.delay(6, function()
				Services.NetService.notify(player, "🎁 Ежедневная награда ждёт! Открой меню «Награды»", "success")
			end)
		end
	end)
end

function RewardService:Start()
	local Net = Services.NetService

	Net.addMeta(function(player, meta)
		local list = {}
		for index in claimedGifts[player] or {} do
			table.insert(list, index)
		end
		meta.GiftsClaimed = list
	end)

	Net.on("ClaimDaily", function(_player, data)
		local now = os.time()
		local available, streak, wait = Formulas.dailyStatus(data, now)
		if not available then
			return false, "Следующая награда через " .. Format.duration(wait) .. " ⏳"
		end
		local reward = Formulas.dailyReward(data, streak)
		data.Coins += reward
		data.TotalCoins += reward
		data.Daily.Streak = streak
		data.Daily.LastClaim = now
		local extra = ""
		if streak == #Config.Daily.Mults then
			Services.BoostService.resetCooldowns(data)
			extra = " Все бусты перезаряжены! ⚡"
		end
		return true, string.format("🎁 День %d: +%s 💰!%s", streak, Format.number(reward), extra)
	end)

	Net.on("ClaimGift", function(player, data, index)
		if type(index) ~= "number" then
			return false
		end
		index = math.floor(index)
		local gift = Config.Gifts[index]
		local claimed = claimedGifts[player]
		if not gift or not claimed then
			return false
		end
		if claimed[index] then
			return false, "Этот подарок уже получен"
		end
		local elapsed = os.time() - Services.PlayerService.sessionStart(player)
		local need = gift.Minutes * 60
		if elapsed < need then
			return false, "Подарок откроется через " .. Format.duration(need - elapsed) .. " ⏳"
		end
		claimed[index] = true
		local reward = Formulas.giftReward(data, index)
		data.Coins += reward
		data.TotalCoins += reward
		local extra = ""
		if gift.Boost then
			Services.BoostService.grant(data, gift.Boost)
			local boost = Config.BoostByKey[gift.Boost]
			extra = " + " .. boost.Icon .. " " .. boost.Name .. "!"
		end
		return true, "🎁 Подарок: +" .. Format.number(reward) .. " 💰" .. extra
	end)

	Players.PlayerRemoving:Connect(function(player)
		claimedGifts[player] = nil
	end)
end

return RewardService
