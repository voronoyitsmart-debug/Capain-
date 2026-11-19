--[[
	Effects — брызги, мусор летит в рюкзак, всплывающие подписи, монеты при продаже.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Remotes = require(Shared.Remotes)
local TrashModels = require(Shared.TrashModels)

local Client = script.Parent.Parent
local State = require(Client.State)
local Sounds = require(Client.Sounds)
local HelperRenderer = require(script.Parent.HelperRenderer)

local Effects = {}

local player = Players.LocalPlayer
local fxFolder: Folder
local activeFx = 0
local MAX_FX = 24

local function effectsOn(): boolean
	return State.setting("Effects")
end

local function rootOf(p: Player?): BasePart?
	local character = p and p.Character
	return character and character:FindFirstChild("HumanoidRootPart") :: BasePart?
end

local function holder(pos: Vector3): Part
	local part = Instance.new("Part")
	part.Name = "Fx"
	part.Size = Vector3.new(0.2, 0.2, 0.2)
	part.Transparency = 1
	part.Anchored = true
	part.CanCollide = false
	part.CanQuery = false
	part.CanTouch = false
	part.CFrame = CFrame.new(pos)
	part.Parent = fxFolder
	return part
end

function Effects.splash(pos: Vector3, color: Color3?)
	if not effectsOn() then
		return
	end
	local part = holder(Vector3.new(pos.X, Config.World.WaterY + 0.2, pos.Z))
	local emitter = Instance.new("ParticleEmitter")
	emitter.Texture = "rbxasset://textures/particles/sparkles_main.dds"
	emitter.Rate = 0
	emitter.Lifetime = NumberRange.new(0.35, 0.6)
	emitter.Speed = NumberRange.new(7, 12)
	emitter.SpreadAngle = Vector2.new(35, 35)
	emitter.EmissionDirection = Enum.NormalId.Top
	emitter.Acceleration = Vector3.new(0, -40, 0)
	emitter.Color = ColorSequence.new(color or Color3.fromRGB(200, 235, 255))
	emitter.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.55), NumberSequenceKeypoint.new(1, 0.1) })
	emitter.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.1), NumberSequenceKeypoint.new(1, 1) })
	emitter.Parent = part
	emitter:Emit(14)
	task.delay(1.2, function()
		part:Destroy()
	end)
end

-- Подпись, которая всплывает и тает
function Effects.popup(pos: Vector3, text: string, color: Color3, big: boolean?)
	if not effectsOn() then
		return
	end
	local part = holder(pos + Vector3.new(0, 2, 0))
	local gui = Instance.new("BillboardGui")
	gui.Size = if big then UDim2.fromOffset(320, 60) else UDim2.fromOffset(240, 40)
	gui.StudsOffset = Vector3.new(0, 0, 0)
	gui.AlwaysOnTop = true
	gui.LightInfluence = 0
	gui.MaxDistance = 150
	gui.Adornee = part
	gui.Parent = part

	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Font = Enum.Font.GothamBlack
	label.TextScaled = true
	label.Text = text
	label.TextColor3 = color
	label.Parent = gui
	local stroke = Instance.new("UIStroke")
	stroke.Thickness = 2.5
	stroke.Color = Color3.fromRGB(15, 20, 30)
	stroke.Parent = label

	local info = TweenInfo.new(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
	TweenService:Create(gui, info, { StudsOffset = Vector3.new(0, 3.5, 0) }):Play()
	TweenService:Create(label, TweenInfo.new(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.In), { TextTransparency = 1 }):Play()
	TweenService:Create(stroke, TweenInfo.new(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.In), { Transparency = 1 }):Play()
	task.delay(1.2, function()
		part:Destroy()
	end)
end

-- Предмет вылетает из воды и летит к персонажу
local function flyTo(key: string, from: Vector3, owner: Player, delay: number, shiny: boolean)
	if activeFx >= MAX_FX or not effectsOn() then
		return
	end
	local root = rootOf(owner)
	if not root then
		return
	end
	activeFx += 1
	local model = TrashModels.build(key)
	for _, d in model:GetDescendants() do
		if d:IsA("BasePart") then
			d.CanQuery = false
		end
	end
	if shiny then
		local sparkles = Instance.new("ParticleEmitter")
		sparkles.Texture = "rbxasset://textures/particles/sparkles_main.dds"
		sparkles.Rate = 30
		sparkles.Lifetime = NumberRange.new(0.3, 0.6)
		sparkles.Speed = NumberRange.new(1, 3)
		sparkles.SpreadAngle = Vector2.new(180, 180)
		sparkles.LightEmission = 1
		sparkles.Color = ColorSequence.new(Color3.fromRGB(255, 240, 150))
		sparkles.Parent = model.PrimaryPart
	end
	model:PivotTo(CFrame.new(from))
	model.Parent = fxFolder

	local started = os.clock()
	local duration = 0.5
	local connection
	connection = RunService.RenderStepped:Connect(function()
		local a = (os.clock() - started - delay) / duration
		if a < 0 then
			return
		end
		local target = rootOf(owner)
		if a >= 1 or not target then
			connection:Disconnect()
			model:Destroy()
			activeFx -= 1
			return
		end
		local goal = target.Position + Vector3.new(0, 0.5, 0)
		local mid = (from + goal) / 2 + Vector3.new(0, 6, 0)
		local p = from:Lerp(mid, a):Lerp(mid:Lerp(goal, a), a)
		model:PivotTo(CFrame.new(p) * CFrame.Angles(a * 5, a * 3.5, 0))
		pcall(function()
			model:ScaleTo(math.max(0.08, 1 - a * 0.85))
		end)
	end)
end

local function onCollect(userId: number, key: string, pos: Vector3, shiny: boolean, helperIndex: number)
	local def = Config.Trash[key]
	if not def or typeof(pos) ~= "Vector3" then
		return
	end
	local owner = Players:GetPlayerByUserId(userId)
	local mine = owner == player
	local camera = workspace.CurrentCamera
	local near = camera and (camera.CFrame.Position - pos).Magnitude < 160

	if near or mine then
		Effects.splash(pos)
	end
	local delay = 0
	if owner and helperIndex > 0 then
		HelperRenderer.dart(owner, helperIndex, pos)
		delay = HelperRenderer.dartTime() * 0.5
	end
	if owner and (mine or near) then
		flyTo(key, pos, owner, delay, shiny)
	end

	if mine then
		local rarity = Config.Rarities[def.Rarity]
		local pitch = 1 + (rarity.Order - 1) * 0.08 + math.random() * 0.08
		Sounds.play("Collect", 0.35, if shiny then 1.5 else pitch)
		local text = "+ " .. def.Name
		if shiny then
			text = "✨ " .. def.Name .. " ✨"
		end
		Effects.popup(pos, text, if shiny then Color3.fromRGB(255, 240, 140) else rarity.Color, shiny or rarity.Order >= 4)
		State.Collected:Fire(key, shiny)
	end
end

local function onSell(coins: number, items: number)
	Sounds.play("Sell", 0.6, 1.2)
	State.Sold:Fire(coins, items)
	local root = rootOf(player)
	if root and effectsOn() then
		local part = holder(root.Position)
		local emitter = Instance.new("ParticleEmitter")
		emitter.Texture = "rbxasset://textures/particles/sparkles_main.dds"
		emitter.Rate = 0
		emitter.Lifetime = NumberRange.new(0.6, 1)
		emitter.Speed = NumberRange.new(10, 16)
		emitter.SpreadAngle = Vector2.new(60, 60)
		emitter.EmissionDirection = Enum.NormalId.Top
		emitter.Acceleration = Vector3.new(0, -30, 0)
		emitter.LightEmission = 0.8
		emitter.Color = ColorSequence.new(Color3.fromRGB(255, 210, 60))
		emitter.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.8), NumberSequenceKeypoint.new(1, 0.2) })
		emitter.Parent = part
		emitter:Emit(30)
		task.delay(1.5, function()
			part:Destroy()
		end)
	end
end

function Effects.start()
	fxFolder = Instance.new("Folder")
	fxFolder.Name = "LocalEffects"
	fxFolder.Parent = workspace

	Remotes.get("Effect").OnClientEvent:Connect(function(kind, ...)
		if kind == "collect" then
			onCollect(...)
		elseif kind == "sell" then
			onSell(...)
		end
	end)
end

return Effects
