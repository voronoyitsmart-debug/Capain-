--[[
	ClientNet — запросы к серверу с показом ответа во всплывающем сообщении.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Remotes = require(Shared.Remotes)

local ClientNet = {}

local RequestRemote = Remotes.get("Request")
local CollectRemote = Remotes.get("Collect")
local notifier: ((string, string) -> ())? = nil
local busy: { [string]: boolean } = {}

function ClientNet.setNotifier(fn: (string, string) -> ())
	notifier = fn
end

-- Возвращает (ok, сообщение). quiet = true — не показывать сообщение
function ClientNet.request(action: string, ...): (boolean, string?)
	if busy[action] then
		return false, nil
	end
	busy[action] = true
	local ok, result = pcall(RequestRemote.InvokeServer, RequestRemote, action, ...)
	busy[action] = nil
	if not ok then
		if notifier then
			notifier("Нет связи с сервером…", "error")
		end
		return false, nil
	end
	if type(result) ~= "table" then
		return false, nil
	end
	if result.msg and notifier then
		notifier(result.msg, if result.ok then "success" else "error")
	end
	return result.ok == true, result.msg
end

function ClientNet.quiet(action: string, ...): boolean
	local ok, result = pcall(RequestRemote.InvokeServer, RequestRemote, action, ...)
	return ok and type(result) == "table" and result.ok == true
end

function ClientNet.collect(id: number)
	CollectRemote:FireServer(id)
end

return ClientNet
