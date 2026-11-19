--[[
	Signal — простой сигнал без копирования таблиц (в отличие от BindableEvent).
]]

local Signal = {}
Signal.__index = Signal

function Signal.new()
	return setmetatable({ _handlers = {} }, Signal)
end

function Signal:Connect(fn)
	local handlers = self._handlers
	local entry = { fn = fn, connected = true }
	table.insert(handlers, entry)
	return {
		Disconnect = function()
			entry.connected = false
			local index = table.find(handlers, entry)
			if index then
				table.remove(handlers, index)
			end
		end,
	}
end

function Signal:Fire(...)
	-- копия списка, чтобы обработчики могли отключаться во время вызова
	local list = table.clone(self._handlers)
	for _, entry in list do
		if entry.connected then
			task.spawn(entry.fn, ...)
		end
	end
end

return Signal
