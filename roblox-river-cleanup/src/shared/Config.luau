--[[
	Config — все настройки игры «Чистая Река» в одном месте.

	Хочешь поменять баланс? Меняй числа здесь:
	цены, награды, скорость реки, шансы редкостей, таймеры бустов.
	В игре НЕТ доната: всё покупается только за внутриигровые монеты 💰,
	а бесплатные бусты и награды просто требуют подождать ⏳.
]]

local Config = {}

Config.GameName = "Чистая Река"
Config.GameSubtitle = "Симулятор уборки мусора"

-- Хранилища данных (поменяй версию, если хочешь «обнулить» всех игроков)
Config.DataStoreName = "ChistayaReka_PlayerData_v1"
Config.TopTrashStore = "ChistayaReka_TopTrash_v1"
Config.TopRebirthStore = "ChistayaReka_TopRebirth_v1"
Config.AutoSaveInterval = 90 -- секунд
Config.LeaderboardRefresh = 120 -- секунд

-- Звуки. rbxasset:// — встроенные звуки Roblox Studio.
-- Можешь заменить на свои: "rbxassetid://123456"
Config.Sounds = {
	Collect = "rbxasset://sounds/electronicpingshort.wav",
	Sell = "rbxasset://sounds/electronicpingshort.wav",
	Buy = "rbxasset://sounds/electronicpingshort.wav",
	Click = "rbxasset://sounds/button.wav",
	Splash = "rbxasset://sounds/impact_water.mp3",
	Whoosh = "rbxasset://sounds/swoosh.wav",
	Error = "rbxasset://sounds/button.wav",
	Music = "", -- вставь rbxassetid:// своей музыки, если хочешь фоновую музыку
}

----------------------------------------------------------------------
-- Мир
----------------------------------------------------------------------
Config.World = {
	ZoneSpacing = 200, -- расстояние между центрами зон по оси Z
	HalfWidth = 120, -- половина ширины зоны по X
	HalfDepth = 100, -- половина глубины зоны по Z
	RiverOffsetZ = 10, -- центр реки относительно центра зоны
	RiverWidth = 44,
	WaterY = -2, -- уровень поверхности воды
	RiverStartX = -114, -- отсюда выплывает мусор
	RiverEndX = 114, -- здесь мусор уплывает навсегда
	HubZ = -52, -- центр «базы» зоны (переработка, магазин) относительно центра зоны
	GateWidth = 28,
	WallHeight = 14,
	BridgeX = { -62, 62 },
}

----------------------------------------------------------------------
-- Редкости
----------------------------------------------------------------------
-- LuckExp: насколько сильно удача увеличивает шанс этой редкости
Config.Rarities = {
	Common = { Name = "Обычный", Color = Color3.fromRGB(205, 210, 215), Weight = 60, LuckExp = 0, Order = 1 },
	Uncommon = { Name = "Необычный", Color = Color3.fromRGB(95, 220, 110), Weight = 26, LuckExp = 0.5, Order = 2 },
	Rare = { Name = "Редкий", Color = Color3.fromRGB(80, 160, 255), Weight = 10, LuckExp = 1, Order = 3 },
	Epic = { Name = "Эпический", Color = Color3.fromRGB(185, 95, 255), Weight = 3.3, LuckExp = 1.5, Order = 4 },
	Legendary = { Name = "Легендарный", Color = Color3.fromRGB(255, 195, 40), Weight = 0.7, LuckExp = 2, Order = 5 },
}
Config.RarityOrder = { "Common", "Uncommon", "Rare", "Epic", "Legendary" }

-- «Сияющий» мусор: случайный шанс при вылове, стоит в несколько раз дороже
Config.Shiny = {
	BaseChance = 0.03,
	MaxChance = 0.45,
	ValueMult = 5,
}

----------------------------------------------------------------------
-- Зоны (открываются по порядку за монеты)
----------------------------------------------------------------------
Config.Zones = {
	{
		Name = "Тихий ручей",
		Short = "Ручей",
		Cost = 0,
		RewardBase = 60, -- основа для наград (ежедневка, задания, подарки)
		FlowSpeed = { 2.4, 3.2 },
		SpawnInterval = 1.25,
		MaxTrash = 36,
		Theme = {
			Ground = "Grass",
			Bank = "Sand",
			Bed = "Mud",
			Decor = "Meadow",
			Accent = Color3.fromRGB(110, 205, 95),
			WaterDirty = Color3.fromRGB(95, 105, 70),
			WaterClean = Color3.fromRGB(35, 140, 185),
			Fog = 0.26,
		},
		Trash = { "paper", "bottle", "can", "bag", "boot", "rod", "goldbottle" },
	},
	{
		Name = "Городской канал",
		Short = "Город",
		Cost = 2000,
		RewardBase = 500,
		FlowSpeed = { 2.8, 3.6 },
		SpawnInterval = 1.25,
		MaxTrash = 36,
		Theme = {
			Ground = "Pavement",
			Bank = "Concrete",
			Bed = "Mud",
			Decor = "City",
			Accent = Color3.fromRGB(120, 170, 235),
			WaterDirty = Color3.fromRGB(85, 90, 80),
			WaterClean = Color3.fromRGB(55, 120, 150),
			Fog = 0.3,
		},
		Trash = { "cup", "pizzabox", "ball", "cone", "wheel", "cart", "wallet" },
	},
	{
		Name = "Туманное болото",
		Short = "Болото",
		Cost = 25000,
		RewardBase = 4000,
		FlowSpeed = { 1.8, 2.6 },
		SpawnInterval = 1.25,
		MaxTrash = 36,
		Theme = {
			Ground = "LeafyGrass",
			Bank = "Mud",
			Bed = "Mud",
			Decor = "Swamp",
			Accent = Color3.fromRGB(150, 175, 80),
			WaterDirty = Color3.fromRGB(70, 75, 40),
			WaterClean = Color3.fromRGB(60, 115, 90),
			Fog = 0.5,
		},
		Trash = { "tire", "bucket", "umbrella", "crate", "barrel", "tv", "chest" },
	},
	{
		Name = "Промзона",
		Short = "Завод",
		Cost = 320000,
		RewardBase = 30000,
		FlowSpeed = { 3.0, 3.8 },
		SpawnInterval = 1.25,
		MaxTrash = 36,
		Theme = {
			Ground = "Asphalt",
			Bank = "Slate",
			Bed = "Ground",
			Decor = "Industrial",
			Accent = Color3.fromRGB(235, 150, 60),
			WaterDirty = Color3.fromRGB(90, 75, 60),
			WaterClean = Color3.fromRGB(70, 110, 130),
			Fog = 0.38,
		},
		Trash = { "pipe", "canister", "battery", "tractortire", "rustbarrel", "fridge", "engine" },
	},
	{
		Name = "Ядовитый канал",
		Short = "Яд",
		Cost = 4000000,
		RewardBase = 240000,
		FlowSpeed = { 2.2, 3.0 },
		SpawnInterval = 1.25,
		MaxTrash = 36,
		Theme = {
			Ground = "Ground",
			Bank = "Basalt",
			Bed = "Slate",
			Decor = "Toxic",
			Accent = Color3.fromRGB(130, 255, 70),
			WaterDirty = Color3.fromRGB(110, 190, 40),
			WaterClean = Color3.fromRGB(60, 160, 140),
			Fog = 0.42,
		},
		Trash = { "toxbarrel", "slime", "flask", "gasmask", "mutanttire", "radcontainer", "nukebattery" },
	},
	{
		Name = "Морское устье",
		Short = "Море",
		Cost = 50000000,
		RewardBase = 1800000,
		FlowSpeed = { 2.6, 3.4 },
		SpawnInterval = 1.25,
		MaxTrash = 36,
		Theme = {
			Ground = "Sand",
			Bank = "Sandstone",
			Bed = "Sand",
			Decor = "Ocean",
			Accent = Color3.fromRGB(80, 215, 230),
			WaterDirty = Color3.fromRGB(60, 100, 105),
			WaterClean = Color3.fromRGB(20, 130, 185),
			Fog = 0.22,
		},
		Trash = { "net", "buoy", "anchor", "wreck", "mine", "safe", "crown" },
	},
}

----------------------------------------------------------------------
-- Мусор. Value — цена в монетах, Size — сколько места в рюкзаке.
----------------------------------------------------------------------
Config.Trash = {
	-- Зона 1: Тихий ручей
	paper = { Name = "Мятая бумажка", Zone = 1, Rarity = "Common", Value = 1, Size = 1 },
	bottle = { Name = "Пластиковая бутылка", Zone = 1, Rarity = "Common", Value = 2, Size = 1 },
	can = { Name = "Жестяная банка", Zone = 1, Rarity = "Uncommon", Value = 4, Size = 1 },
	bag = { Name = "Пакет", Zone = 1, Rarity = "Uncommon", Value = 5, Size = 1 },
	boot = { Name = "Старый ботинок", Zone = 1, Rarity = "Rare", Value = 12, Size = 2 },
	rod = { Name = "Сломанная удочка", Zone = 1, Rarity = "Epic", Value = 35, Size = 2 },
	goldbottle = { Name = "Золотая бутылка", Zone = 1, Rarity = "Legendary", Value = 200, Size = 1 },

	-- Зона 2: Городской канал
	cup = { Name = "Стаканчик кофе", Zone = 2, Rarity = "Common", Value = 10, Size = 1 },
	pizzabox = { Name = "Коробка от пиццы", Zone = 2, Rarity = "Common", Value = 15, Size = 2 },
	ball = { Name = "Сдутый мяч", Zone = 2, Rarity = "Uncommon", Value = 30, Size = 2 },
	cone = { Name = "Дорожный конус", Zone = 2, Rarity = "Uncommon", Value = 36, Size = 2 },
	wheel = { Name = "Велосипедное колесо", Zone = 2, Rarity = "Rare", Value = 90, Size = 3 },
	cart = { Name = "Тележка из магазина", Zone = 2, Rarity = "Epic", Value = 260, Size = 4 },
	wallet = { Name = "Кошелёк миллионера", Zone = 2, Rarity = "Legendary", Value = 1500, Size = 1 },

	-- Зона 3: Туманное болото
	tire = { Name = "Старая шина", Zone = 3, Rarity = "Common", Value = 80, Size = 3 },
	bucket = { Name = "Ржавое ведро", Zone = 3, Rarity = "Common", Value = 100, Size = 2 },
	umbrella = { Name = "Сломанный зонт", Zone = 3, Rarity = "Uncommon", Value = 220, Size = 2 },
	crate = { Name = "Деревянный ящик", Zone = 3, Rarity = "Uncommon", Value = 260, Size = 3 },
	barrel = { Name = "Бочка", Zone = 3, Rarity = "Rare", Value = 650, Size = 4 },
	tv = { Name = "Старый телевизор", Zone = 3, Rarity = "Epic", Value = 1800, Size = 4 },
	chest = { Name = "Сундук пирата", Zone = 3, Rarity = "Legendary", Value = 10000, Size = 3 },

	-- Зона 4: Промзона
	pipe = { Name = "Обрезок трубы", Zone = 4, Rarity = "Common", Value = 600, Size = 2 },
	canister = { Name = "Канистра", Zone = 4, Rarity = "Common", Value = 750, Size = 2 },
	battery = { Name = "Аккумулятор", Zone = 4, Rarity = "Uncommon", Value = 1500, Size = 2 },
	tractortire = { Name = "Тракторная шина", Zone = 4, Rarity = "Uncommon", Value = 1900, Size = 5 },
	rustbarrel = { Name = "Ржавая бочка", Zone = 4, Rarity = "Rare", Value = 5000, Size = 4 },
	fridge = { Name = "Холодильник", Zone = 4, Rarity = "Epic", Value = 14000, Size = 6 },
	engine = { Name = "Двигатель V8", Zone = 4, Rarity = "Legendary", Value = 75000, Size = 5 },

	-- Зона 5: Ядовитый канал
	toxbarrel = { Name = "Токсичная бочка", Zone = 5, Rarity = "Common", Value = 4500, Size = 4 },
	slime = { Name = "Светящаяся слизь", Zone = 5, Rarity = "Common", Value = 5600, Size = 2 },
	flask = { Name = "Химическая колба", Zone = 5, Rarity = "Uncommon", Value = 11000, Size = 1 },
	gasmask = { Name = "Противогаз", Zone = 5, Rarity = "Uncommon", Value = 14000, Size = 2 },
	mutanttire = { Name = "Шина-мутант", Zone = 5, Rarity = "Rare", Value = 38000, Size = 4 },
	radcontainer = { Name = "Радиоактивный контейнер", Zone = 5, Rarity = "Epic", Value = 105000, Size = 4 },
	nukebattery = { Name = "Ядерная батарейка", Zone = 5, Rarity = "Legendary", Value = 560000, Size = 2 },

	-- Зона 6: Морское устье
	net = { Name = "Рыболовная сеть", Zone = 6, Rarity = "Common", Value = 34000, Size = 2 },
	buoy = { Name = "Сорванный буй", Zone = 6, Rarity = "Common", Value = 42000, Size = 3 },
	anchor = { Name = "Якорь", Zone = 6, Rarity = "Uncommon", Value = 85000, Size = 4 },
	wreck = { Name = "Обломок корабля", Zone = 6, Rarity = "Uncommon", Value = 105000, Size = 5 },
	mine = { Name = "Морская мина (пустая)", Zone = 6, Rarity = "Rare", Value = 280000, Size = 4 },
	safe = { Name = "Затонувший сейф", Zone = 6, Rarity = "Epic", Value = 800000, Size = 5 },
	crown = { Name = "Корона морского царя", Zone = 6, Rarity = "Legendary", Value = 4200000, Size = 2 },
}

----------------------------------------------------------------------
-- Магазин: сачки, рюкзаки, обувь (покупаются по порядку)
----------------------------------------------------------------------
-- Range — дальность сачка (в стадах), Cooldown — пауза между взмахами,
-- Multi — сколько предметов рядом ловится одним взмахом
Config.Nets = {
	{ Name = "Детский сачок", Icon = "🥅", Range = 16, Cooldown = 0.65, Multi = 1, Cost = 0 },
	{ Name = "Сачок рыбака", Icon = "🎣", Range = 20, Cooldown = 0.55, Multi = 1, Cost = 120 },
	{ Name = "Длинный сачок", Icon = "🥢", Range = 25, Cooldown = 0.5, Multi = 1, Cost = 900 },
	{ Name = "Телескопический сачок", Icon = "🔭", Range = 30, Cooldown = 0.45, Multi = 2, Cost = 7500 },
	{ Name = "Стальной сачок", Icon = "⚙️", Range = 36, Cooldown = 0.4, Multi = 2, Cost = 50000 },
	{ Name = "Траловая сеть", Icon = "🕸️", Range = 42, Cooldown = 0.35, Multi = 3, Cost = 350000 },
	{ Name = "Магнитный сачок", Icon = "🧲", Range = 50, Cooldown = 0.3, Multi = 3, Cost = 2500000 },
	{ Name = "Плазменный сачок", Icon = "⚡", Range = 58, Cooldown = 0.25, Multi = 4, Cost = 18000000 },
	{ Name = "Квантовый сачок", Icon = "🌀", Range = 68, Cooldown = 0.2, Multi = 4, Cost = 130000000 },
	{ Name = "Чёрная дыра", Icon = "🕳️", Range = 80, Cooldown = 0.15, Multi = 5, Cost = 900000000 },
}

Config.Backpacks = {
	{ Name = "Пакет-майка", Icon = "🛍️", Capacity = 15, Cost = 0 },
	{ Name = "Мешок", Icon = "💼", Capacity = 30, Cost = 80 },
	{ Name = "Школьный рюкзак", Icon = "🎒", Capacity = 60, Cost = 700 },
	{ Name = "Туристический рюкзак", Icon = "🏕️", Capacity = 120, Cost = 5000 },
	{ Name = "Садовая тачка", Icon = "🛒", Capacity = 220, Cost = 35000 },
	{ Name = "Контейнер", Icon = "📦", Capacity = 400, Cost = 250000 },
	{ Name = "Мусоровоз", Icon = "🚛", Capacity = 700, Cost = 1800000 },
	{ Name = "Баржа", Icon = "🚢", Capacity = 1200, Cost = 13000000 },
	{ Name = "Портал-хранилище", Icon = "🌌", Capacity = 2500, Cost = 100000000 },
	{ Name = "Карманная вселенная", Icon = "🪐", Capacity = 5000, Cost = 750000000 },
}

Config.Boots = {
	{ Name = "Старые кеды", Icon = "👟", WalkSpeed = 16, JumpHeight = 7.2, Cost = 0 },
	{ Name = "Кроссовки", Icon = "👟", WalkSpeed = 19, JumpHeight = 7.6, Cost = 300 },
	{ Name = "Беговые кроссовки", Icon = "🏃", WalkSpeed = 22, JumpHeight = 8, Cost = 4000 },
	{ Name = "Пружинные ботинки", Icon = "🦘", WalkSpeed = 25, JumpHeight = 9.5, Cost = 40000 },
	{ Name = "Реактивные кеды", Icon = "🚀", WalkSpeed = 28, JumpHeight = 10.5, Cost = 500000 },
	{ Name = "Сапоги-скороходы", Icon = "🥾", WalkSpeed = 32, JumpHeight = 11.5, Cost = 8000000 },
	{ Name = "Крылатые сандалии", Icon = "🪽", WalkSpeed = 37, JumpHeight = 13, Cost = 120000000 },
}

----------------------------------------------------------------------
-- Перки — то, что в других играх продают за робуксы. Тут — за монеты!
----------------------------------------------------------------------
Config.Perks = {
	AutoCollect = {
		Order = 1,
		Name = "Авто-сбор",
		Icon = "🤖",
		Desc = "Сачок сам ловит ближайший мусор в радиусе (чуть медленнее, чем руками).",
		MaxLevel = 1,
		Costs = { 2500 },
	},
	WaterWalk = {
		Order = 2,
		Name = "Водомерка",
		Icon = "🦶",
		Desc = "Ходи прямо по воде! Можно выключить в настройках.",
		MaxLevel = 1,
		Costs = { 15000 },
	},
	SellAnywhere = {
		Order = 3,
		Name = "Продажа где угодно",
		Icon = "📲",
		Desc = "Кнопка «Продать» работает из любой точки карты.",
		MaxLevel = 1,
		Costs = { 40000 },
	},
	AutoSell = {
		Order = 4,
		Name = "Авто-продажа",
		Icon = "♻️",
		Desc = "Когда рюкзак полон — мусор продаётся сам.",
		MaxLevel = 1,
		Costs = { 350000 },
	},
	Luck = {
		Order = 5,
		Name = "Удача",
		Icon = "🍀",
		Desc = "+12% удачи за уровень: чаще редкий и сияющий мусор.",
		MaxLevel = 10,
		BaseCost = 6000,
		Growth = 3.2,
		BonusPerLevel = 0.12,
	},
	Banker = {
		Order = 6,
		Name = "Банкир",
		Icon = "💼",
		Desc = "+20% монет за каждый уровень.",
		MaxLevel = 8,
		BaseCost = 20000,
		Growth = 4.5,
		BonusPerLevel = 0.2,
	},
	HelperSlots = {
		Order = 7,
		Name = "Слоты помощников",
		Icon = "🐾",
		Desc = "+1 место для помощника за уровень.",
		MaxLevel = 4,
		Costs = { 12000, 250000, 6000000, 120000000 },
	},
	Storage = {
		Order = 8,
		Name = "Склад фабрики",
		Icon = "🏬",
		Desc = "Фабрика дольше копит монеты, пока тебя нет.",
		MaxLevel = 4,
		Costs = { 25000, 500000, 10000000, 200000000 },
	},
}

----------------------------------------------------------------------
-- Помощники: летают рядом и сами ловят мусор
----------------------------------------------------------------------
Config.Helpers = {
	{ Key = "duck", Name = "Утёнок Кряк", Cost = 400, Interval = 3.5, Range = 22, Desc = "Маленький, но старательный." },
	{ Key = "frog", Name = "Лягушка Ква", Cost = 3000, Interval = 3.0, Range = 26, Desc = "Ловит мусор языком!" },
	{ Key = "raccoon", Name = "Енот-чистюля", Cost = 25000, Interval = 2.5, Range = 30, Desc = "Обожает всё мыть." },
	{ Key = "beaver", Name = "Бобр-инженер", Cost = 200000, Interval = 2.0, Range = 34, Desc = "Строит фильтры из веток." },
	{ Key = "robot", Name = "Робот-уборщик", Cost = 1500000, Interval = 1.6, Range = 40, Desc = "Работает без перерывов." },
	{ Key = "drone", Name = "Дрон-сборщик", Cost = 12000000, Interval = 1.2, Range = 48, Desc = "Видит мусор с высоты." },
	{ Key = "whale", Name = "Летающий кит", Cost = 100000000, Interval = 0.9, Range = 56, Desc = "Фильтрует целую реку." },
	{ Key = "ufo", Name = "НЛО-пылесос", Cost = 800000000, Interval = 0.6, Range = 66, Desc = "Инопланетные технологии уборки." },
}

----------------------------------------------------------------------
-- Фабрика переработки — пассивный доход (копит даже когда ты не в игре)
----------------------------------------------------------------------
Config.Factory = {
	MaxLevel = 20,
	BaseCost = 750,
	CostGrowth = 2.3,
	BaseRate = 1, -- монет в секунду на 1 уровне
	RateGrowth = 1.7,
	BaseBuildTime = 20, -- секунд стройки 1 уровня
	BuildGrowth = 1.5,
	MaxBuildTime = 7200, -- стройка не дольше 2 часов
	StorageHours = { 2, 4, 8, 12, 24 }, -- по уровням перка «Склад фабрики»
}

----------------------------------------------------------------------
-- Бесплатные бусты: включаешь — работают, потом перезаряжаются.
-- Никаких покупок, просто подожди!
----------------------------------------------------------------------
Config.Boosts = {
	{ Key = "Coins2x", Name = "x2 Монеты", Icon = "💰", Desc = "Продажа мусора приносит в 2 раза больше.", Duration = 600, Cooldown = 2400 },
	{ Key = "Luck2x", Name = "x2 Удача", Icon = "🍀", Desc = "В 2 раза выше шанс сияющего и редкого мусора.", Duration = 600, Cooldown = 3000 },
	{ Key = "SuperNet", Name = "Супер-сачок", Icon = "🥅", Desc = "+50% к дальности, взмахи на 40% быстрее.", Duration = 300, Cooldown = 1800 },
	{ Key = "HelpersFast", Name = "Бодрые помощники", Icon = "🐾", Desc = "Помощники работают в 2 раза быстрее.", Duration = 600, Cooldown = 2700 },
	{ Key = "FactoryTurbo", Name = "Турбо-фабрика", Icon = "🏭", Desc = "Фабрика производит в 3 раза больше.", Duration = 1200, Cooldown = 7200, FactoryMult = 3 },
}

----------------------------------------------------------------------
-- Перерождение
----------------------------------------------------------------------
Config.Rebirth = {
	BaseCost = 1000000,
	CostGrowth = 4,
	CoinBonus = 0.5, -- +50% монет за каждое перерождение
	LuckBonus = 0.05, -- +5% удачи за каждое перерождение
}

----------------------------------------------------------------------
-- Награды
----------------------------------------------------------------------
Config.Daily = {
	Mults = { 2, 3, 4, 6, 8, 10, 20 }, -- множители RewardBase по дням серии
	MinInterval = 20 * 3600, -- раз в 20 часов
	StreakWindow = 48 * 3600, -- если пропустил больше 48 часов — серия сбрасывается
}

-- Подарки за время в игре (за текущий заход)
Config.Gifts = {
	{ Minutes = 3, Mult = 1 },
	{ Minutes = 8, Mult = 2 },
	{ Minutes = 15, Mult = 3 },
	{ Minutes = 25, Mult = 5 },
	{ Minutes = 40, Mult = 8 },
	{ Minutes = 60, Mult = 15, Boost = "Coins2x" },
}

Config.Quests = {
	Slots = 3,
	RerollCooldown = 300, -- заменить задание можно раз в 5 минут
}

-- Каждый новый предмет в коллекции даёт +1.5% к монетам навсегда
Config.Collection = {
	BonusPerItem = 0.015,
}

----------------------------------------------------------------------
-- Появление мусора
----------------------------------------------------------------------
Config.Spawning = {
	StuckChance = 0.35, -- доля мусора, застрявшего у берега (не уплывает)
	StuckLife = { 110, 170 },
	IdleMax = 14, -- сколько мусора держать в зоне, где никого нет
	PrefillCount = 20,
	ArrivalFill = 0.6, -- когда в пустую зону приходит игрок, река сразу заполняется до 60% -- сколько мусора сразу при старте сервера
	PlayerSpawnBonus = 0.35, -- каждый игрок в зоне ускоряет появление на 35%
}

Config.AutoCollect = {
	CooldownMult = 1.6, -- авто-сбор медленнее ручного
}

----------------------------------------------------------------------
-- Глобальные события сервера
----------------------------------------------------------------------
Config.Events = {
	FirstDelay = 240,
	Interval = { 420, 600 },
	List = {
		{
			Key = "TrashStorm",
			Name = "Мусорный шторм",
			Icon = "🌪️",
			Desc = "Мусора в 3 раза больше!",
			Duration = 120,
			SpawnMult = 3,
			MaxMult = 1.6,
		},
		{ Key = "GoldenHour", Name = "Золотой час", Icon = "🌟", Desc = "Все монеты x2!", Duration = 150, CoinMult = 2 },
		{ Key = "LuckyRain", Name = "Звездопад удачи", Icon = "🍀", Desc = "Удача x2 для всех!", Duration = 150, LuckMult = 2 },
	},
}

-- Настройки, которые игрок может переключать
Config.SettingKeys = {
	AutoCollect = true,
	AutoSell = true,
	WaterWalk = true,
	ShowRange = true,
	Sounds = true,
	Music = true,
	Effects = true,
}

----------------------------------------------------------------------
-- Быстрые таблицы (заполняются автоматически)
----------------------------------------------------------------------
Config.BoostByKey = {}
for _, boost in Config.Boosts do
	Config.BoostByKey[boost.Key] = boost
end

Config.HelperByKey = {}
for index, helper in Config.Helpers do
	helper.Index = index
	Config.HelperByKey[helper.Key] = helper
end

Config.EventByKey = {}
for _, event in Config.Events.List do
	Config.EventByKey[event.Key] = event
end

-- Порядок перков для магазина
Config.PerkOrder = {}
for key, perk in Config.Perks do
	perk.Key = key
	table.insert(Config.PerkOrder, key)
end
table.sort(Config.PerkOrder, function(a, b)
	return Config.Perks[a].Order < Config.Perks[b].Order
end)

-- Сколько предметов каждой редкости в каждой зоне (для весов выпадения)
Config.ZoneRarityCount = {}
for zoneId, zone in Config.Zones do
	local counts = {}
	for _, key in zone.Trash do
		local def = Config.Trash[key]
		assert(def, "Нет описания мусора: " .. key)
		def.Key = key
		counts[def.Rarity] = (counts[def.Rarity] or 0) + 1
	end
	Config.ZoneRarityCount[zoneId] = counts
end

Config.TotalTrashTypes = 0
for _ in Config.Trash do
	Config.TotalTrashTypes += 1
end

return Config
