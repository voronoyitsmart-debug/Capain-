--[[
	Format — красивые числа и время: 1.25K, 3.4M, 12:05, 1ч 20м
]]

local Format = {}

local SUFFIXES = { "", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc" }

local function stripZeros(s: string): string
	if string.find(s, "%.") then
		s = string.gsub(s, "0+$", "")
		s = string.gsub(s, "%.$", "")
	end
	return s
end

-- 1234 -> "1.23K", 15000000 -> "15M"
function Format.number(n: number?): string
	local value = n or 0
	if value ~= value then
		return "0"
	end
	local negative = value < 0
	value = math.abs(value)

	local text
	if value < 1000 then
		text = tostring(math.floor(value))
	else
		local index = 1
		while value >= 1000 and index < #SUFFIXES do
			value /= 1000
			index += 1
		end
		local shown
		if value < 10 then
			shown = stripZeros(string.format("%.2f", math.floor(value * 100) / 100))
		elseif value < 100 then
			shown = stripZeros(string.format("%.1f", math.floor(value * 10) / 10))
		else
			shown = tostring(math.floor(value))
		end
		text = shown .. SUFFIXES[index]
	end

	return (negative and "-" or "") .. text
end

-- 1234567 -> "1 234 567"
function Format.spaced(n: number?): string
	local value = math.floor(n or 0)
	local s = tostring(math.abs(value))
	local out = string.reverse(s)
	out = string.gsub(out, "(%d%d%d)", "%1 ")
	out = string.reverse(out)
	out = string.gsub(out, "^ ", "")
	return (value < 0 and "-" or "") .. out
end

-- секунды -> "1ч 05м", "12:34", "0:07"
function Format.time(seconds: number?): string
	local s = math.max(0, math.floor(seconds or 0))
	local h = s // 3600
	local m = (s % 3600) // 60
	local sec = s % 60
	if h > 0 then
		return string.format("%dч %02dм", h, m)
	end
	return string.format("%d:%02d", m, sec)
end

-- длинная форма: "2 ч 30 мин", "45 сек"
function Format.duration(seconds: number?): string
	local s = math.max(0, math.floor(seconds or 0))
	local h = s // 3600
	local m = (s % 3600) // 60
	local sec = s % 60
	if h > 0 then
		if m > 0 then
			return string.format("%d ч %d мин", h, m)
		end
		return string.format("%d ч", h)
	elseif m > 0 then
		if sec > 0 and m < 10 then
			return string.format("%d мин %d сек", m, sec)
		end
		return string.format("%d мин", m)
	end
	return string.format("%d сек", sec)
end

-- Русское склонение: plural(5, "предмет", "предмета", "предметов") -> "предметов"
function Format.plural(n: number, one: string, few: string, many: string): string
	local v = math.abs(math.floor(n)) % 100
	local v1 = v % 10
	if v > 10 and v < 20 then
		return many
	elseif v1 > 1 and v1 < 5 then
		return few
	elseif v1 == 1 then
		return one
	end
	return many
end

function Format.percent(fraction: number): string
	local p = fraction * 100
	if math.abs(p - math.floor(p)) < 0.05 then
		return string.format("%d%%", math.floor(p + 0.5))
	end
	return string.format("%.1f%%", p)
end

function Format.multiplier(m: number): string
	if math.abs(m - math.floor(m)) < 0.005 then
		return "x" .. tostring(math.floor(m))
	end
	return "x" .. stripZeros(string.format("%.2f", m))
end

return Format
