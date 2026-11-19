--[[
	Notifications — всплывающие сообщения сверху экрана.
	kind: "success" | "error" | "info" | "legendary" | "event"
]]

local Client = script.Parent.Parent
local Sounds = require(Client.Sounds)
local UIKit = require(script.Parent.UIKit)

local Notifications = {}

local T = UIKit.Theme
local container: Frame
local lastText = ""
local lastAt = 0
local order = 0

local KIND = {
	success = { Color = T.Green, Time = 3.2 },
	error = { Color = T.Red, Time = 2.6 },
	info = { Color = T.Blue, Time = 3.5 },
	legendary = { Color = T.Gold, Time = 5 },
	event = { Color = T.Purple, Time = 6 },
}

function Notifications.init(gui: ScreenGui)
	container = UIKit.frame(gui, {
		Name = "Toasts",
		AnchorPoint = Vector2.new(0.5, 0),
		Position = UDim2.new(0.5, 0, 0, 132),
		Size = UDim2.fromOffset(560, 320),
		BackgroundTransparency = 1,
		ZIndex = 50,
	})
	UIKit.scaleGroup(container)
	UIKit.list(container, 6, false, Enum.HorizontalAlignment.Center)
end

function Notifications.show(text: string, kind: string?)
	if not container or type(text) ~= "string" or text == "" then
		return
	end
	local now = os.clock()
	if text == lastText and now - lastAt < 1.2 then
		return
	end
	lastText = text
	lastAt = now

	local style = KIND[kind or "info"] or KIND.info
	order += 1

	-- не больше 4 сообщений одновременно
	local toasts = {}
	for _, child in container:GetChildren() do
		if child:IsA("Frame") then
			table.insert(toasts, child)
		end
	end
	table.sort(toasts, function(a, b)
		return a.LayoutOrder < b.LayoutOrder
	end)
	while #toasts >= 4 do
		table.remove(toasts, 1):Destroy()
	end

	local toast = UIKit.frame(container, {
		Name = "Toast",
		LayoutOrder = order,
		BackgroundColor3 = T.Panel,
		BackgroundTransparency = 0.05,
		Size = UDim2.new(1, 0, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
		ZIndex = 50,
	})
	UIKit.corner(toast, 12)
	local stroke = UIKit.stroke(toast, style.Color, 2.5)
	UIKit.padding(toast, 14, 8, 8)
	local label = UIKit.text(toast, {
		Text = text,
		TextSize = 18,
		TextXAlignment = Enum.TextXAlignment.Center,
		Size = UDim2.new(1, 0, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
		ZIndex = 51,
	})

	if kind == "error" then
		Sounds.play("Error", 0.25, 0.7)
	elseif kind == "legendary" or kind == "event" then
		Sounds.play("Buy", 0.5, 0.8)
	end

	task.delay(style.Time, function()
		if toast.Parent then
			UIKit.tween(toast, 0.35, { BackgroundTransparency = 1 })
			UIKit.tween(label, 0.35, { TextTransparency = 1 })
			UIKit.tween(stroke, 0.35, { Transparency = 1 })
			task.wait(0.4)
			toast:Destroy()
		end
	end)
end

return Notifications
