--[[
	Windows — менеджер окон: открыто всегда не больше одного окна.
	Окно = рамка с заголовком, кнопкой «✕» и телом (Body).

	local w = Windows.create("Shop", "🛒 Магазин", Vector2.new(720, 500), color)
	w.onOpen = function(arg) end       -- при открытии
	w.onRender = function(data) end    -- при изменении данных игрока
	w.onTick = function(data) end      -- раз в полсекунды, пока окно открыто
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Signal = require(Shared.Signal)

local Client = script.Parent.Parent
local State = require(Client.State)
local UIKit = require(script.Parent.UIKit)

local Windows = {}
Windows.Changed = Signal.new() -- (name | nil)

local T = UIKit.Theme
local registry: { [string]: any } = {}
local current: string? = nil
local screen: ScreenGui

function Windows.init(gui: ScreenGui)
	screen = gui
end

function Windows.create(name: string, title: string, size: Vector2, accent: Color3?)
	local color = accent or T.Blue
	local holder = UIKit.frame(screen, {
		Name = name .. "Window",
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.53),
		Size = UDim2.fromOffset(size.X, size.Y),
		BackgroundTransparency = 1,
		Visible = false,
	})
	UIKit.scaleGroup(holder)

	local frame = UIKit.frame(holder, {
		Name = "Panel",
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = UDim2.fromScale(0.5, 0.5),
		BackgroundColor3 = T.Panel,
	})
	UIKit.corner(frame, 18)
	UIKit.stroke(frame, color, 3)
	UIKit.gradient(frame, T.Panel2, T.Bg)
	local anim = UIKit.new("UIScale", { Scale = 1, Parent = frame })

	local header = UIKit.frame(frame, {
		Name = "Header",
		BackgroundColor3 = color,
		Size = UDim2.new(1, 0, 0, 56),
	})
	UIKit.corner(header, 18)
	UIKit.gradient(header, color, color:Lerp(Color3.new(0, 0, 0), 0.35))
	-- прямой нижний край шапки
	UIKit.frame(header, {
		Name = "Flat",
		BackgroundColor3 = color:Lerp(Color3.new(0, 0, 0), 0.35),
		Position = UDim2.new(0, 0, 1, -14),
		Size = UDim2.new(1, 0, 0, 14),
	})
	local titleLabel = UIKit.text(header, {
		Name = "Title",
		Text = title,
		Font = UIKit.FontBlack,
		TextSize = 26,
		Position = UDim2.fromOffset(20, 0),
		Size = UDim2.new(1, -90, 1, 0),
		Stroke = true,
	})

	local window = {
		Name = name,
		Holder = holder,
		Frame = frame,
		Header = header,
		Title = titleLabel,
		Accent = color,
		onOpen = nil :: ((any) -> ())?,
		onRender = nil :: ((any) -> ())?,
		onTick = nil :: ((any) -> ())?,
	}

	UIKit.button(header, {
		Name = "Close",
		Text = "✕",
		TextSize = 24,
		Color = T.Red,
		AnchorPoint = Vector2.new(1, 0.5),
		Position = UDim2.new(1, -12, 0.5, 0),
		Size = UDim2.fromOffset(42, 42),
	}, function()
		Windows.close()
	end)

	local body = UIKit.frame(frame, {
		Name = "Body",
		BackgroundTransparency = 1,
		Position = UDim2.fromOffset(0, 60),
		Size = UDim2.new(1, 0, 1, -64),
	})
	UIKit.padding(body, 16, 10, 14)
	window.Body = body
	window.Anim = anim

	registry[name] = window
	return window
end

function Windows.get(name: string)
	return registry[name]
end

function Windows.current(): string?
	return current
end

function Windows.render(name: string?)
	local key = name or current
	local window = key and registry[key]
	if window and window.Holder.Visible and window.onRender and State.Data then
		local ok, err = pcall(window.onRender, State.Data)
		if not ok then
			warn("[Окно " .. tostring(key) .. "]", err)
		end
	end
end

function Windows.open(name: string, arg: any?)
	local window = registry[name]
	if not window then
		return
	end
	if current and current ~= name then
		Windows.close()
	end
	current = name
	window.Holder.Visible = true
	window.Anim.Scale = 0.85
	UIKit.tween(window.Anim, 0.22, { Scale = 1 }, Enum.EasingStyle.Back)
	if window.onOpen then
		local ok, err = pcall(window.onOpen, arg)
		if not ok then
			warn("[Окно " .. name .. "]", err)
		end
	end
	Windows.render(name)
	Windows.Changed:Fire(name)
end

function Windows.close()
	if current then
		local window = registry[current]
		window.Holder.Visible = false
		current = nil
		Windows.Changed:Fire(nil)
	end
end

function Windows.toggle(name: string, arg: any?)
	if current == name then
		Windows.close()
	else
		Windows.open(name, arg)
	end
end

function Windows.start()
	State.Changed:Connect(function()
		Windows.render()
	end)
	task.spawn(function()
		while true do
			task.wait(0.5)
			local window = current and registry[current]
			if window and window.onTick and State.Data then
				local ok, err = pcall(window.onTick, State.Data)
				if not ok then
					warn("[Окно " .. tostring(current) .. "]", err)
				end
			end
		end
	end)
end

return Windows
