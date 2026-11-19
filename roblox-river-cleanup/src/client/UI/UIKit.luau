--[[
	UIKit — набор для быстрой сборки интерфейса: цвета, кнопки, карточки,
	полоски прогресса, окна с прокруткой, превью 3D-моделей.
]]

local GuiService = game:GetService("GuiService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Util = require(Shared.Util)

local Client = script.Parent.Parent
local Sounds = require(Client.Sounds)

local UIKit = {}

local C = Color3.fromRGB

UIKit.Theme = {
	Bg = C(18, 24, 36),
	Panel = C(27, 36, 53),
	Panel2 = C(35, 46, 67),
	Card = C(43, 56, 81),
	CardHover = C(54, 70, 100),
	Stroke = C(72, 92, 128),
	Text = C(242, 245, 250),
	Sub = C(165, 178, 200),
	Green = C(70, 205, 115),
	GreenDark = C(40, 140, 80),
	Gold = C(255, 202, 60),
	Red = C(235, 85, 85),
	Blue = C(80, 160, 255),
	Purple = C(178, 108, 255),
	Orange = C(255, 152, 60),
	Cyan = C(80, 215, 230),
	Disabled = C(80, 88, 104),
	Dark = C(12, 16, 24),
}

UIKit.Font = Enum.Font.GothamBold
UIKit.FontBlack = Enum.Font.GothamBlack
UIKit.FontMedium = Enum.Font.GothamMedium

local T = UIKit.Theme

function UIKit.new(className: string, props: { [string]: any }?, children: { Instance }?): any
	return Util.create(className, props, children)
end

function UIKit.corner(parent: Instance, radius: number?): UICorner
	return Util.create("UICorner", { CornerRadius = UDim.new(0, radius or 12), Parent = parent })
end

function UIKit.stroke(parent: Instance, color: Color3?, thickness: number?, transparency: number?): UIStroke
	return Util.create("UIStroke", {
		Color = color or T.Stroke,
		Thickness = thickness or 2,
		Transparency = transparency or 0,
		ApplyStrokeMode = if parent:IsA("TextLabel") or parent:IsA("TextBox") then Enum.ApplyStrokeMode.Contextual else Enum.ApplyStrokeMode.Border,
		Parent = parent,
	})
end

function UIKit.padding(parent: Instance, all: number, top: number?, bottom: number?): UIPadding
	return Util.create("UIPadding", {
		PaddingLeft = UDim.new(0, all),
		PaddingRight = UDim.new(0, all),
		PaddingTop = UDim.new(0, top or all),
		PaddingBottom = UDim.new(0, bottom or all),
		Parent = parent,
	})
end

function UIKit.list(parent: Instance, padding: number?, horizontal: boolean?, align: Enum.HorizontalAlignment?): UIListLayout
	return Util.create("UIListLayout", {
		Padding = UDim.new(0, padding or 8),
		FillDirection = if horizontal then Enum.FillDirection.Horizontal else Enum.FillDirection.Vertical,
		SortOrder = Enum.SortOrder.LayoutOrder,
		HorizontalAlignment = align or Enum.HorizontalAlignment.Left,
		VerticalAlignment = Enum.VerticalAlignment.Top,
		Parent = parent,
	})
end

function UIKit.grid(parent: Instance, cell: UDim2, padding: number?): UIGridLayout
	return Util.create("UIGridLayout", {
		CellSize = cell,
		CellPadding = UDim2.fromOffset(padding or 8, padding or 8),
		SortOrder = Enum.SortOrder.LayoutOrder,
		Parent = parent,
	})
end

function UIKit.gradient(parent: Instance, top: Color3, bottom: Color3, rotation: number?): UIGradient
	return Util.create("UIGradient", {
		Color = ColorSequence.new(top, bottom),
		Rotation = rotation or 90,
		Parent = parent,
	})
end

function UIKit.tween(inst: Instance, time: number, props: { [string]: any }, style: Enum.EasingStyle?, dir: Enum.EasingDirection?)
	local tween = TweenService:Create(
		inst,
		TweenInfo.new(time, style or Enum.EasingStyle.Quad, dir or Enum.EasingDirection.Out),
		props
	)
	tween:Play()
	return tween
end

-- Текст с обводкой для читаемости
function UIKit.text(parent: Instance?, props: { [string]: any }): TextLabel
	local defaults = {
		BackgroundTransparency = 1,
		Font = UIKit.Font,
		TextColor3 = T.Text,
		TextSize = 18,
		TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextYAlignment = Enum.TextYAlignment.Center,
		Size = UDim2.new(1, 0, 0, 24),
		Parent = parent,
	}
	local strokeIt = props.Stroke
	props.Stroke = nil
	for key, value in props do
		defaults[key] = value
	end
	local label = Util.create("TextLabel", defaults)
	if strokeIt then
		local stroke = Util.create("UIStroke", { Thickness = 2, Color = T.Dark, Transparency = 0.2, Parent = label })
		stroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Contextual
	end
	return label
end

function UIKit.frame(parent: Instance?, props: { [string]: any }): Frame
	local defaults = {
		BackgroundColor3 = T.Card,
		BorderSizePixel = 0,
		Size = UDim2.fromScale(1, 1),
		Parent = parent,
	}
	for key, value in props do
		defaults[key] = value
	end
	return Util.create("Frame", defaults)
end

-- Кнопка с анимацией нажатия. button:SetAttribute("Color", ...) не нужен — используй UIKit.setButton
function UIKit.button(parent: Instance?, props: { [string]: any }, onClick: (() -> ())?): TextButton
	local color = props.Color or T.Green
	props.Color = nil
	local radius = props.Radius or 10
	props.Radius = nil
	local defaults = {
		BackgroundColor3 = color,
		AutoButtonColor = false,
		BorderSizePixel = 0,
		Font = UIKit.FontBlack,
		TextColor3 = T.Text,
		TextSize = 18,
		TextWrapped = true,
		Size = UDim2.fromOffset(140, 44),
		Parent = parent,
	}
	for key, value in props do
		defaults[key] = value
	end
	local button = Util.create("TextButton", defaults)
	button:SetAttribute("BaseColor", color)
	UIKit.corner(button, radius)
	local stroke = Util.create("UIStroke", {
		Thickness = 2,
		Color = color:Lerp(C(0, 0, 0), 0.35),
		ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
		Parent = button,
	})
	stroke.Name = "Edge"
	local scale = Util.create("UIScale", { Scale = 1, Parent = button })

	button.MouseEnter:Connect(function()
		local base = button:GetAttribute("BaseColor") :: Color3
		UIKit.tween(button, 0.12, { BackgroundColor3 = base:Lerp(C(255, 255, 255), 0.15) })
	end)
	button.MouseLeave:Connect(function()
		local base = button:GetAttribute("BaseColor") :: Color3
		UIKit.tween(button, 0.12, { BackgroundColor3 = base })
		UIKit.tween(scale, 0.1, { Scale = 1 })
	end)
	button.MouseButton1Down:Connect(function()
		UIKit.tween(scale, 0.08, { Scale = 0.94 })
	end)
	button.MouseButton1Up:Connect(function()
		UIKit.tween(scale, 0.12, { Scale = 1 }, Enum.EasingStyle.Back)
	end)
	if onClick then
		button.Activated:Connect(function()
			Sounds.play("Click", 0.35)
			onClick()
		end)
	end
	return button
end

-- Меняет цвет и текст кнопки
function UIKit.setButton(button: TextButton, text: string, color: Color3, enabled: boolean?)
	button.Text = text
	button:SetAttribute("BaseColor", color)
	button.BackgroundColor3 = color
	local edge = button:FindFirstChild("Edge") :: UIStroke?
	if edge then
		edge.Color = color:Lerp(C(0, 0, 0), 0.35)
	end
	button.Active = enabled ~= false
	button.AutoButtonColor = false
	button.TextTransparency = if enabled == false then 0.25 else 0
end

-- Полоска прогресса
function UIKit.bar(parent: Instance?, props: { [string]: any })
	local color = props.Color or T.Green
	props.Color = nil
	local defaults = {
		BackgroundColor3 = T.Dark,
		BorderSizePixel = 0,
		Size = UDim2.new(1, 0, 0, 22),
		Parent = parent,
	}
	for key, value in props do
		defaults[key] = value
	end
	local back = Util.create("Frame", defaults)
	UIKit.corner(back, 8)
	local fill = Util.create("Frame", {
		Name = "Fill",
		BackgroundColor3 = color,
		BorderSizePixel = 0,
		Size = UDim2.fromScale(0, 1),
		Parent = back,
	})
	UIKit.corner(fill, 8)
	UIKit.gradient(fill, C(255, 255, 255), C(200, 200, 200))
	local label = UIKit.text(back, {
		Name = "Label",
		Size = UDim2.fromScale(1, 1),
		TextXAlignment = Enum.TextXAlignment.Center,
		TextSize = 14,
		Text = "",
		Stroke = true,
		ZIndex = 3,
	})
	local api = {}
	api.Frame = back
	function api.set(fraction: number, text: string?, newColor: Color3?)
		local f = math.clamp(fraction, 0, 1)
		UIKit.tween(fill, 0.25, { Size = UDim2.fromScale(f, 1) })
		fill.Visible = f > 0.001
		if text then
			label.Text = text
		end
		if newColor then
			fill.BackgroundColor3 = newColor
		end
	end
	return api
end

function UIKit.scroll(parent: Instance?, props: { [string]: any }): ScrollingFrame
	local defaults = {
		BackgroundTransparency = 1,
		BorderSizePixel = 0,
		Size = UDim2.fromScale(1, 1),
		CanvasSize = UDim2.new(0, 0, 0, 0),
		AutomaticCanvasSize = Enum.AutomaticSize.Y,
		ScrollingDirection = Enum.ScrollingDirection.Y,
		ScrollBarThickness = 6,
		ScrollBarImageColor3 = T.Stroke,
		Parent = parent,
	}
	for key, value in props do
		defaults[key] = value
	end
	return Util.create("ScrollingFrame", defaults)
end

-- Квадратик с эмодзи-иконкой
function UIKit.icon(parent: Instance?, emoji: string, color: Color3, size: number): Frame
	local box = UIKit.frame(parent, {
		Name = "Icon",
		BackgroundColor3 = color:Lerp(T.Panel, 0.55),
		Size = UDim2.fromOffset(size, size),
	})
	UIKit.corner(box, 12)
	UIKit.stroke(box, color, 2, 0.2)
	UIKit.text(box, {
		Text = emoji,
		Size = UDim2.fromScale(1, 1),
		TextXAlignment = Enum.TextXAlignment.Center,
		TextScaled = true,
	})
	UIKit.padding(box, math.floor(size * 0.14))
	return box
end

-- 3D-превью модели в интерфейсе
function UIKit.viewport(parent: Instance?, model: Model, props: { [string]: any }?): ViewportFrame
	local defaults = {
		BackgroundTransparency = 1,
		Size = UDim2.fromOffset(80, 80),
		Ambient = C(200, 200, 210),
		LightColor = C(255, 255, 255),
		LightDirection = Vector3.new(-1, -1, -0.6),
		Parent = parent,
	}
	for key, value in props or {} do
		defaults[key] = value
	end
	local frame = Util.create("ViewportFrame", defaults)
	local world = Util.create("WorldModel", { Parent = frame })
	model:PivotTo(CFrame.identity)
	model.Parent = world
	local _, size = model:GetBoundingBox()
	local radius = math.max(size.X, size.Y, size.Z)
	local camera = Util.create("Camera", { FieldOfView = 40, Parent = frame })
	local eye = Vector3.new(radius * 0.9, radius * 0.75, -radius * 1.5)
	camera.CFrame = CFrame.lookAt(eye, Vector3.zero)
	frame.CurrentCamera = camera
	return frame
end

--[[
	Карточка товара/задания: иконка слева, заголовок, описание, кнопка справа.
	opts: Height, Icon (эмодзи) или IconNode(parent, size) -> GuiObject,
	      Color, Title, Desc, ButtonText, ButtonColor, ButtonWidth, OnClick, LayoutOrder
]]
function UIKit.card(parent: Instance, opts: { [string]: any })
	local height = opts.Height or 84
	local buttonWidth = opts.ButtonWidth or 150
	local frame = UIKit.frame(parent, {
		Name = opts.Name or "Card",
		Size = UDim2.new(1, -10, 0, height),
		BackgroundColor3 = T.Card,
		LayoutOrder = opts.LayoutOrder or 0,
	})
	UIKit.corner(frame, 14)
	local stroke = UIKit.stroke(frame, T.Stroke, 1.5, 0.35)
	local iconSize = height - 20
	local icon
	if opts.IconNode then
		icon = opts.IconNode(frame, iconSize)
	else
		icon = UIKit.icon(frame, opts.Icon or "❔", opts.Color or T.Blue, iconSize)
	end
	icon.Position = UDim2.fromOffset(10, 10)
	local left = iconSize + 22
	local title = UIKit.text(frame, {
		Name = "Title",
		Text = opts.Title or "",
		Font = UIKit.FontBlack,
		TextSize = 19,
		TextWrapped = false,
		TextTruncate = Enum.TextTruncate.AtEnd,
		Position = UDim2.fromOffset(left, 8),
		Size = UDim2.new(1, -(left + buttonWidth + 20), 0, 26),
	})
	local desc = UIKit.text(frame, {
		Name = "Desc",
		Text = opts.Desc or "",
		Font = UIKit.FontMedium,
		TextSize = 15,
		TextColor3 = T.Sub,
		TextYAlignment = Enum.TextYAlignment.Top,
		Position = UDim2.fromOffset(left, 36),
		Size = UDim2.new(1, -(left + buttonWidth + 20), 1, -42),
	})
	local button = UIKit.button(frame, {
		Name = "Action",
		AnchorPoint = Vector2.new(1, 0.5),
		Position = UDim2.new(1, -12, 0.5, 0),
		Size = UDim2.fromOffset(buttonWidth, 46),
		Text = opts.ButtonText or "",
		TextSize = 16,
		Color = opts.ButtonColor or T.Green,
	}, opts.OnClick)
	return { Frame = frame, Stroke = stroke, Icon = icon, Title = title, Desc = desc, Button = button }
end

-- Вкладки. tabs = { {Key = "Nets", Text = "🥅 Сачки"}, ... }
function UIKit.tabs(parent: Instance, tabs: { { Key: string, Text: string } }, onSelect: (string) -> ())
	local bar = UIKit.frame(parent, {
		Name = "Tabs",
		BackgroundTransparency = 1,
		Size = UDim2.new(1, 0, 0, 42),
	})
	UIKit.list(bar, 6, true)
	local buttons = {}
	local api = {}
	local width = math.floor(1 / #tabs * 1000) / 1000
	for index, tab in tabs do
		local button = UIKit.button(bar, {
			Name = tab.Key,
			Text = tab.Text,
			TextSize = 16,
			LayoutOrder = index,
			Color = T.Panel2,
			Size = UDim2.new(width, -6, 1, 0),
		}, function()
			api.select(tab.Key)
		end)
		buttons[tab.Key] = button
	end
	function api.select(key: string)
		for k, button in buttons do
			UIKit.setButton(button, button.Text, if k == key then T.Blue else T.Panel2)
		end
		onSelect(key)
	end
	api.Bar = bar
	api.Buttons = buttons
	return api
end

-- Переключатель «ВКЛ/ВЫКЛ»
function UIKit.toggle(parent: Instance, icon: string, title: string, desc: string, layoutOrder: number, onClick: () -> ())
	local card = UIKit.card(parent, {
		Height = 72,
		Icon = icon,
		Color = T.Stroke,
		Title = title,
		Desc = desc,
		ButtonText = "",
		ButtonWidth = 120,
		LayoutOrder = layoutOrder,
		OnClick = onClick,
	})
	local api = {}
	function api.set(on: boolean, available: boolean?)
		if available == false then
			UIKit.setButton(card.Button, "🔒 Перк", T.Disabled)
		else
			UIKit.setButton(card.Button, if on then "ВКЛ" else "ВЫКЛ", if on then T.Green else T.Disabled)
		end
	end
	api.Card = card
	return api
end

-- Масштаб интерфейса под размер экрана
local scales: { UIScale } = {}
local currentScale = 1

local function computeScale(): number
	local camera = workspace.CurrentCamera
	local size = if camera then camera.ViewportSize else Vector2.new(1280, 720)
	local inset = GuiService:GetGuiInset()
	local h = size.Y - inset.Y
	return math.clamp(math.min(size.X / 1150, h / 660), 0.5, 1.15)
end

function UIKit.scaleGroup(target: GuiObject): UIScale
	local scale = Util.create("UIScale", { Name = "AutoScale", Scale = currentScale, Parent = target })
	table.insert(scales, scale)
	return scale
end

function UIKit.globalScale(): number
	return currentScale
end

function UIKit.startScaling()
	local function update()
		currentScale = computeScale()
		for _, scale in scales do
			scale.Scale = currentScale
		end
	end
	update()
	local function hook()
		local camera = workspace.CurrentCamera
		if camera then
			camera:GetPropertyChangedSignal("ViewportSize"):Connect(update)
		end
	end
	hook()
	workspace:GetPropertyChangedSignal("CurrentCamera"):Connect(function()
		hook()
		update()
	end)
end

return UIKit
