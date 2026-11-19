--[[
	CollectController — ловля мусора кликом мыши или касанием.
	• Клик по предмету — ловим. Промахнулся чуть-чуть — ловим ближайший к курсору.
	• Держишь кнопку — сачок машет сам с перезарядкой.
	• Кольцо на земле показывает дальность сачка.
	• Подсветка предмета под курсором (зелёная — достаёшь, красная — далеко).
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Util = require(Shared.Util)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local Sounds = require(Client.Sounds)
local State = require(Client.State)
local TrashAnimator = require(script.Parent.TrashAnimator)

local CollectController = {}

local player = Players.LocalPlayer

local holding = false
local activeInput: InputObject? = nil
local pointer: Vector2? = nil
local mousePos: Vector2? = nil
local nextSwing = 0
local lastWarn = 0
local highlight: Highlight
local ring: Model
local ringRange = 0
local ringParts: { BasePart } = {}
local statsCache = nil
local statsAt = 0

local SEGMENTS = 48
local GREEN = Color3.fromRGB(90, 255, 140)
local RED = Color3.fromRGB(255, 90, 90)

local notify: ((string, string) -> ())? = nil
function CollectController.setNotifier(fn)
	notify = fn
end

local function rootPart(): BasePart?
	local character = player.Character
	return character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
end

local function stats()
	local now = os.clock()
	if not statsCache or now - statsAt > 0.25 then
		statsCache = State.stats()
		statsAt = now
	end
	return statsCache
end

local function warnOnce(text: string)
	local now = os.clock()
	if now - lastWarn > 2 then
		lastWarn = now
		if notify then
			notify(text, "error")
		end
	end
end

----------------------------------------------------------------------
-- Кольцо дальности
----------------------------------------------------------------------
local function buildRing(range: number)
	for _, part in ringParts do
		part:Destroy()
	end
	ringParts = {}
	local circumference = 2 * math.pi * range
	local segLen = circumference / SEGMENTS * 0.55
	for i = 0, SEGMENTS - 1 do
		local part = Instance.new("Part")
		part.Name = "Seg"
		part.Anchored = true
		part.CanCollide = false
		part.CanQuery = false
		part.CanTouch = false
		part.CastShadow = false
		part.Material = Enum.Material.Neon
		part.Color = GREEN
		part.Transparency = 0.45
		part.Size = Vector3.new(segLen, 0.12, 0.28)
		local a = i / SEGMENTS * math.pi * 2
		part.CFrame = CFrame.new(math.cos(a) * range, 0, math.sin(a) * range) * CFrame.Angles(0, -a + math.pi / 2, 0)
		part.Parent = ring
		table.insert(ringParts, part)
	end
	local center = Instance.new("Part")
	center.Name = "Center"
	center.Transparency = 1
	center.Anchored = true
	center.CanCollide = false
	center.CanQuery = false
	center.CanTouch = false
	center.Size = Vector3.new(0.2, 0.2, 0.2)
	center.CFrame = CFrame.identity
	center.Parent = ring
	ring.PrimaryPart = center
	table.insert(ringParts, center)
	ringRange = range
end

local function setRingColor(color: Color3)
	for _, part in ringParts do
		if part.Name == "Seg" then
			part.Color = color
		end
	end
end

local flashUntil = 0
local function flashRing()
	flashUntil = os.clock() + 0.5
	setRingColor(RED)
end

----------------------------------------------------------------------
-- Поиск цели
----------------------------------------------------------------------
local raycastParams = RaycastParams.new()
raycastParams.FilterType = Enum.RaycastFilterType.Include

local function distanceTo(model: Model, root: BasePart): number
	local pos = TrashAnimator.position(model)
	if not pos then
		return math.huge
	end
	return Util.flatDistance(pos, root.Position)
end

-- Возвращает (модель, достаёт ли сачок)
local function findTarget(screenPos: Vector2, root: BasePart, range: number): (Model?, boolean)
	local camera = workspace.CurrentCamera
	local folder = TrashAnimator.folder()
	if not camera or not folder then
		return nil, false
	end

	raycastParams.FilterDescendantsInstances = { folder }
	local ray = camera:ScreenPointToRay(screenPos.X, screenPos.Y)
	local hit = workspace:Raycast(ray.Origin, ray.Direction * 700, raycastParams)
	local direct = hit and TrashAnimator.modelOf(hit.Instance)
	if direct then
		return direct, distanceTo(direct, root) <= range + 1
	end

	-- промах: ищем ближайший к курсору предмет, до которого достаём
	local best: Model? = nil
	local bestScore = math.huge
	local maxPixels = if UserInputService.TouchEnabled then 90 else 65
	for model, info in TrashAnimator.tracked() do
		local pos = info.CFrame.Position
		if Util.flatDistance(pos, root.Position) <= range + 1 then
			local screen, onScreen = camera:WorldToScreenPoint(pos)
			if onScreen then
				local pixels = (Vector2.new(screen.X, screen.Y) - screenPos).Magnitude
				if pixels < maxPixels and pixels < bestScore then
					best = model
					bestScore = pixels
				end
			end
		end
	end
	return best, best ~= nil
end

local function tryCollect(screenPos: Vector2)
	local now = os.clock()
	if now < nextSwing then
		return
	end
	local data = State.Data
	local s = stats()
	local root = rootPart()
	if not data or not s or not root then
		return
	end

	local target, inRange = findTarget(screenPos, root, s.Range)
	if not target then
		return
	end
	if not inRange then
		flashRing()
		warnOnce("Далеко! 🥅 Подойди ближе или купи сачок длиннее")
		return
	end

	local zone = target:GetAttribute("Zone")
	if type(zone) == "number" and zone > data.MaxZone then
		return
	end

	local hasAutoSell = (data.Perks.AutoSell or 0) > 0 and data.Settings.AutoSell
	if data.InvSize >= s.Capacity and not hasAutoSell then
		flashRing()
		warnOnce(if (data.Perks.SellAnywhere or 0) > 0
			then "🎒 Рюкзак полон! Нажми «Продать»"
			else "🎒 Рюкзак полон! Беги на ♻️ переработку")
		nextSwing = now + 0.4
		return
	end

	local id = target:GetAttribute("Id")
	if type(id) == "number" then
		ClientNet.collect(id)
		nextSwing = now + s.Cooldown
		Sounds.play("Whoosh", 0.25, 1.2 + math.random() * 0.2)
	end
end

----------------------------------------------------------------------
-- Запуск
----------------------------------------------------------------------
function CollectController.start()
	ring = Instance.new("Model")
	ring.Name = "NetRange"
	ring.Parent = workspace

	highlight = Instance.new("Highlight")
	highlight.Name = "TrashHover"
	highlight.FillTransparency = 0.75
	highlight.OutlineTransparency = 0
	highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
	highlight.Enabled = false
	highlight.Parent = workspace

	UserInputService.InputBegan:Connect(function(input, processed)
		if processed then
			return
		end
		local kind = input.UserInputType
		if kind == Enum.UserInputType.MouseButton1 or kind == Enum.UserInputType.Touch then
			holding = true
			activeInput = input
			pointer = Vector2.new(input.Position.X, input.Position.Y)
			tryCollect(pointer)
		end
	end)

	UserInputService.InputChanged:Connect(function(input)
		local kind = input.UserInputType
		if kind == Enum.UserInputType.MouseMovement then
			mousePos = Vector2.new(input.Position.X, input.Position.Y)
			if holding then
				pointer = mousePos
			end
		elseif kind == Enum.UserInputType.Touch and input == activeInput then
			pointer = Vector2.new(input.Position.X, input.Position.Y)
		end
	end)

	UserInputService.InputEnded:Connect(function(input)
		local kind = input.UserInputType
		if kind == Enum.UserInputType.MouseButton1 or (kind == Enum.UserInputType.Touch and input == activeInput) then
			holding = false
			activeInput = nil
		end
	end)

	RunService.RenderStepped:Connect(function()
		local s = stats()
		local root = rootPart()
		local data = State.Data
		if not s or not root or not data then
			ring.Parent = nil
			highlight.Enabled = false
			return
		end

		-- кольцо дальности
		if State.setting("ShowRange") then
			if math.abs(ringRange - s.Range) > 0.01 then
				buildRing(s.Range)
			end
			ring.Parent = workspace
			local y = root.Position.Y - 2.8
			local overWater = root.Position.Y < Config.World.WaterY + 4
			if overWater then
				y = math.max(y, Config.World.WaterY + 0.15)
			end
			ring:PivotTo(CFrame.new(root.Position.X, y, root.Position.Z))
			if flashUntil > 0 and os.clock() > flashUntil then
				flashUntil = 0
				setRingColor(GREEN)
			end
		else
			ring.Parent = nil
		end

		-- подсветка под курсором (только мышь)
		if mousePos and UserInputService.MouseEnabled then
			local target, inRange = findTarget(mousePos, root, s.Range)
			if target then
				highlight.Adornee = target
				highlight.OutlineColor = if inRange then GREEN else RED
				highlight.FillColor = if inRange then GREEN else RED
				highlight.Enabled = true
			else
				highlight.Enabled = false
			end
		else
			highlight.Enabled = false
		end

		-- удержание кнопки = непрерывная ловля
		if holding and pointer then
			tryCollect(pointer)
		end
	end)
end

return CollectController
