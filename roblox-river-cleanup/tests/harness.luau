--[[
	Тестовая обвязка для Lune: загружает модули игры так, будто они лежат в Roblox.
	`script`, `script.Parent.Config` и `require(...)` работают как в Studio,
	а Instance/Vector3/CFrame/Enum берутся из @lune/roblox (с проверкой свойств
	по настоящей базе API Roblox).
]]

local fs = require("@lune/fs")
local luau = require("@lune/luau")
local roblox = require("@lune/roblox")

local Harness = {}

local ROOT = "src"

local cache = {}
local nodeCache = {}

local robloxGlobals = {
	Instance = roblox.Instance,
	Vector3 = roblox.Vector3,
	Vector2 = roblox.Vector2,
	CFrame = roblox.CFrame,
	Color3 = roblox.Color3,
	UDim = roblox.UDim,
	UDim2 = roblox.UDim2,
	Enum = roblox.Enum,
	NumberRange = roblox.NumberRange,
	NumberSequence = roblox.NumberSequence,
	NumberSequenceKeypoint = roblox.NumberSequenceKeypoint,
	ColorSequence = roblox.ColorSequence,
	ColorSequenceKeypoint = roblox.ColorSequenceKeypoint,
	Rect = roblox.Rect,
	BrickColor = roblox.BrickColor,
	Font = roblox.Font,
	Ray = roblox.Ray,
	PhysicalProperties = roblox.PhysicalProperties,
	TweenInfo = nil,
}

Harness.extraGlobals = {}

local function fileFor(path: string): string?
	for _, ext in { ".luau", ".lua" } do
		if fs.isFile(path .. ext) then
			return path .. ext
		end
	end
	for _, init in { "/init.luau", "/init.server.luau", "/init.client.luau" } do
		if fs.isFile(path .. init) then
			return path .. init
		end
	end
	return nil
end

local makeNode

-- Узел дерева: похож на Instance (script, script.Parent, folder.Child)
function makeNode(path: string)
	if nodeCache[path] then
		return nodeCache[path]
	end
	local node = setmetatable({}, {
		__index = function(self, key)
			if key == "Parent" then
				local parentPath = string.match(path, "^(.*)/[^/]+$")
				return parentPath and makeNode(parentPath) or nil
			elseif key == "Name" then
				return string.match(path, "([^/]+)$")
			elseif key == "__path" then
				return path
			elseif key == "WaitForChild" or key == "FindFirstChild" then
				return function(_, name)
					return makeNode(path .. "/" .. name)
				end
			end
			return makeNode(path .. "/" .. key)
		end,
		__tostring = function()
			return "Node(" .. path .. ")"
		end,
	})
	nodeCache[path] = node
	return node
end

function Harness.require(node)
	local path = node.__path
	if cache[path] ~= nil then
		return cache[path]
	end
	local file = fileFor(path)
	assert(file, "Модуль не найден: " .. path)
	local source = fs.readFile(file)
	local env = {}
	for k, v in robloxGlobals do
		env[k] = v
	end
	for k, v in Harness.extraGlobals do
		env[k] = v
	end
	-- если модуль — init-файл, script указывает на папку
	local isInit = string.find(file, "/init%.") ~= nil
	env.script = if isInit then makeNode(path) else makeNode(path)
	env.require = function(target)
		if type(target) == "table" and target.__path then
			return Harness.require(target)
		end
		return require(target)
	end
	local fn = luau.load(source, { debugName = file, environment = env, injectGlobals = true })
	local result = fn()
	cache[path] = result
	return result
end

function Harness.shared(name: string)
	return Harness.require(makeNode(ROOT .. "/shared/" .. name))
end

function Harness.module(relPath: string)
	return Harness.require(makeNode(ROOT .. "/" .. relPath))
end

Harness.roblox = roblox

-- Мини-фреймворк тестов
local passed, failed = 0, 0
local failures = {}

function Harness.test(name: string, fn: () -> ())
	local ok, err = pcall(fn)
	if ok then
		passed += 1
	else
		failed += 1
		table.insert(failures, name .. ": " .. tostring(err))
	end
end

function Harness.eq(a, b, msg: string?)
	if a ~= b then
		error(string.format("%s: ожидали %s, получили %s", msg or "eq", tostring(b), tostring(a)), 2)
	end
end

function Harness.near(a: number, b: number, eps: number, msg: string?)
	if math.abs(a - b) > eps then
		error(string.format("%s: ожидали ≈%s, получили %s", msg or "near", tostring(b), tostring(a)), 2)
	end
end

function Harness.ok(cond, msg: string?)
	if not cond then
		error(msg or "условие не выполнено", 2)
	end
end

function Harness.finish()
	for _, f in failures do
		print("  ✗ " .. f)
	end
	print(string.format("Тесты: %d прошло, %d упало", passed, failed))
	return failed
end

return Harness
