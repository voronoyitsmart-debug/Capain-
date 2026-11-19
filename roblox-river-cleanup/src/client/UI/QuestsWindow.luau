--[[
	QuestsWindow — три задания с прогрессом, наградой и заменой.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Format = require(Shared.Format)

local Client = script.Parent.Parent
local ClientNet = require(Client.ClientNet)
local Sounds = require(Client.Sounds)
local State = require(Client.State)
local UIKit = require(script.Parent.UIKit)
local Windows = require(script.Parent.Windows)

local QuestsWindow = {}

local T = UIKit.Theme

local ICONS = {
	Collect = "🗑️",
	CollectType = "🎯",
	CollectRare = "💎",
	Earn = "💰",
	Sell = "♻️",
	Helper = "🐾",
	Shiny = "✨",
	ZoneCollect = "📍",
}

function QuestsWindow.build()
	local window = Windows.create("Quests", "📜 Задания", Vector2.new(720, 500), T.Green)
	local body = window.Body
	UIKit.list(body, 10)

	local slots = {}
	for i = 1, Config.Quests.Slots do
		local card = UIKit.frame(body, {
			Name = "Quest" .. i,
			LayoutOrder = i,
			BackgroundColor3 = T.Card,
			Size = UDim2.new(1, 0, 0, 112),
		})
		UIKit.corner(card, 14)
		local stroke = UIKit.stroke(card, T.Stroke, 1.5, 0.35)
		local icon = UIKit.icon(card, "📜", T.Green, 64)
		icon.Position = UDim2.fromOffset(10, 10)
		local title = UIKit.text(card, {
			Text = "",
			Font = UIKit.FontBlack,
			TextSize = 18,
			Position = UDim2.fromOffset(86, 8),
			Size = UDim2.new(1, -260, 0, 44),
			TextYAlignment = Enum.TextYAlignment.Top,
		})
		local reward = UIKit.text(card, {
			Text = "",
			TextSize = 15,
			TextColor3 = T.Gold,
			Position = UDim2.fromOffset(86, 52),
			Size = UDim2.new(1, -260, 0, 20),
		})
		local bar = UIKit.bar(card, {
			Position = UDim2.fromOffset(86, 76),
			Size = UDim2.new(1, -260, 0, 24),
			Color = T.Green,
		})
		local claim = UIKit.button(card, {
			AnchorPoint = Vector2.new(1, 0),
			Position = UDim2.new(1, -12, 0, 12),
			Size = UDim2.fromOffset(150, 46),
			Text = "Забрать",
			Color = T.Green,
		}, function()
			local quest = slots[i].Quest
			if quest and ClientNet.request("ClaimQuest", quest.Id) then
				Sounds.play("Sell", 0.6, 1.1)
			end
		end)
		local reroll = UIKit.button(card, {
			AnchorPoint = Vector2.new(1, 1),
			Position = UDim2.new(1, -12, 1, -10),
			Size = UDim2.fromOffset(150, 36),
			Text = "🔄 Заменить",
			TextSize = 14,
			Color = T.Panel2,
		}, function()
			local quest = slots[i].Quest
			if quest then
				ClientNet.request("RerollQuest", quest.Id)
			end
		end)
		slots[i] = {
			Card = card,
			Stroke = stroke,
			Icon = icon,
			Title = title,
			Reward = reward,
			Bar = bar,
			Claim = claim,
			Reroll = reroll,
			Quest = nil,
		}
	end

	local footer = UIKit.text(body, {
		LayoutOrder = 10,
		Text = "",
		TextSize = 15,
		TextColor3 = T.Sub,
		TextXAlignment = Enum.TextXAlignment.Center,
		Size = UDim2.new(1, 0, 0, 24),
	})

	local function render(data)
		local now = State.now()
		local rerollLeft = math.max(0, (data.QuestRerollAt or 0) - now)
		for i, slot in slots do
			local quest = data.Quests[i]
			slot.Quest = quest
			slot.Card.Visible = quest ~= nil
			if quest then
				local iconLabel = slot.Icon:FindFirstChildOfClass("TextLabel")
				if iconLabel then
					iconLabel.Text = ICONS[quest.Kind] or "📜"
				end
				slot.Title.Text = quest.Text
				slot.Reward.Text = "🏆 Награда: " .. Format.number(quest.Reward) .. " 💰"
				local progressText = if quest.Kind == "Earn"
					then Format.number(quest.Progress) .. " / " .. Format.number(quest.Target)
					else quest.Progress .. " / " .. quest.Target
				slot.Bar.set(quest.Progress / math.max(1, quest.Target), progressText, if quest.Done then T.Gold else T.Green)
				if quest.Done then
					UIKit.setButton(slot.Claim, "🏆 Забрать!", T.Gold)
					slot.Stroke.Color = T.Gold
					slot.Stroke.Transparency = 0
					slot.Reroll.Visible = false
				else
					UIKit.setButton(slot.Claim, "В процессе…", T.Disabled, false)
					slot.Stroke.Color = T.Stroke
					slot.Stroke.Transparency = 0.35
					slot.Reroll.Visible = true
					if rerollLeft > 0 then
						UIKit.setButton(slot.Reroll, "🔄 через " .. Format.time(rerollLeft), T.Panel2, false)
					else
						UIKit.setButton(slot.Reroll, "🔄 Заменить", T.Panel2)
					end
				end
			end
		end
		footer.Text = "Выполнено заданий за всё время: " .. Format.number(data.QuestsDone or 0)
	end

	window.onRender = render
	window.onTick = render
end

return QuestsWindow
