--[[
	State — данные игрока на клиенте (присылает сервер) и общие сигналы.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Formulas = require(Shared.Formulas)
local Remotes = require(Shared.Remotes)
local Signal = require(Shared.Signal)

local State = {}

State.Data = nil :: any
State.Meta = {} :: { [string]: any }
State.Changed = Signal.new() -- (data, oldData)
State.Sold = Signal.new() -- (coins, items)
State.Collected = Signal.new() -- (key, shiny)
State.SettingChanged = Signal.new() -- (name, value)

function State.init()
	Remotes.get("State").OnClientEvent:Connect(function(data, meta)
		local old = State.Data
		State.Data = data
		State.Meta = meta or {}
		State.Changed:Fire(data, old)
	end)
	-- на случай, если сервер прислал данные раньше, чем мы подписались
	task.spawn(function()
		local remote = Remotes.get("Request")
		pcall(remote.InvokeServer, remote, "Sync")
	end)
end

function State.ready(): boolean
	return State.Data ~= nil
end

function State.waitReady()
	while not State.Data do
		task.wait(0.1)
	end
	return State.Data
end

function State.now(): number
	return workspace:GetServerTimeNow()
end

function State.event(): (string?, number)
	local id = ReplicatedStorage:GetAttribute("EventId")
	local ends = ReplicatedStorage:GetAttribute("EventEndsAt") or 0
	if type(id) == "string" and id ~= "" and ends > State.now() then
		return id, ends
	end
	return nil, 0
end

function State.stats()
	if not State.Data then
		return nil
	end
	return Formulas.getStats(State.Data, State.now(), (State.event()))
end

function State.setting(name: string): boolean
	local data = State.Data
	if not data or not data.Settings then
		return true
	end
	return data.Settings[name] ~= false
end

function State.perk(name: string): number
	local data = State.Data
	return data and data.Perks and data.Perks[name] or 0
end

return State
