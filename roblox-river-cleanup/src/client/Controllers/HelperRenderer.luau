--[[
	HelperRenderer — рисует помощников всех игроков: они кружат вокруг хозяина
	и «бросаются» к мусору, когда ловят его.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local HelperModels = require(Shared.HelperModels)

local HelperRenderer = {}

type Rig = {
	Key: string,
	Models: { Model },
	Darts: { [number]: { Target: Vector3, Start: number } },
	LastPos: { [number]: Vector3 },
}

local rigs: { [Player]: Rig } = {}
local folder: Folder

local DART_TIME = 0.55

local function clear(rig: Rig)
	for _, model in rig.Models do
		model:Destroy()
	end
	rig.Models = {}
	rig.Darts = {}
	rig.LastPos = {}
end

local function rebuild(player: Player)
	local attr = player:GetAttribute("Helpers")
	local key = if type(attr) == "string" then attr else ""
	local rig = rigs[player]
	if rig and rig.Key == key then
		return
	end
	if not rig then
		rig = { Key = key, Models = {}, Darts = {}, LastPos = {} }
		rigs[player] = rig
	end
	clear(rig)
	rig.Key = key
	for helperKey in string.gmatch(key, "[^,]+") do
		if HelperModels.has(helperKey) then
			local model = HelperModels.build(helperKey)
			model.Parent = folder
			table.insert(rig.Models, model)
		end
	end
end

local function watch(player: Player)
	rebuild(player)
	player:GetAttributeChangedSignal("Helpers"):Connect(function()
		rebuild(player)
	end)
end

-- Помощник index игрока player летит к точке target
function HelperRenderer.dart(player: Player, index: number, target: Vector3)
	local rig = rigs[player]
	if rig and rig.Models[index] then
		rig.Darts[index] = { Target = target, Start = os.clock() }
	end
end

function HelperRenderer.dartTime(): number
	return DART_TIME
end

local function smooth(x: number): number
	return x * x * (3 - 2 * x)
end

function HelperRenderer.start()
	folder = Instance.new("Folder")
	folder.Name = "LocalHelpers"
	folder.Parent = workspace

	Players.PlayerAdded:Connect(watch)
	Players.PlayerRemoving:Connect(function(player)
		local rig = rigs[player]
		if rig then
			clear(rig)
			rigs[player] = nil
		end
	end)
	for _, player in Players:GetPlayers() do
		watch(player)
	end

	local hidden = CFrame.new(0, -500, 0)
	RunService.RenderStepped:Connect(function()
		local t = os.clock()
		for player, rig in rigs do
			local character = player.Character
			local root = character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
			local count = #rig.Models
			for i, model in rig.Models do
				if not root then
					model:PivotTo(hidden)
					continue
				end
				local angle = t * 0.9 + (i - 1) * (math.pi * 2 / count)
				local radius = 4 + count * 0.45
				local base = root.Position
					+ Vector3.new(math.cos(angle) * radius, 2.3 + math.sin(t * 2.6 + i) * 0.35, math.sin(angle) * radius)
				local pos = base
				local dart = rig.Darts[i]
				if dart then
					local a = (t - dart.Start) / DART_TIME
					if a >= 1 then
						rig.Darts[i] = nil
					else
						local k = if a < 0.5 then a * 2 else (1 - a) * 2
						pos = base:Lerp(dart.Target + Vector3.new(0, 1.2, 0), smooth(k))
					end
				end
				local last = rig.LastPos[i] or pos
				rig.LastPos[i] = pos
				local dir = pos - last
				local forward
				if dir.Magnitude > 0.02 then
					forward = Vector3.new(dir.X, 0, dir.Z)
				else
					forward = root.CFrame.LookVector
				end
				if forward.Magnitude < 1e-3 then
					forward = Vector3.new(0, 0, -1)
				end
				model:PivotTo(CFrame.lookAt(pos, pos + forward.Unit))
			end
		end
	end)
end

return HelperRenderer
