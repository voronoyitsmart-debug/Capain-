--[[
	Util — мелкие помощники для создания объектов.
]]

local Util = {}

-- Безопасно достаёт материал по имени (новые материалы есть не во всех версиях)
local materialCache = {}
function Util.material(name: string?): Enum.Material
	if not name then
		return Enum.Material.SmoothPlastic
	end
	local cached = materialCache[name]
	if cached then
		return cached
	end
	local ok, value = pcall(function()
		return (Enum.Material :: any)[name]
	end)
	local result = if ok and value then value else Enum.Material.SmoothPlastic
	materialCache[name] = result
	return result
end

-- create("Part", {Size = ..., Parent = ...}) — Parent ставится последним
function Util.create(className: string, props: { [string]: any }?, children: { Instance }?): any
	local inst = Instance.new(className)
	local parent = nil
	if props then
		for key, value in props do
			if key == "Parent" then
				parent = value
			else
				(inst :: any)[key] = value
			end
		end
	end
	if children then
		for _, child in children do
			child.Parent = inst
		end
	end
	if parent then
		inst.Parent = parent
	end
	return inst
end

-- Простая неподвижная деталь для карты.
-- Shape можно передать строкой ("Ball", "Cylinder"), Material — тоже строкой.
function Util.part(props: { [string]: any }): Part
	local defaults = {
		Anchored = true,
		TopSurface = Enum.SurfaceType.Smooth,
		BottomSurface = Enum.SurfaceType.Smooth,
	}
	local shape = nil
	local parent = nil
	for key, value in props do
		if key == "Shape" and type(value) == "string" then
			shape = value
		elseif key == "Parent" then
			parent = value
		else
			defaults[key] = value
		end
	end
	if typeof(defaults.Material) == "string" then
		defaults.Material = Util.material(defaults.Material)
	end
	local cframe = defaults.CFrame
	defaults.CFrame = nil
	local part = Util.create("Part", defaults)
	if shape then
		Util.applyShape(part, shape, part.Size)
	end
	if cframe then
		part.CFrame = cframe
	end
	if parent then
		part.Parent = parent
	end
	return part
end

function Util.wedge(props: { [string]: any }): WedgePart
	local defaults = {
		Anchored = true,
		TopSurface = Enum.SurfaceType.Smooth,
		BottomSurface = Enum.SurfaceType.Smooth,
	}
	for key, value in props do
		defaults[key] = value
	end
	if typeof(defaults.Material) == "string" then
		defaults.Material = Util.material(defaults.Material)
	end
	return Util.create("WedgePart", defaults)
end

--[[
	Деталь формы Ball в Roblox всегда идеальный шар (берётся меньшая сторона).
	Для сплюснутых шаров (эллипсоидов) делаем блок + SpecialMesh «Sphere».
	shape: "Ball" | "Block" | "Cylinder" | "Wedge"
]]
function Util.applyShape(part: BasePart, shape: string, size: Vector3)
	local uniform = math.abs(size.X - size.Y) < 1e-3 and math.abs(size.Y - size.Z) < 1e-3
	if shape == "Ball" and not uniform then
		(part :: Part).Shape = Enum.PartType.Block
		local mesh = Instance.new("SpecialMesh")
		mesh.MeshType = Enum.MeshType.Sphere
		mesh.Parent = part
	elseif part:IsA("Part") then
		part.Shape = (Enum.PartType :: any)[shape]
	end
	part.Size = size
end

function Util.lerp(a: number, b: number, t: number): number
	return a + (b - a) * t
end

function Util.flatDistance(a: Vector3, b: Vector3): number
	local dx = a.X - b.X
	local dz = a.Z - b.Z
	return math.sqrt(dx * dx + dz * dz)
end

function Util.deepCopy(value: any): any
	if type(value) ~= "table" then
		return value
	end
	local out = {}
	for k, v in value do
		out[k] = Util.deepCopy(v)
	end
	return out
end

-- Дополняет target недостающими полями из template (рекурсивно)
function Util.reconcile(target: { [any]: any }, template: { [any]: any })
	for key, value in template do
		if target[key] == nil then
			target[key] = Util.deepCopy(value)
		elseif type(value) == "table" and type(target[key]) == "table" and next(value) ~= nil then
			-- массивы-шаблоны (например, Quests = {}) пустые, поэтому не трогаем
			Util.reconcile(target[key], value)
		end
	end
	return target
end

function Util.countKeys(t: { [any]: any }?): number
	local n = 0
	if t then
		for _ in t do
			n += 1
		end
	end
	return n
end

return Util
