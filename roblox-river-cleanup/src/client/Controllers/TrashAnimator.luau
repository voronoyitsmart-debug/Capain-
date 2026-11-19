--[[
	TrashAnimator — плавно двигает мусор по реке на клиенте.
	Сервер ставит модель один раз, а дальше клиент считает позицию по той же
	формуле (RiverMath), что и сервер, — без лагов и лишнего трафика.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local RiverMath = require(Shared.RiverMath)

local TrashAnimator = {}

type Info = {
	Model: Model,
	Origin: Vector3,
	Vel: Vector3,
	T0: number,
	Seed: number,
	Pivot0: CFrame,
	Parts: { BasePart },
	Offsets: { CFrame },
	CFrame: CFrame,
	Phase: number,
}

local tracked: { [Model]: Info } = {}
local folder: Folder? = nil
local frame = 0

local function addPart(info: Info, part: Instance)
	if part:IsA("BasePart") and not table.find(info.Parts, part) then
		table.insert(info.Parts, part)
		table.insert(info.Offsets, info.Pivot0:ToObjectSpace(part.CFrame))
	end
end

local function track(model: Instance)
	if not model:IsA("Model") or tracked[model] then
		return
	end
	local origin = model:GetAttribute("Origin")
	local vel = model:GetAttribute("Vel")
	local t0 = model:GetAttribute("T0")
	local seed = model:GetAttribute("Seed")
	local pivot0 = model:GetAttribute("Pivot0")
	if typeof(origin) ~= "Vector3" or typeof(vel) ~= "Vector3" or typeof(pivot0) ~= "CFrame" then
		return
	end
	local info: Info = {
		Model = model,
		Origin = origin,
		Vel = vel,
		T0 = t0 or 0,
		Seed = seed or 0,
		Pivot0 = pivot0,
		Parts = {},
		Offsets = {},
		CFrame = pivot0,
		Phase = math.random(0, 11),
	}
	for _, d in model:GetDescendants() do
		addPart(info, d)
	end
	model.DescendantAdded:Connect(function(d)
		addPart(info, d)
	end)
	tracked[model] = info
end

function TrashAnimator.tracked(): { [Model]: Info }
	return tracked
end

function TrashAnimator.folder(): Folder?
	return folder
end

-- Текущая позиция предмета (как её видит игрок)
function TrashAnimator.position(model: Model): Vector3?
	local info = tracked[model]
	return info and info.CFrame.Position or nil
end

-- По детали находим модель мусора
function TrashAnimator.modelOf(part: Instance?): Model?
	local f = folder
	if not part or not f then
		return nil
	end
	local current: Instance? = part
	while current and current.Parent ~= f do
		current = current.Parent
	end
	if current and current:IsA("Model") then
		return current
	end
	return nil
end

function TrashAnimator.start()
	local f = workspace:WaitForChild("Trash") :: Folder
	folder = f
	f.ChildAdded:Connect(track)
	f.ChildRemoved:Connect(function(child)
		tracked[child :: Model] = nil
	end)
	for _, child in f:GetChildren() do
		track(child)
	end

	RunService.RenderStepped:Connect(function()
		frame += 1
		local t = workspace:GetServerTimeNow()
		local camera = workspace.CurrentCamera
		local camPos = if camera then camera.CFrame.Position else Vector3.zero
		local parts: { BasePart } = {}
		local cframes: { CFrame } = {}
		for model, info in tracked do
			if model.Parent then
				local far = (info.CFrame.Position - camPos).Magnitude > 350
				if not far or (frame + info.Phase) % 12 == 0 then
					local cf = RiverMath.trashCFrame(info.Origin, info.Vel, info.T0, info.Seed, t)
					info.CFrame = cf
					for i, part in info.Parts do
						if part.Parent then
							table.insert(parts, part)
							table.insert(cframes, cf * info.Offsets[i])
						end
					end
				end
			end
		end
		if #parts > 0 then
			workspace:BulkMoveTo(parts, cframes, Enum.BulkMoveMode.FireCFrameChanged)
		end
	end)
end

return TrashAnimator
