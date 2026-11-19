--[[
	Чистая Река — точка входа клиента.
	Строит интерфейс и запускает контроллеры (анимация мусора, ловля, помощники,
	эффекты, зоны). Кнопки «E» у ларьков открывают нужные окна.
]]

local Players = game:GetService("Players")
local ProximityPromptService = game:GetService("ProximityPromptService")
local StarterGui = game:GetService("StarterGui")

local player = Players.LocalPlayer

local State = require(script.State)
local ClientNet = require(script.ClientNet)
local Sounds = require(script.Sounds)

local Controllers = script:WaitForChild("Controllers")
local TrashAnimator = require(Controllers.TrashAnimator)
local CollectController = require(Controllers.CollectController)
local HelperRenderer = require(Controllers.HelperRenderer)
local Effects = require(Controllers.Effects)
local ZoneController = require(Controllers.ZoneController)

local UI = script:WaitForChild("UI")
local UIKit = require(UI.UIKit)
local Windows = require(UI.Windows)
local Notifications = require(UI.Notifications)
local Hud = require(UI.Hud)

local WINDOW_MODULES = {
	"ShopWindow",
	"HelpersWindow",
	"FactoryWindow",
	"BoostsWindow",
	"QuestsWindow",
	"CollectionWindow",
	"RebirthWindow",
	"TeleportWindow",
	"RewardsWindow",
	"SettingsWindow",
}

local function safe(name: string, fn: () -> ())
	local ok, err = pcall(fn)
	if not ok then
		warn("[Чистая Река] " .. name .. ": " .. tostring(err))
	end
end

-- Экран
local gui = Instance.new("ScreenGui")
gui.Name = "ChistayaRekaUI"
gui.ResetOnSpawn = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.IgnoreGuiInset = false
gui.Parent = player:WaitForChild("PlayerGui")

State.init()
UIKit.startScaling()
Notifications.init(gui)
ClientNet.setNotifier(Notifications.show)
CollectController.setNotifier(Notifications.show)
Windows.init(gui)

-- уведомления с сервера
local Remotes = require(game:GetService("ReplicatedStorage"):WaitForChild("Shared"):WaitForChild("Remotes"))
Remotes.get("Notify").OnClientEvent:Connect(function(text, kind)
	Notifications.show(text, kind)
end)

safe("Sounds", Sounds.start)
safe("TrashAnimator", function()
	task.spawn(TrashAnimator.start)
end)
safe("HelperRenderer", HelperRenderer.start)
safe("Effects", Effects.start)
safe("ZoneController", ZoneController.start)
safe("CollectController", CollectController.start)

safe("Hud", function()
	Hud.build(gui)
end)
for _, name in WINDOW_MODULES do
	safe(name, function()
		require(UI:WaitForChild(name)).build()
	end)
end
safe("Windows", Windows.start)
safe("HudStart", Hud.start)

-- Кнопки «E» у ларьков, фабрики, портала и ворот
local PROMPT_WINDOWS = {
	Shop = { "Shop" },
	Zones = { "Shop", { tab = "Zones" } },
	Helpers = { "Helpers" },
	Factory = { "Factory" },
	Rebirth = { "Rebirth" },
	Teleport = { "Teleport" },
	Quests = { "Quests" },
}
ProximityPromptService.PromptTriggered:Connect(function(prompt, who)
	if who ~= player then
		return
	end
	local target = PROMPT_WINDOWS[prompt:GetAttribute("OpenUI") or ""]
	if target then
		Windows.open(target[1], target[2])
	end
end)

-- Ежедневная награда сама открывается при входе
task.spawn(function()
	local data = State.waitReady()
	task.wait(3)
	local Formulas = require(game:GetService("ReplicatedStorage").Shared.Formulas)
	if Formulas.dailyStatus(data, State.now()) and not Windows.current() then
		Windows.open("Rewards")
	end
end)

pcall(function()
	StarterGui:SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false)
end)

print("[Чистая Река] Клиент запущен ✔")
