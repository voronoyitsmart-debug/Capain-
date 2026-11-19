--[[
	PlayerService — появление персонажа, скорость бега, таблица лидеров (leaderstats),
	время в игре и приветствие.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)
local Formulas = require(Shared.Formulas)
local RiverMath = require(Shared.RiverMath)

local PlayerService = {}

local Services
local sessionStart: { [Player]: number } = {}

-- Появление персонажа (LoadCharacterAsync — новое имя LoadCharacter)
function PlayerService.spawnCharacter(player: Player)
	if not player.Parent then
		return
	end
	local ok = pcall(function()
		(player :: any):LoadCharacterAsync()
	end)
	if not ok and player.Parent then
		pcall(function()
			player:LoadCharacter()
		end)
	end
end

function PlayerService.sessionStart(player: Player): number
	return sessionStart[player] or os.time()
end

function PlayerService.applyStats(player: Player)
	local data = Services.DataService.get(player)
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if not data or not humanoid then
		return
	end
	local stats = Formulas.getStats(data, os.time(), Services.EventService.current())
	humanoid.WalkSpeed = stats.WalkSpeed
	humanoid.UseJumpPower = false
	humanoid.JumpHeight = stats.JumpHeight
end

local function setupLeaderstats(player: Player)
	local folder = Instance.new("Folder")
	folder.Name = "leaderstats"

	local coins = Instance.new("StringValue")
	coins.Name = "💰 Монеты"
	coins.Value = "0"
	coins.Parent = folder

	local trash = Instance.new("IntValue")
	trash.Name = "🗑️ Мусор"
	trash.Parent = folder

	local rebirths = Instance.new("IntValue")
	rebirths.Name = "🌀 Перерожд."
	rebirths.Parent = folder

	folder.Parent = player
end

local function updateLeaderstats(player: Player)
	local data = Services.DataService.get(player)
	local folder = player:FindFirstChild("leaderstats")
	if not data or not folder then
		return
	end
	local coins = folder:FindFirstChild("💰 Монеты") :: StringValue?
	local trash = folder:FindFirstChild("🗑️ Мусор") :: IntValue?
	local rebirths = folder:FindFirstChild("🌀 Перерожд.") :: IntValue?
	if coins then
		coins.Value = Format.number(data.Coins)
	end
	if trash then
		trash.Value = data.Stats.TrashCollected
	end
	if rebirths then
		rebirths.Value = data.Rebirths
	end
end

local function onCharacterAdded(player: Player, character: Model)
	local humanoid = character:WaitForChild("Humanoid", 10) :: Humanoid?
	local root = character:WaitForChild("HumanoidRootPart", 10)
	if not humanoid or not root then
		return
	end
	while not character.Parent do
		task.wait()
	end
	task.wait()
	PlayerService.applyStats(player)

	local data = Services.DataService.get(player)
	if data and data.LastZone > 1 and data.LastZone <= data.MaxZone then
		Services.ZoneService.teleport(player, data.LastZone)
	else
		player:SetAttribute("Zone", 1)
	end

	humanoid.Died:Connect(function()
		task.delay(Players.RespawnTime, function()
			PlayerService.spawnCharacter(player)
		end)
	end)
end

local function onLoaded(player: Player, data, info)
	sessionStart[player] = os.time()
	player:SetAttribute("SessionStart", sessionStart[player])
	setupLeaderstats(player)
	updateLeaderstats(player)

	player.CharacterAdded:Connect(function(character)
		onCharacterAdded(player, character)
	end)
	PlayerService.spawnCharacter(player)

	local Net = Services.NetService
	Net.markDirty(player)
	if info.IsNew then
		task.delay(2, function()
			Net.notify(player, "Привет! 🌊 Кликай по мусору в реке, чтобы выловить его сачком!", "info")
		end)
	else
		local away = os.time() - (data.LastOnline or os.time())
		if away > 120 then
			task.delay(2, function()
				Net.notify(player, "С возвращением! Тебя не было " .. Format.duration(away) .. " 👋", "info")
			end)
		end
	end
	if not info.CanSave then
		task.delay(4, function()
			Net.notify(
				player,
				"⚠️ Сохранения выключены (Studio без доступа к API). Прогресс не запишется.",
				"error"
			)
		end)
	end
end

function PlayerService:Init(services)
	Services = services
	Services.DataService.Loaded:Connect(onLoaded)
end

function PlayerService:Start()
	Services.NetService.addMeta(function(player, meta)
		meta.SessionStart = sessionStart[player] or os.time()
		meta.CanSave = Services.DataService.canSave(player)
		meta.HubSpawn = RiverMath.hubPosition(1)
	end)

	Players.PlayerRemoving:Connect(function(player)
		local data = Services.DataService.get(player)
		if data and sessionStart[player] then
			data.Stats.PlayTime += os.time() - sessionStart[player]
		end
		sessionStart[player] = nil
	end)

	while true do
		task.wait(1)
		for _, player in Players:GetPlayers() do
			updateLeaderstats(player)
		end
	end
end

PlayerService.updateLeaderstats = updateLeaderstats

-- подсказка в консоли Studio
if #Config.Zones == 0 then
	warn("[Чистая Река] В Config нет зон!")
end

return PlayerService
