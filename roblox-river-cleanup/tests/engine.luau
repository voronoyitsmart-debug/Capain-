--[[
	Мини-движок Roblox для тестов в Lune.

	Идея: свойства, иерархию, атрибуты и IsA даёт настоящий @lune/roblox
	(он проверяет имена свойств, типы и Enum по базе API Roblox). Поверх
	мы добавляем то, чего в Lune нет: события (Touched, Activated, ChildAdded…),
	виртуальное время и планировщик task.*, DataStore в памяти, сеть
	сервер ↔ клиент (RemoteEvent/RemoteFunction с копированием таблиц как в Roblox),
	камеру и Raycast, персонажей, Model:PivotTo/ScaleTo и т.д.

	Сервер и клиент выполняются в одном DataModel, но в разных окружениях
	(свои кэши require, RunService:IsServer() отвечает по-разному).
]]

local fs = require("@lune/fs")
local luau = require("@lune/luau")
local roblox = require("@lune/roblox")
local serde = require("@lune/serde")

local Engine = {}

local V3 = roblox.Vector3
local CF = roblox.CFrame

----------------------------------------------------------------------
-- Справочник классов (события, методы, ссылки, только-чтение)
----------------------------------------------------------------------
local api = serde.decode("json", fs.readFile("tests/fixtures/api-members.json")).Classes
local memberCache = {}

local function members(className: string)
	local cached = memberCache[className]
	if cached then
		return cached
	end
	local m = { events = {}, functions = {}, callbacks = {}, refs = {}, ro = {} }
	local current = className
	while current and api[current] do
		local entry = api[current]
		for _, n in entry.E or {} do
			m.events[n] = true
		end
		for _, n in entry.F or {} do
			m.functions[n] = true
		end
		for _, n in entry.C or {} do
			m.callbacks[n] = true
		end
		for _, n in entry.R or {} do
			m.refs[n] = true
		end
		for _, n in entry.RO or {} do
			m.ro[n] = true
		end
		current = entry.S
	end
	memberCache[className] = m
	return m
end

----------------------------------------------------------------------
-- Планировщик и виртуальное время
----------------------------------------------------------------------
local Sched = {
	start = 1700000000,
	now = 1700000000,
	sleepers = {},
	deferred = {},
	threadEnv = setmetatable({}, { __mode = "k" }),
	cancelled = setmetatable({}, { __mode = "k" }),
}
Engine.Sched = Sched
Engine.errors = {}
Engine.warnings = {}
Engine.logs = {}

local function currentEnv(): string
	local co = coroutine.running()
	return Sched.threadEnv[co] or "test"
end
Engine.currentEnv = currentEnv

local function report(err, co)
	local trace = if co then debug.traceback(co) else ""
	table.insert(Engine.errors, tostring(err) .. "\n" .. trace)
end

local function resume(co, ...)
	if Sched.cancelled[co] then
		return
	end
	local ok, err = coroutine.resume(co, ...)
	if not ok then
		report(err, co)
	end
end

function Sched.spawn(env: string, fn, ...)
	local co = if type(fn) == "thread" then fn else coroutine.create(fn)
	Sched.threadEnv[co] = env
	resume(co, ...)
	return co
end

function Sched.wait(t: number?): number
	local co = coroutine.running()
	if not Sched.threadEnv[co] then
		error("task.wait вызван вне потока движка", 2)
	end
	local started = Sched.now
	table.insert(Sched.sleepers, { co = co, wake = Sched.now + math.max(t or 0, 1 / 60) })
	coroutine.yield()
	return Sched.now - started
end

local taskLib = {}
function taskLib.spawn(fn, ...)
	return Sched.spawn(currentEnv(), fn, ...)
end
function taskLib.defer(fn, ...)
	local co = if type(fn) == "thread" then fn else coroutine.create(fn)
	Sched.threadEnv[co] = currentEnv()
	table.insert(Sched.deferred, { co = co, args = table.pack(...) })
	return co
end
function taskLib.delay(t, fn, ...)
	local args = table.pack(...)
	return Sched.spawn(currentEnv(), function()
		Sched.wait(t)
		fn(table.unpack(args, 1, args.n))
	end)
end
function taskLib.wait(t)
	return Sched.wait(t)
end
function taskLib.cancel(co)
	Sched.cancelled[co] = true
end

local frameHandlers = {} -- функции, вызываемые каждый кадр

function Engine.step(dt: number)
	Sched.now += dt
	for _, handler in frameHandlers do
		handler(dt)
	end
	local ready, rest = {}, {}
	for _, s in Sched.sleepers do
		if s.wake <= Sched.now + 1e-9 then
			table.insert(ready, s)
		else
			table.insert(rest, s)
		end
	end
	Sched.sleepers = rest
	table.sort(ready, function(a, b)
		return a.wake < b.wake
	end)
	for _, s in ready do
		if coroutine.status(s.co) == "suspended" then
			resume(s.co)
		end
	end
	local deferred = Sched.deferred
	Sched.deferred = {}
	for _, item in deferred do
		resume(item.co, table.unpack(item.args, 1, item.args.n))
	end
end

function Engine.advance(seconds: number, dt: number?)
	local stepSize = dt or 0.05
	local steps = math.max(1, math.ceil(seconds / stepSize))
	for _ = 1, steps do
		Engine.step(stepSize)
	end
end

-- Выполнить функцию в окружении env и крутить время, пока она не закончится
function Engine.run(env: string, fn, maxSeconds: number?)
	local done = false
	local results
	Sched.spawn(env, function()
		results = table.pack(fn())
		done = true
	end)
	local limit = Sched.now + (maxSeconds or 30)
	while not done and Sched.now < limit do
		Engine.step(0.05)
	end
	if not done then
		error("Engine.run: функция не завершилась за отведённое время", 2)
	end
	return table.unpack(results, 1, results.n)
end

----------------------------------------------------------------------
-- Сигналы
----------------------------------------------------------------------
local MockSignal = {}
MockSignal.__index = MockSignal

local function newSignal()
	return setmetatable({ conns = {} }, MockSignal)
end
Engine.newSignal = newSignal

function MockSignal:Connect(fn)
	local conn = { fn = fn, env = currentEnv(), Connected = true }
	table.insert(self.conns, conn)
	function conn.Disconnect(c)
		(c or conn).Connected = false
	end
	return conn
end

function MockSignal:Once(fn)
	local conn
	conn = self:Connect(function(...)
		conn.Connected = false
		fn(...)
	end)
	return conn
end

function MockSignal:Wait()
	local co = coroutine.running()
	local result
	local conn
	conn = self:Connect(function(...)
		conn.Connected = false
		result = table.pack(...)
		resume(co)
	end)
	coroutine.yield()
	return table.unpack(result, 1, result.n)
end

function MockSignal:Fire(...)
	for _, conn in table.clone(self.conns) do
		if conn.Connected then
			Sched.spawn(conn.env, conn.fn, ...)
		end
	end
end

function MockSignal:Count(): number
	local n = 0
	for _, conn in self.conns do
		if conn.Connected then
			n += 1
		end
	end
	return n
end

----------------------------------------------------------------------
-- Прокси над Instance
----------------------------------------------------------------------
local proxyOf = setmetatable({}, { __mode = "k" })
local shadows = setmetatable({}, { __mode = "k" })
local signals = setmetatable({}, { __mode = "k" })
local destroyed = setmetatable({}, { __mode = "k" })
local Proxy = {}

local function wrap(v)
	if typeof(v) == "Instance" then
		local p = proxyOf[v]
		if not p then
			p = setmetatable({ __real = v }, Proxy)
			proxyOf[v] = p
		end
		return p
	end
	return v
end
Engine.wrap = wrap

local function unwrap(v)
	if type(v) == "table" then
		local real = rawget(v, "__real")
		if real then
			return real
		end
	end
	return v
end
Engine.unwrap = unwrap

local function wrapList(list)
	local out = {}
	for i, v in list do
		out[i] = wrap(v)
	end
	return out
end

local function shadowOf(real)
	local s = shadows[real]
	if not s then
		s = {}
		shadows[real] = s
	end
	return s
end

local function signalOf(real, key: string)
	local list = signals[real]
	if not list then
		list = {}
		signals[real] = list
	end
	local s = list[key]
	if not s then
		s = newSignal()
		list[key] = s
	end
	return s
end

local function fire(real, key: string, ...)
	local list = signals[real]
	local s = list and list[key]
	if s then
		s:Fire(...)
	end
end
Engine.fire = function(inst, key, ...)
	fire(unwrap(inst), key, ...)
end
Engine.signal = function(inst, key)
	return signalOf(unwrap(inst), key)
end

-- Методы движка по классам (более конкретные — выше)
local Methods = {}
local methodOrder = {}
local function define(className: string, list)
	Methods[className] = list
	table.insert(methodOrder, className)
end
local methodCache = {}

local function findMethod(real, key: string)
	local className = real.ClassName
	local cacheKey = className .. "." .. key
	local cached = methodCache[cacheKey]
	if cached ~= nil then
		return cached or nil
	end
	for _, name in methodOrder do
		local list = Methods[name]
		if list[key] and real:IsA(name) then
			methodCache[cacheKey] = list[key]
			return list[key]
		end
	end
	methodCache[cacheKey] = false
	return nil
end

-- Свойства, которые считаем сами (в Lune их нет или они зависят от окружения)
local Getters = {}
local Setters = {}
local accessorCache = {}

-- Ищем Getters["Класс.Свойство"] по цепочке наследования
local function findAccessor(list, className: string, key: string)
	local cacheKey = tostring(list) .. className .. "." .. key
	local cached = accessorCache[cacheKey]
	if cached ~= nil then
		return cached or nil
	end
	local current = className
	while current and api[current] do
		local fn = list[current .. "." .. key]
		if fn then
			accessorCache[cacheKey] = fn
			return fn
		end
		current = api[current].S
	end
	accessorCache[cacheKey] = false
	return nil
end

local function fireParentEvents(real, oldParent, newParent, selfProxy)
	if oldParent then
		fire(oldParent, "ChildRemoved", selfProxy)
		local a = oldParent
		while a do
			fire(a, "DescendantRemoving", selfProxy)
			a = a.Parent
		end
	end
	if newParent then
		fire(newParent, "ChildAdded", selfProxy)
		local list = { real }
		for _, d in real:GetDescendants() do
			table.insert(list, d)
		end
		local a = newParent
		while a do
			if signals[a] and signals[a].DescendantAdded then
				for _, d in list do
					fire(a, "DescendantAdded", wrap(d))
				end
			end
			a = a.Parent
		end
	end
	fire(real, "AncestryChanged", selfProxy, wrap(newParent))
	fire(real, "#Parent")
end

Engine.usage = {}
local function note(kind: string, className: string, key: string)
	Engine.usage[kind .. ":" .. className .. "." .. key] = true
end

local function passthrough(real, fn, key)
	if key then
		note("call", real.ClassName, key)
	end
	return function(_, ...)
		local args = table.pack(...)
		for i = 1, args.n do
			args[i] = unwrap(args[i])
		end
		local results = table.pack(fn(real, table.unpack(args, 1, args.n)))
		for i = 1, results.n do
			local r = results[i]
			if type(r) == "table" and not rawget(r, "__real") then
				results[i] = wrapList(r)
			else
				results[i] = wrap(r)
			end
		end
		return table.unpack(results, 1, results.n)
	end
end

Proxy.__index = function(self, key)
	local real = rawget(self, "__real")
	if destroyed[real] then
		if key == "Parent" then
			return nil
		end
		local method = findMethod(real, key)
		if method then
			return method
		end
		local ok, value = pcall(function()
			return real[key]
		end)
		if ok and type(value) == "function" then
			return passthrough(real, value, key)
		end
		return if ok then wrap(value) else shadowOf(real)["@tomb_" .. key]
	end
	local method = findMethod(real, key)
	if method then
		note("call", real.ClassName, key)
		return method
	end
	local className = real.ClassName
	local m = members(className)
	if m.events[key] then
		if className == "RunService" then
			return signalOf(real, currentEnv() .. ":" .. key)
		end
		return signalOf(real, key)
	end
	local getter = findAccessor(Getters, className, key)
	if getter then
		local handled, value = getter(self, real)
		if handled then
			return value
		end
	end
	local shadow = shadows[real]
	if shadow and shadow[key] ~= nil then
		return shadow[key]
	end
	if m.callbacks[key] then
		return nil
	end
	local ok, value = pcall(function()
		return real[key]
	end)
	if ok then
		if type(value) == "function" then
			return passthrough(real, value, key)
		end
		note("get", className, key)
		return wrap(value)
	end
	if m.functions[key] then
		error(string.format("[движок] метод %s:%s не реализован в тестовом движке", className, key), 2)
	end
	error(tostring(value), 2)
end

Proxy.__newindex = function(self, key, value)
	local real = rawget(self, "__real")
	local className = real.ClassName
	local m = members(className)
	if destroyed[real] then
		if key == "Parent" then
			error("The Parent property of " .. real.Name .. " is locked (объект уничтожен)", 2)
		end
		return
	end
	if m.callbacks[key] then
		shadowOf(real)[key] = value
		return
	end
	local setter = findAccessor(Setters, className, key)
	if setter and setter(self, real, value) then
		fire(real, "#" .. key)
		return
	end
	if m.ro[key] then
		error(string.format("Свойство %s.%s только для чтения", className, key), 2)
	end
	if key == "Parent" then
		local raw = unwrap(value)
		if raw ~= nil and typeof(raw) ~= "Instance" then
			error("Parent должен быть Instance, а не " .. typeof(raw), 2)
		end
		if raw == real then
			error("Нельзя сделать объект родителем самого себя", 2)
		end
		local old = real.Parent
		if old == raw then
			return
		end
		real.Parent = raw
		fireParentEvents(real, old, raw, self)
		return
	end
	note("set", className, key)
	local raw = unwrap(value)
	if m.refs[key] and raw ~= nil and typeof(raw) ~= "Instance" then
		error(string.format("%s.%s ждёт Instance, а получил %s", className, key, typeof(raw)), 2)
	end
	local ok, err = pcall(function()
		real[key] = raw
	end)
	if not ok then
		error(string.format("%s.%s = %s: %s", className, key, tostring(raw), tostring(err)), 2)
	end
	fire(real, "#" .. key)
	fire(real, "Changed", key)
end

Proxy.__tostring = function(self)
	return rawget(self, "__real").Name
end

Proxy.__eq = function(a, b)
	return rawequal(unwrap(a), unwrap(b))
end

----------------------------------------------------------------------
-- Конструкторы и типы данных
----------------------------------------------------------------------
local InstanceAPI = {}
function InstanceAPI.new(className: string, parent)
	local real = roblox.Instance.new(className)
	local p = wrap(real)
	if parent then
		p.Parent = parent
	end
	return p
end

local TweenInfoMock = {}
local TweenInfoMT = { __type = "TweenInfo" }
TweenInfoMT.__index = TweenInfoMT
function TweenInfoMock.new(time, style, direction, repeatCount, reverses, delayTime)
	assert(time == nil or type(time) == "number", "TweenInfo.new: время должно быть числом")
	if style ~= nil then
		assert(typeof(style) == "EnumItem" and style.EnumType == roblox.Enum.EasingStyle, "TweenInfo: плохой EasingStyle")
	end
	if direction ~= nil then
		assert(typeof(direction) == "EnumItem" and direction.EnumType == roblox.Enum.EasingDirection, "TweenInfo: плохой EasingDirection")
	end
	return setmetatable({ Time = time or 1, EasingStyle = style, EasingDirection = direction, DelayTime = delayTime or 0 }, TweenInfoMT)
end

local RaycastParamsMock = {}
local RaycastParamsMT = { __type = "RaycastParams" }
function RaycastParamsMock.new()
	return setmetatable({
		FilterType = roblox.Enum.RaycastFilterType.Exclude,
		FilterDescendantsInstances = {},
		IgnoreWater = false,
	}, RaycastParamsMT)
end

local RandomMock = {}
RandomMock.__index = RandomMock
RandomMock.__type = "Random"
local seedCounter = 12345
function RandomMock.new(seed: number?)
	seedCounter += 7919
	local s = math.floor(seed or seedCounter) % 2147483647
	if s <= 0 then
		s += 2147483646
	end
	return setmetatable({ state = s }, RandomMock)
end
function RandomMock:_next(): number
	self.state = (self.state * 48271) % 2147483647
	return self.state / 2147483647
end
function RandomMock:NextNumber(a: number?, b: number?): number
	local lo, hi = a or 0, b or 1
	return lo + (hi - lo) * self:_next()
end
function RandomMock:NextInteger(a: number, b: number): number
	assert(type(a) == "number" and type(b) == "number", "NextInteger: нужны два числа")
	return math.floor(a + (b - a + 1) * self:_next())
end

local function typeofMock(v)
	if type(v) == "table" then
		if rawget(v, "__real") then
			return "Instance"
		end
		local mt = getmetatable(v)
		if type(mt) == "table" and rawget(mt, "__type") then
			return mt.__type
		end
	end
	return typeof(v)
end

----------------------------------------------------------------------
-- Копирование данных через Remote (как сериализация в Roblox)
----------------------------------------------------------------------
local function remoteCopy(v, path: string?)
	local t = type(v)
	local where = path or "аргумент"
	if t == "function" or t == "thread" then
		error("Через Remote нельзя передать " .. t .. " (" .. where .. ")", 3)
	end
	if t ~= "table" or rawget(v, "__real") then
		return v
	end
	local n = #v
	local hashKeys = false
	for k in v do
		if type(k) == "number" and k >= 1 and k <= n and k % 1 == 0 then
			continue
		end
		hashKeys = true
		if type(k) ~= "string" then
			error("Через Remote: ключ словаря не строка (" .. where .. "." .. tostring(k) .. ") — Roblox его потеряет", 3)
		end
	end
	if n > 0 and hashKeys then
		error("Через Remote: смешанная таблица (массив + словарь) в " .. where, 3)
	end
	local out = {}
	for k, val in v do
		out[k] = remoteCopy(val, where .. "." .. tostring(k))
	end
	return out
end
Engine.remoteCopy = remoteCopy

local function copyArgs(...)
	local args = table.pack(...)
	for i = 1, args.n do
		args[i] = remoteCopy(args[i], "аргумент " .. i)
	end
	return args
end

-- Проверка, что данные можно сохранить в DataStore (только JSON-совместимое)
local function jsonCheck(v, path: string)
	local t = type(v)
	if t == "number" then
		if v ~= v or v == math.huge or v == -math.huge then
			error("DataStore: число NaN/inf в " .. path)
		end
		return
	elseif t == "string" or t == "boolean" or v == nil then
		return
	elseif t ~= "table" then
		error("DataStore: нельзя сохранить " .. typeofMock(v) .. " в " .. path)
	end
	local n = #v
	local hash = false
	for k in v do
		if not (type(k) == "number" and k >= 1 and k <= n and k % 1 == 0) then
			hash = true
			if type(k) ~= "string" then
				error("DataStore: ключ не строка в " .. path .. ": " .. tostring(k))
			end
		end
	end
	if n > 0 and hash then
		error("DataStore: смешанная таблица в " .. path)
	end
	for k, val in v do
		jsonCheck(val, path .. "." .. tostring(k))
	end
end
Engine.jsonCheck = jsonCheck

----------------------------------------------------------------------
-- DataStore в памяти
----------------------------------------------------------------------
Engine.stores = {}
Engine.dataStoreMode = "ok" -- "ok" | "fail"
Engine.dataStoreCalls = 0

local function deepCopy(v)
	if type(v) ~= "table" then
		return v
	end
	local out = {}
	for k, val in v do
		out[k] = deepCopy(val)
	end
	return out
end

local function storeFor(name: string, ordered: boolean)
	local s = Engine.stores[name]
	if not s then
		s = { data = {}, ordered = ordered }
		Engine.stores[name] = s
	end
	local function check()
		if Engine.dataStoreMode == "fail" then
			error("StudioAccessToApisNotAllowed: 403 Studio access to APIs is not allowed", 3)
		end
		Engine.dataStoreCalls += 1
		Sched.wait(0.05)
	end
	local api = {}
	function api.GetAsync(_, key)
		check()
		local raw = s.data[key]
		return if raw then serde.decode("json", raw) else nil
	end
	function api.SetAsync(_, key, value)
		check()
		if ordered then
			assert(type(value) == "number" and value % 1 == 0, "OrderedDataStore: значение должно быть целым числом")
		end
		jsonCheck(value, key)
		s.data[key] = serde.encode("json", value)
	end
	function api.UpdateAsync(_, key, transform)
		check()
		local raw = s.data[key]
		local old = if raw then serde.decode("json", raw) else nil
		local new = transform(deepCopy(old))
		if new == nil then
			return nil
		end
		jsonCheck(new, key)
		s.data[key] = serde.encode("json", new)
		return serde.decode("json", s.data[key])
	end
	function api.RemoveAsync(_, key)
		check()
		s.data[key] = nil
	end
	function api.GetSortedAsync(_, ascending, pageSize)
		check()
		local entries = {}
		for key, raw in s.data do
			table.insert(entries, { key = key, value = serde.decode("json", raw) })
		end
		table.sort(entries, function(a, b)
			if ascending then
				return a.value < b.value
			end
			return a.value > b.value
		end)
		local page = {}
		for i = 1, math.min(pageSize, #entries) do
			page[i] = entries[i]
		end
		return {
			IsFinished = true,
			GetCurrentPage = function()
				return page
			end,
		}
	end
	return api
end

function Engine.readStore(name: string, key: string)
	local s = Engine.stores[name]
	local raw = s and s.data[key]
	return if raw then serde.decode("json", raw) else nil
end

----------------------------------------------------------------------
-- Окружения: server / client
----------------------------------------------------------------------
local game -- прокси DataModel
local envs = {}
Engine.envs = envs
Engine.studio = true
Engine.kicks = {}
Engine.terrainFills = 0
Engine.bindToClose = {}

local requireCache = {}

local function loadModule(envName: string, moduleProxy)
	local real = unwrap(moduleProxy)
	if typeof(real) ~= "Instance" or not real:IsA("ModuleScript") then
		error("require: ожидали ModuleScript, получили " .. tostring(moduleProxy), 3)
	end
	local cache = requireCache[envName]
	if not cache then
		cache = {}
		requireCache[envName] = cache
	end
	local entry = cache[real]
	if entry then
		if entry.loading then
			error("Циклический require: " .. real:GetFullName(), 3)
		end
		return entry.value
	end
	entry = { loading = true }
	cache[real] = entry
	local env = envs[envName]
	local moduleEnv = setmetatable({ script = moduleProxy }, { __index = env.globals })
	local fn = luau.load(real.Source, { debugName = real:GetFullName(), environment = moduleEnv, injectGlobals = false })
	local value = fn()
	entry.value = value
	entry.loading = false
	return value
end

local function makeGlobals(envName: string)
	local osMock = {
		time = function(t)
			if t then
				return os.time(t)
			end
			return math.floor(Sched.now)
		end,
		clock = function()
			return Sched.now - Sched.start
		end,
		date = os.date,
		difftime = function(a, b)
			return a - b
		end,
	}
	return {
		game = game,
		workspace = game.Workspace,
		Instance = InstanceAPI,
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
		Ray = roblox.Ray,
		BrickColor = roblox.BrickColor,
		Font = roblox.Font,
		PhysicalProperties = roblox.PhysicalProperties,
		TweenInfo = TweenInfoMock,
		RaycastParams = RaycastParamsMock,
		Random = RandomMock,
		task = taskLib,
		os = osMock,
		tick = function()
			return Sched.now
		end,
		time = function()
			return Sched.now - Sched.start
		end,
		typeof = typeofMock,
		require = function(target)
			return loadModule(envName, target)
		end,
		print = function(...)
			local parts = {}
			for i = 1, select("#", ...) do
				parts[i] = tostring((select(i, ...)))
			end
			table.insert(Engine.logs, "[" .. envName .. "] " .. table.concat(parts, " "))
		end,
		warn = function(...)
			local parts = {}
			for i = 1, select("#", ...) do
				parts[i] = tostring((select(i, ...)))
			end
			table.insert(Engine.warnings, "[" .. envName .. "] " .. table.concat(parts, " "))
		end,
		math = math,
		string = string,
		table = table,
		coroutine = coroutine,
		utf8 = utf8,
		bit32 = bit32,
		buffer = buffer,
		debug = debug,
		pairs = pairs,
		ipairs = ipairs,
		next = next,
		select = select,
		type = type,
		tostring = tostring,
		tonumber = tonumber,
		pcall = pcall,
		xpcall = xpcall,
		error = error,
		assert = assert,
		setmetatable = setmetatable,
		getmetatable = getmetatable,
		rawget = rawget,
		rawset = rawset,
		rawequal = rawequal,
		rawlen = rawlen,
		unpack = table.unpack,
		newproxy = newproxy,
	}
end

----------------------------------------------------------------------
-- Методы движка
----------------------------------------------------------------------
local function isProxy(v)
	return type(v) == "table" and rawget(v, "__real") ~= nil
end

local function descendantsParts(real)
	local list = {}
	if real:IsA("BasePart") then
		table.insert(list, real)
	end
	for _, d in real:GetDescendants() do
		if d:IsA("BasePart") then
			table.insert(list, d)
		end
	end
	return list
end

local function modelPivot(real)
	local primary = real.PrimaryPart
	if primary then
		return primary.CFrame
	end
	local s = shadowOf(real)
	if s.Pivot then
		return s.Pivot
	end
	local parts = descendantsParts(real)
	if #parts == 0 then
		return CF.identity
	end
	local sum = V3.zero
	for _, p in parts do
		sum += p.Position
	end
	return CF.new(sum / #parts)
end

local function boundingBox(real)
	local parts = descendantsParts(real)
	if #parts == 0 then
		return CF.identity, V3.zero
	end
	local minV = V3.new(math.huge, math.huge, math.huge)
	local maxV = -minV
	for _, p in parts do
		local half = p.Size / 2
		for _, sx in { -1, 1 } do
			for _, sy in { -1, 1 } do
				for _, sz in { -1, 1 } do
					local corner = p.CFrame * V3.new(half.X * sx, half.Y * sy, half.Z * sz)
					minV = minV:Min(corner)
					maxV = maxV:Max(corner)
				end
			end
		end
	end
	return CF.new((minV + maxV) / 2), maxV - minV
end

local function rayBox(origin, dir, cframe, size)
	local o = cframe:PointToObjectSpace(origin)
	local d = cframe:VectorToObjectSpace(dir)
	local half = size / 2
	local tmin, tmax = -math.huge, math.huge
	for _, axis in { "X", "Y", "Z" } do
		local oa, da, ha = o[axis], d[axis], half[axis]
		if math.abs(da) < 1e-9 then
			if oa < -ha or oa > ha then
				return nil
			end
		else
			local t1, t2 = (-ha - oa) / da, (ha - oa) / da
			if t1 > t2 then
				t1, t2 = t2, t1
			end
			tmin = math.max(tmin, t1)
			tmax = math.min(tmax, t2)
			if tmin > tmax then
				return nil
			end
		end
	end
	if tmax < 0 then
		return nil
	end
	return math.max(tmin, 0)
end

Engine.camera = { viewport = roblox.Vector2.new(1280, 720) }

local function cameraBasis(real)
	local vp = Engine.camera.viewport
	local fov = math.rad(real.FieldOfView)
	local tanY = math.tan(fov / 2)
	local tanX = tanY * vp.X / vp.Y
	return real.CFrame, vp, tanX, tanY
end

define("Model", {
	GetPivot = function(self)
		return modelPivot(unwrap(self))
	end,
	PivotTo = function(self, cframe)
		assert(typeof(cframe) == "CFrame", "PivotTo ждёт CFrame")
		local real = unwrap(self)
		local delta = cframe * modelPivot(real):Inverse()
		for _, p in descendantsParts(real) do
			p.CFrame = delta * p.CFrame
		end
		if not real.PrimaryPart then
			shadowOf(real).Pivot = cframe
		end
	end,
	GetBoundingBox = function(self)
		return boundingBox(unwrap(self))
	end,
	GetExtentsSize = function(self)
		local _, size = boundingBox(unwrap(self))
		return size
	end,
	GetScale = function(self)
		return shadowOf(unwrap(self)).Scale or 1
	end,
	ScaleTo = function(self, scale)
		assert(type(scale) == "number" and scale > 0, "ScaleTo ждёт положительное число")
		local real = unwrap(self)
		local s = shadowOf(real)
		local factor = scale / (s.Scale or 1)
		local pivot = modelPivot(real)
		for _, p in descendantsParts(real) do
			local rel = pivot:ToObjectSpace(p.CFrame)
			p.Size = p.Size * factor
			p.CFrame = pivot * CF.new(rel.Position * factor) * rel.Rotation
		end
		s.Scale = scale
	end,
})

define("BasePart", {
	GetPivot = function(self)
		return unwrap(self).CFrame
	end,
	PivotTo = function(self, cframe)
		unwrap(self).CFrame = cframe
	end,
})

define("Workspace", {
	GetServerTimeNow = function()
		return Sched.now
	end,
	BulkMoveTo = function(_, parts, cframes)
		assert(#parts == #cframes, "BulkMoveTo: разное количество деталей и CFrame")
		for i, p in parts do
			local real = unwrap(p)
			assert(typeof(real) == "Instance" and real:IsA("BasePart"), "BulkMoveTo: не деталь")
			if not destroyed[real] then
				real.CFrame = cframes[i]
			end
		end
	end,
	Raycast = function(self, origin, direction, params)
		assert(typeof(origin) == "Vector3" and typeof(direction) == "Vector3", "Raycast ждёт Vector3")
		local candidates = {}
		local include = params and params.FilterType == roblox.Enum.RaycastFilterType.Include
		if include then
			for _, inst in params.FilterDescendantsInstances do
				for _, p in descendantsParts(unwrap(inst)) do
					table.insert(candidates, p)
				end
			end
		else
			local excluded = {}
			for _, inst in (params and params.FilterDescendantsInstances or {}) do
				excluded[unwrap(inst)] = true
			end
			for _, p in descendantsParts(unwrap(self)) do
				local skip = false
				local a = p
				while a do
					if excluded[a] then
						skip = true
						break
					end
					a = a.Parent
				end
				if not skip then
					table.insert(candidates, p)
				end
			end
		end
		local best, bestT = nil, math.huge
		for _, p in candidates do
			if p.CanQuery and not destroyed[p] then
				local t = rayBox(origin, direction, p.CFrame, p.Size)
				if t and t <= 1 and t < bestT then
					best, bestT = p, t
				end
			end
		end
		if not best then
			return nil
		end
		return {
			Instance = wrap(best),
			Position = origin + direction * bestT,
			Distance = direction.Magnitude * bestT,
			Normal = V3.yAxis,
			Material = best.Material,
		}
	end,
})

define("Terrain", {
	FillBlock = function(_, cframe, size, material)
		assert(typeof(cframe) == "CFrame", "FillBlock: первый аргумент CFrame")
		assert(typeof(size) == "Vector3", "FillBlock: второй аргумент Vector3")
		assert(typeof(material) == "EnumItem" and material.EnumType == roblox.Enum.Material, "FillBlock: нужен Enum.Material")
		Engine.terrainFills += 1
		if Engine.recordTerrain then
			local p = cframe.Position
			table.insert(Engine.recordTerrain, { p.X, p.Y, p.Z, size.X, size.Y, size.Z, material.Name })
		end
	end,
	SetMaterialColor = function(_, material, color)
		assert(typeof(material) == "EnumItem" and typeof(color) == "Color3", "SetMaterialColor: плохие аргументы")
	end,
})

define("Camera", {
	ScreenPointToRay = function(self, x, y)
		local cf, vp, tanX, tanY = cameraBasis(unwrap(self))
		local nx = (x / vp.X) * 2 - 1
		local ny = 1 - (y / vp.Y) * 2
		local dir = (cf.LookVector + cf.RightVector * nx * tanX + cf.UpVector * ny * tanY).Unit
		return roblox.Ray.new(cf.Position, dir)
	end,
	WorldToScreenPoint = function(self, pos)
		local cf, vp, tanX, tanY = cameraBasis(unwrap(self))
		local rel = cf:PointToObjectSpace(pos)
		local depth = -rel.Z
		if depth <= 0 then
			return V3.new(0, 0, depth), false
		end
		local x = (rel.X / (depth * tanX) + 1) / 2 * vp.X
		local y = (1 - rel.Y / (depth * tanY)) / 2 * vp.Y
		return V3.new(x, y, depth), x >= 0 and x <= vp.X and y >= 0 and y <= vp.Y
	end,
})

define("DataModel", {
	GetService = function(self, name)
		local real = unwrap(self)
		local existing = real:FindFirstChildOfClass(name)
		if existing then
			return wrap(existing)
		end
		local service = roblox.Instance.new(name)
		service.Parent = real
		return wrap(service)
	end,
	BindToClose = function(_, fn)
		table.insert(Engine.bindToClose, fn)
	end,
})

define("Players", {
	GetPlayers = function(self)
		local list = {}
		for _, c in unwrap(self):GetChildren() do
			if c:IsA("Player") then
				table.insert(list, wrap(c))
			end
		end
		return list
	end,
	GetPlayerFromCharacter = function(self, model)
		local raw = unwrap(model)
		if raw == nil then
			return nil
		end
		for _, c in unwrap(self):GetChildren() do
			if c:IsA("Player") and c.Character == raw then
				return wrap(c)
			end
		end
		return nil
	end,
	GetPlayerByUserId = function(self, id)
		for _, c in unwrap(self):GetChildren() do
			if c:IsA("Player") and c.UserId == id then
				return wrap(c)
			end
		end
		return nil
	end,
	GetNameFromUserIdAsync = function(_, id)
		Sched.wait(0.05)
		return "User" .. tostring(id)
	end,
})

define("Player", {
	LoadCharacter = function(self)
		Engine.loadCharacter(self)
	end,
	LoadCharacterAsync = function(self)
		Engine.loadCharacter(self)
	end,
	Kick = function(self, message)
		table.insert(Engine.kicks, { player = self.Name, message = message })
		Engine.removePlayer(self)
	end,
})

local function remoteTargets(kind: string)
	return kind
end

define("RemoteEvent", {
	FireServer = function(self, ...)
		local args = copyArgs(...)
		local player = envs.client and envs.client.player
		fire(unwrap(self), "OnServerEvent", player, table.unpack(args, 1, args.n))
	end,
	FireClient = function(self, player, ...)
		assert(isProxy(player) and unwrap(player):IsA("Player"), "FireClient: первый аргумент должен быть Player")
		local args = copyArgs(...)
		if envs.client and envs.client.player == player then
			fire(unwrap(self), "OnClientEvent", table.unpack(args, 1, args.n))
		end
	end,
	FireAllClients = function(self, ...)
		local args = copyArgs(...)
		fire(unwrap(self), "OnClientEvent", table.unpack(args, 1, args.n))
	end,
})
Methods.UnreliableRemoteEvent = Methods.RemoteEvent
table.insert(methodOrder, 1, "UnreliableRemoteEvent")

define("RemoteFunction", {
	InvokeServer = function(self, ...)
		local real = unwrap(self)
		local handler = shadowOf(real).OnServerInvoke
		assert(handler, "InvokeServer: на сервере нет OnServerInvoke")
		local args = copyArgs(...)
		local player = envs.client and envs.client.player
		local done, results = false, nil
		local caller = coroutine.running()
		Sched.spawn("server", function()
			results = table.pack(handler(player, table.unpack(args, 1, args.n)))
			done = true
			if coroutine.status(caller) == "suspended" then
				resume(caller)
			end
		end)
		if not done then
			coroutine.yield()
		end
		for i = 1, results.n do
			results[i] = remoteCopy(results[i], "ответ " .. i)
		end
		return table.unpack(results, 1, results.n)
	end,
})

define("TweenService", {
	Create = function(_, inst, info, props)
		assert(isProxy(inst), "TweenService:Create: первый аргумент — Instance")
		assert(typeofMock(info) == "TweenInfo", "TweenService:Create: второй аргумент — TweenInfo")
		for key in props do
			local _ = inst[key] -- свойство должно существовать
		end
		local completed = newSignal()
		local tween = { Completed = completed }
		function tween.Play()
			local env = currentEnv()
			Sched.spawn(env, function()
				Sched.wait(info.Time + (info.DelayTime or 0))
				if not destroyed[unwrap(inst)] then
					for key, value in props do
						inst[key] = value
					end
				end
				completed:Fire(roblox.Enum.PlaybackState.Completed)
			end)
		end
		function tween.Cancel() end
		function tween.Pause() end
		return tween
	end,
})

local guidCounter = 0
define("HttpService", {
	GenerateGUID = function(_, wrapBraces)
		guidCounter += 1
		local id = string.format("00000000-0000-0000-0000-%012d", guidCounter)
		return if wrapBraces == false then id else "{" .. id .. "}"
	end,
	JSONEncode = function(_, value)
		return serde.encode("json", value)
	end,
	JSONDecode = function(_, text)
		return serde.decode("json", text)
	end,
})

define("DataStoreService", {
	GetDataStore = function(_, name)
		return storeFor("DS:" .. name, false)
	end,
	GetOrderedDataStore = function(_, name)
		return storeFor("ODS:" .. name, true)
	end,
})

define("SoundService", {
	PlayLocalSound = function(_, sound)
		assert(isProxy(sound) and unwrap(sound):IsA("Sound"), "PlayLocalSound ждёт Sound")
	end,
})

define("Sound", {
	Play = function(self)
		shadowOf(unwrap(self)).IsPlaying = true
	end,
	Stop = function(self)
		shadowOf(unwrap(self)).IsPlaying = false
	end,
	Pause = function() end,
	Resume = function() end,
})

define("ParticleEmitter", {
	Emit = function(_, count)
		assert(count == nil or type(count) == "number", "Emit ждёт число")
	end,
	Clear = function() end,
})

define("GuiService", {
	GetGuiInset = function()
		return roblox.Vector2.new(0, 36), roblox.Vector2.new(0, 0)
	end,
})

define("StarterGui", {
	SetCoreGuiEnabled = function(_, coreType, enabled)
		assert(typeof(coreType) == "EnumItem" and type(enabled) == "boolean", "SetCoreGuiEnabled: плохие аргументы")
	end,
	SetCore = function() end,
})

define("UserInputService", {
	GetMouseLocation = function()
		return roblox.Vector2.new(640, 360)
	end,
})

define("RunService", {
	IsServer = function()
		return currentEnv() == "server"
	end,
	IsClient = function()
		return currentEnv() == "client"
	end,
	IsStudio = function()
		return Engine.studio
	end,
	IsRunning = function()
		return true
	end,
})

define("Instance", {
	WaitForChild = function(self, name, timeout)
		local real = unwrap(self)
		local limit = Sched.now + (timeout or 20)
		while true do
			local child = real:FindFirstChild(name)
			if child then
				return wrap(child)
			end
			if Sched.now >= limit then
				if timeout then
					return nil
				end
				error("WaitForChild: так и не появился «" .. name .. "» в " .. real:GetFullName(), 2)
			end
			Sched.wait(0.05)
		end
	end,
	SetAttribute = function(self, name, value)
		local real = unwrap(self)
		assert(type(name) == "string", "SetAttribute: имя должно быть строкой")
		local raw = unwrap(value)
		local old = real:GetAttribute(name)
		real:SetAttribute(name, raw)
		if old ~= raw then
			fire(real, "@" .. name)
			fire(real, "AttributeChanged", name)
		end
	end,
	GetAttributeChangedSignal = function(self, name)
		return signalOf(unwrap(self), "@" .. name)
	end,
	GetPropertyChangedSignal = function(self, name)
		local real = unwrap(self)
		local ok = pcall(function()
			return self[name]
		end)
		assert(ok, "GetPropertyChangedSignal: у " .. real.ClassName .. " нет свойства " .. tostring(name))
		return signalOf(real, "#" .. name)
	end,
	Destroy = function(self)
		local real = unwrap(self)
		if destroyed[real] then
			return
		end
		local function bury(inst)
			for _, child in inst:GetChildren() do
				bury(child)
				child.Parent = nil
			end
			fire(inst, "Destroying")
			local tomb = shadowOf(inst)
			for _, key in { "Name", "ClassName" } do
				tomb["@tomb_" .. key] = inst[key]
			end
			destroyed[inst] = true
		end
		local parent = real.Parent
		if parent then
			fireParentEvents(real, parent, nil, self)
		end
		bury(real)
		real.Parent = nil
	end,
	ClearAllChildren = function(self)
		for _, child in unwrap(self):GetChildren() do
			wrap(child):Destroy()
		end
	end,
	Clone = function(self)
		return wrap(unwrap(self):Clone())
	end,
	FindFirstAncestorOfClass = function(self, className)
		local a = unwrap(self).Parent
		while a do
			if a.ClassName == className then
				return wrap(a)
			end
			a = a.Parent
		end
		return nil
	end,
	FindFirstAncestorWhichIsA = function(self, className)
		local a = unwrap(self).Parent
		while a do
			if a:IsA(className) then
				return wrap(a)
			end
			a = a.Parent
		end
		return nil
	end,
	FindFirstChildWhichIsA = function(self, className)
		for _, c in unwrap(self):GetChildren() do
			if c:IsA(className) then
				return wrap(c)
			end
		end
		return nil
	end,
	IsDescendantOf = function(self, other)
		local target = unwrap(other)
		local a = unwrap(self).Parent
		while a do
			if a == target then
				return true
			end
			a = a.Parent
		end
		return false
	end,
})

-- Свойства, зависящие от окружения или отсутствующие в Lune
Getters["Players.LocalPlayer"] = function()
	local env = envs[currentEnv()]
	return true, env and env.player or nil
end
Getters["DataModel.JobId"] = function()
	return true, ""
end
Getters["Camera.ViewportSize"] = function()
	return true, Engine.camera.viewport
end
Getters["UserInputService.TouchEnabled"] = function()
	return true, false
end
Getters["UserInputService.MouseEnabled"] = function()
	return true, true
end
Getters["Sound.IsPlaying"] = function(_, real)
	return true, shadowOf(real).IsPlaying == true
end
Getters["BasePart.Position"] = function(_, real)
	return true, real.CFrame.Position
end
Setters["BasePart.Position"] = function(_, real, value)
	assert(typeof(value) == "Vector3", "Position ждёт Vector3")
	real.CFrame = CF.new(value) * real.CFrame.Rotation
	return true
end
Getters["BasePart.Orientation"] = function(_, real)
	local x, y, z = real.CFrame:ToOrientation()
	return true, V3.new(math.deg(x), math.deg(y), math.deg(z))
end
Getters["BasePart.AssemblyLinearVelocity"] = function()
	return true, V3.zero
end
Getters["Model.WorldPivot"] = function(_, real)
	return true, modelPivot(real)
end

----------------------------------------------------------------------
-- Игроки и персонажи
----------------------------------------------------------------------
function Engine.loadCharacter(playerProxy)
	local old = playerProxy.Character
	if old then
		old:Destroy()
	end
	local model = InstanceAPI.new("Model")
	model.Name = playerProxy.Name
	local root = InstanceAPI.new("Part")
	root.Name = "HumanoidRootPart"
	root.Size = V3.new(2, 2, 1)
	root.Parent = model
	local head = InstanceAPI.new("Part")
	head.Name = "Head"
	head.Size = V3.new(2, 1, 1)
	head.Parent = model
	local humanoid = InstanceAPI.new("Humanoid")
	humanoid.Parent = model
	model.PrimaryPart = root

	local spawnCF = CF.new(0, 3, 0)
	for _, d in unwrap(game.Workspace):GetDescendants() do
		if d:IsA("SpawnLocation") then
			spawnCF = d.CFrame + V3.new(0, 3.5, 0)
			break
		end
	end
	root.CFrame = spawnCF
	head.CFrame = spawnCF + V3.new(0, 1.5, 0)
	playerProxy.Character = model
	model.Parent = game.Workspace
	fire(unwrap(playerProxy), "CharacterAdded", model)
	return model
end

function Engine.addPlayer(name: string, userId: number, isClient: boolean?)
	local players = game:GetService("Players")
	local player = InstanceAPI.new("Player")
	player.Name = name
	player.DisplayName = name
	player.UserId = userId
	local gui = InstanceAPI.new("PlayerGui")
	gui.Parent = player
	if isClient and envs.client then
		envs.client.player = player
	end
	player.Parent = players
	fire(unwrap(players), "PlayerAdded", player)
	return player
end

function Engine.removePlayer(player)
	local players = game:GetService("Players")
	fire(unwrap(players), "PlayerRemoving", player)
	local character = player.Character
	if character then
		character:Destroy()
	end
	player.Parent = nil
end

----------------------------------------------------------------------
-- Запуск места
----------------------------------------------------------------------
function Engine.loadPlace(path: string)
	local place = roblox.deserializePlace(fs.readFile(path))
	game = wrap(place)
	Engine.game = game
	local workspaceReal = place:FindFirstChildOfClass("Workspace")
	if not workspaceReal:FindFirstChildOfClass("Terrain") then
		local terrain = roblox.Instance.new("Terrain")
		terrain.Name = "Terrain"
		terrain.Parent = workspaceReal
	end
	envs.server = { name = "server", globals = makeGlobals("server") }
	envs.client = { name = "client", globals = makeGlobals("client"), player = nil }

	-- сигналы кадров
	local runService = game:GetService("RunService")
	local runReal = unwrap(runService)
	table.insert(frameHandlers, function(dt)
		fire(runReal, "server:Stepped", Sched.now - Sched.start, dt)
		fire(runReal, "server:Heartbeat", dt)
		fire(runReal, "client:RenderStepped", dt)
		fire(runReal, "client:Stepped", Sched.now - Sched.start, dt)
		fire(runReal, "client:Heartbeat", dt)
	end)
	return game
end

function Engine.runScript(envName: string, scriptProxy)
	local real = unwrap(scriptProxy)
	local env = envs[envName]
	local scriptEnv = setmetatable({ script = scriptProxy }, { __index = env.globals })
	local fn = luau.load(real.Source, { debugName = real:GetFullName(), environment = scriptEnv, injectGlobals = false })
	return Sched.spawn(envName, fn)
end

function Engine.require(envName: string, moduleProxy)
	local result
	Engine.run(envName, function()
		result = loadModule(envName, moduleProxy)
	end)
	return result
end

function Engine.shutdown()
	for _, fn in Engine.bindToClose do
		Sched.spawn("server", fn)
	end
	Engine.advance(3)
end

function Engine.takeErrors()
	local list = Engine.errors
	Engine.errors = {}
	return list
end

function Engine.takeWarnings()
	local list = Engine.warnings
	Engine.warnings = {}
	return list
end

-- Тестовый InputObject
function Engine.input(kind, x: number?, y: number?)
	return {
		UserInputType = kind,
		UserInputState = roblox.Enum.UserInputState.Begin,
		Position = V3.new(x or 0, y or 0, 0),
		Delta = V3.zero,
	}
end

Engine.remoteTargets = remoteTargets
return Engine
