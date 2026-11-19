--[[
	LeaderboardService — доски рекордов в первой зоне:
	«Топ уборщиков» (сколько мусора выловлено) и «Топ перерождений».
	Использует OrderedDataStore. Если хранилище недоступно (Studio),
	доски показывают игроков текущего сервера.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)

local LeaderboardService = {}

local Services
local nameCache: { [number]: string } = {}

local BOARDS = {
	{
		Name = "TopTrash",
		Store = Config.TopTrashStore,
		Value = function(data)
			return data.Stats.TrashCollected
		end,
	},
	{
		Name = "TopRebirth",
		Store = Config.TopRebirthStore,
		Value = function(data)
			return data.Rebirths
		end,
	},
}

local function nameOf(userId: number): string
	if nameCache[userId] then
		return nameCache[userId]
	end
	local player = Players:GetPlayerByUserId(userId)
	if player then
		nameCache[userId] = player.DisplayName
		return player.DisplayName
	end
	local ok, name = pcall(function()
		return Players:GetNameFromUserIdAsync(userId)
	end)
	local result = if ok and name then name else ("Игрок " .. userId)
	nameCache[userId] = result
	return result
end

local function rowsOf(boardName: string)
	local board = workspace:FindFirstChild("Map")
	board = board and board:FindFirstChild("Leaderboards")
	board = board and board:FindFirstChild(boardName)
	board = board and board:FindFirstChild("Board")
	local gui = board and board:FindFirstChild("SurfaceFront")
	return gui and gui:FindFirstChild("Root")
end

local function render(boardName: string, entries: { { UserId: number, Value: number } })
	local root = rowsOf(boardName)
	if not root then
		return
	end
	for i = 1, 10 do
		local row = root:FindFirstChild("Row" .. i)
		if row then
			local entry = entries[i]
			row.PlayerName.Text = if entry then nameOf(entry.UserId) else "—"
			row.Value.Text = if entry then Format.number(entry.Value) else ""
		end
	end
end

local function localEntries(valueFn)
	local entries = {}
	for _, player in Players:GetPlayers() do
		local data = Services.DataService.get(player)
		if data then
			table.insert(entries, { UserId = player.UserId, Value = valueFn(data) })
		end
	end
	table.sort(entries, function(a, b)
		return a.Value > b.Value
	end)
	return entries
end

local function refresh(board, store)
	if store then
		for _, player in Players:GetPlayers() do
			local data = Services.DataService.get(player)
			if data and Services.DataService.canSave(player) then
				pcall(function()
					store:SetAsync(tostring(player.UserId), math.floor(board.Value(data)))
				end)
			end
		end
		local ok, pages = pcall(function()
			return store:GetSortedAsync(false, 10)
		end)
		if ok and pages then
			local entries = {}
			for _, item in pages:GetCurrentPage() do
				local userId = tonumber(item.key)
				if userId then
					table.insert(entries, { UserId = userId, Value = item.value })
				end
			end
			render(board.Name, entries)
			return
		end
	end
	render(board.Name, localEntries(board.Value))
end

function LeaderboardService:Init(services)
	Services = services
end

function LeaderboardService:Start()
	local stores = {}
	for index, board in BOARDS do
		local ok, store = pcall(function()
			return DataStoreService:GetOrderedDataStore(board.Store)
		end)
		stores[index] = if ok then store else nil
	end

	task.wait(8)
	while true do
		for index, board in BOARDS do
			local ok, err = pcall(refresh, board, stores[index])
			if not ok then
				warn("[Рекорды]", err)
			end
		end
		task.wait(Config.LeaderboardRefresh)
	end
end

return LeaderboardService
