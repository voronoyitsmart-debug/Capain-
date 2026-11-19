--[[
	Remotes — все сетевые события игры. Сервер создаёт их, клиент ждёт.

	Request (RemoteFunction)  клиент → сервер: покупки, награды, настройки
	Collect (RemoteEvent)     клиент → сервер: «ловлю мусор с таким Id»
	State   (RemoteEvent)     сервер → клиент: свежие данные игрока
	Notify  (RemoteEvent)     сервер → клиент: всплывающее сообщение
	Effect  (Unreliable)      сервер → все:    эффекты вылова/продажи
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local DEFINITIONS = {
	{ Name = "Request", Class = "RemoteFunction" },
	{ Name = "Collect", Class = "RemoteEvent" },
	{ Name = "State", Class = "RemoteEvent" },
	{ Name = "Notify", Class = "RemoteEvent" },
	{ Name = "Effect", Class = "UnreliableRemoteEvent", Fallback = "RemoteEvent" },
}

local Remotes = {}

local folder: Folder
if RunService:IsServer() then
	folder = ReplicatedStorage:FindFirstChild("Remotes") :: Folder
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "Remotes"
		folder.Parent = ReplicatedStorage
	end
	for _, def in DEFINITIONS do
		if not folder:FindFirstChild(def.Name) then
			local ok, remote = pcall(Instance.new, def.Class)
			if not ok and def.Fallback then
				remote = Instance.new(def.Fallback)
			end
			remote.Name = def.Name
			remote.Parent = folder
		end
	end
else
	folder = ReplicatedStorage:WaitForChild("Remotes") :: Folder
end

function Remotes.get(name: string): any
	if RunService:IsServer() then
		return folder:FindFirstChild(name)
	end
	return folder:WaitForChild(name)
end

return Remotes
