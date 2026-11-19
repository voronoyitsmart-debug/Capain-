--[[
	Sounds — звуки и музыка (выключаются в настройках).
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)

local State = require(script.Parent.State)

local Sounds = {}

local cache: { [string]: Sound } = {}
local music: Sound? = nil

local function get(name: string): Sound?
	local id = Config.Sounds[name]
	if not id or id == "" then
		return nil
	end
	local sound = cache[name]
	if not sound then
		sound = Instance.new("Sound")
		sound.Name = "Sfx_" .. name
		sound.SoundId = id
		sound.Parent = SoundService
		cache[name] = sound
	end
	return sound
end

function Sounds.play(name: string, volume: number?, pitch: number?)
	if not State.setting("Sounds") then
		return
	end
	local sound = get(name)
	if not sound then
		return
	end
	sound.Volume = volume or 0.5
	sound.PlaybackSpeed = pitch or 1
	SoundService:PlayLocalSound(sound)
end

function Sounds.updateMusic()
	if Config.Sounds.Music == "" then
		return
	end
	if not music then
		local m = Instance.new("Sound")
		m.Name = "Music"
		m.SoundId = Config.Sounds.Music
		m.Looped = true
		m.Volume = 0.25
		m.Parent = SoundService
		music = m
	end
	local sound = music :: Sound
	if State.setting("Music") then
		if not sound.IsPlaying then
			sound:Play()
		end
	elseif sound.IsPlaying then
		sound:Stop()
	end
end

function Sounds.start()
	State.Changed:Connect(Sounds.updateMusic)
end

return Sounds
