import type { Herb, Potion, ExtremeRecipe, Recipe, PotionRecipe } from "./types";

export const herbs: Herb[] = [
	{
		id: "torstol",
		name: "Clean Torstol",
		image: "https://runescape.wiki/images/Clean_torstol.png?cd9f7",
		quantity: 0,
	},
	{
		id: "avantoe",
		name: "Clean Avantoe",
		image: "https://runescape.wiki/images/Clean_avantoe.png?cd9f7",
		quantity: 0,
	},
	{
		id: "lantadyme",
		name: "Clean Lantadyme",
		image: "https://runescape.wiki/images/Clean_lantadyme.png?cd9f7",
		quantity: 0,
	},
	{
		id: "dwarf_weed",
		name: "Clean Dwarf Weed",
		image: "https://runescape.wiki/images/Clean_dwarf_weed.png?cd9f7",
		quantity: 0,
	},
	{
		id: "irit",
		name: "Clean Irit",
		image: "https://runescape.wiki/images/Clean_irit.png?cd9f7",
		quantity: 0,
	},
	{
		id: "kwuarm",
		name: "Clean Kwuarm",
		image: "https://runescape.wiki/images/Clean_kwuarm.png?cd9f7",
		quantity: 0,
	},
	{
		id: "cadantine",
		name: "Clean Cadantine",
		image: "https://runescape.wiki/images/Clean_cadantine.png?cd9f7",
		quantity: 0,
	},
	{
		id: "spirit_weed",
		name: "Clean Spirit Weed",
		image: "https://runescape.wiki/images/Clean_spirit_weed.png?cd9f7",
		quantity: 0,
	},
	{
		id: "fellstalk",
		name: "Clean Fellstalk",
		image: "https://runescape.wiki/images/Clean_fellstalk.png?cd9f7",
		quantity: 0,
	},
	{
		id: "ranarr",
		name: "Clean Ranarr",
		image: "https://runescape.wiki/images/Clean_ranarr.png?cd9f7",
		quantity: 0,
	},
];

// Update secondaries array with modified potion names
export const secondaries = [
	{
		id: "super_attack",
		name: "Super Attack",
		image: "https://runescape.wiki/images/Super_attack_%284%29.png?2c645",
		quantity: 0,
	},
	{
		id: "super_strength",
		name: "Super Strength",
		image: "https://runescape.wiki/images/Super_strength_%284%29.png?2c645",
		quantity: 0,
	},
	{
		id: "super_defence",
		name: "Super Defence",
		image: "https://runescape.wiki/images/Super_defence_%284%29.png?2c645",
		quantity: 0,
	},
	{
		id: "super_ranging",
		name: "Super Ranging",
		image: "https://runescape.wiki/images/Super_ranging_potion_%284%29.png?c44ba",
		quantity: 0,
	},
	{
		id: "super_magic",
		name: "Super Magic",
		image: "https://runescape.wiki/images/Super_magic_potion_%284%29.png?c44ba",
		quantity: 0,
	},
	{
		id: "super_necromancy",
		name: "Super Necromancy",
		image: "https://runescape.wiki/images/Super_necromancy_%284%29.png?e5c3b",
		quantity: 0,
	},
	{
		id: "grenwall_spikes",
		name: "Grenwall Spikes",
		image: "https://runescape.wiki/images/Grenwall_spikes_5.png?50a59",
		quantity: 0,
	},
	{
		id: "ground_mud_runes",
		name: "Ground Mud Runes",
		image: "https://runescape.wiki/images/Ground_mud_runes.png?89252",
		quantity: 0,
	},
	{
		id: "potato_cactus",
		name: "Potato Cactus",
		image: "https://runescape.wiki/images/Potato_cactus.png?673c8",
		quantity: 0,
	},
	{
		id: "wine_of_zamorak",
		name: "Wine of Zamorak",
		image: "https://runescape.wiki/images/Wine_of_Zamorak.png?11619",
		quantity: 0,
	},
	{
		id: "congealed_blood",
		name: "Congealed Blood",
		image: "https://runescape.wiki/images/Congealed_blood_1000.png?4e5c0",
		quantity: 0,
	},
	{
		id: "ground_miasma_runes",
		name: "Ground Miasma Runes",
		image: "https://runescape.wiki/images/Ground_miasma_rune.png?306ef",
		quantity: 0,
	},
	{
		id: "eye_of_newt",
		name: "Eye of Newt",
		image: "https://runescape.wiki/images/Eye_of_newt.png?76155",
		quantity: 0,
	},
	{
		id: "limpwurt_root",
		name: "Limpwurt Root",
		image: "https://runescape.wiki/images/Limpwurt_root.png?a8b76",
		quantity: 0,
	},
	{
		id: "white_berries",
		name: "White Berries",
		image: "https://runescape.wiki/images/White_berries.png?19115",
		quantity: 0,
	},
	{
		id: "prayer_renewal",
		name: "Prayer Renewal",
		image: "https://runescape.wiki/images/Prayer_renewal_%284%29.png?ed26c",
		quantity: 0,
	},
	{
		id: "prayer_potion",
		name: "Prayer Potion",
		image: "https://runescape.wiki/images/Prayer_potion_%284%29.png?2c645",
		quantity: 0,
	},
	{
		id: "super_antifire",
		name: "Super Antifire",
		image: "https://runescape.wiki/images/Super_antifire_%284%29.png?8f9b5",
		quantity: 0,
	},
	{
		id: "antifire",
		name: "Antifire",
		image: "https://runescape.wiki/images/Antifire_%284%29.png?2c645",
		quantity: 0,
	},
	{
		id: "super_antipoison",
		name: "Super Antipoison",
		image: "https://runescape.wiki/images/Super_antipoison_%284%29.png?e04a9",
		quantity: 0,
	},
	{
		id: "primal_extract",
		name: "Primal Extract",
		image: "https://runescape.wiki/images/Primal_extract.png?018b2",
		quantity: 0,
	},
	{
		id: "morchella_mushroom",
		name: "Morchella Mushroom",
		image: "https://runescape.wiki/images/Morchella_mushroom.png?673c8",
		quantity: 0,
	},
	{
		id: "snape_grass",
		name: "Snape Grass",
		image: "https://runescape.wiki/images/Snape_grass.png?673c8",
		quantity: 0,
	},
	{
		id: "unicorn_horn_dust",
		name: "Unicorn Horn Dust",
		image: "https://runescape.wiki/images/Unicorn_horn_dust.png?673c8",
		quantity: 0,
	},
	{
		id: "dragon_scale_dust",
		name: "Dragon Scale Dust",
		image: "https://runescape.wiki/images/Dragon_scale_dust.png?673c8",
		quantity: 0,
	},
	{
		id: "phoenix_feather",
		name: "Phoenix Feather",
		image: "https://runescape.wiki/images/Phoenix_feather.png?673c8",
		quantity: 0,
	}
];

// Update extreme potions array
export const extremePotions = [
	{
		id: "extreme_attack",
		name: "Extreme Attack",
		image: "https://runescape.wiki/images/Extreme_attack_%284%29.png?1c7b1",
		quantity: 0,
	},
	{
		id: "extreme_strength",
		name: "Extreme Strength",
		image: "https://runescape.wiki/images/Extreme_strength_%284%29.png?1c7b1",
		quantity: 0,
	},
	{
		id: "extreme_defence",
		name: "Extreme Defence",
		image: "https://runescape.wiki/images/Extreme_defence_%284%29.png?1c7b1",
		quantity: 0,
	},
	{
		id: "extreme_ranging",
		name: "Extreme Ranging",
		image: "https://runescape.wiki/images/Extreme_ranging_%284%29.png?1c7b1",
		quantity: 0,
	},
	{
		id: "extreme_magic",
		name: "Extreme Magic",
		image: "https://runescape.wiki/images/Extreme_magic_%284%29.png?1c7b1",
		quantity: 0,
	},
	{
		id: "extreme_necromancy",
		name: "Extreme Necromancy",
		image: "https://runescape.wiki/images/Extreme_necromancy_%284%29.png?1c7b1",
		quantity: 0,
	},
];

export const overloadRecipe: Potion = {
	id: "overload",
	name: "Overload",
	image: "https://runescape.wiki/images/Overload_%284%29_detail.png?018b2",
	ingredients: [
		{
			id: "torstol",
			name: "Clean Torstol",
			quantity: 1,
			image: "https://runescape.wiki/images/Clean_torstol_detail.png?ec336",
		},
		{
			id: "extreme_attack",
			name: "Extreme Attack",
			quantity: 1,
			doses: 3,
			image: "https://runescape.wiki/images/Extreme_attack_%284%29_detail.png?018b2",
		},
		{
			id: "extreme_strength",
			name: "Extreme Strength",
			quantity: 1,
			doses: 3,
			image: "https://runescape.wiki/images/Extreme_strength_%284%29_detail.png?018b2",
		},
		{
			id: "extreme_defence",
			name: "Extreme Defence",
			quantity: 1,
			doses: 3,
			image: "https://runescape.wiki/images/Extreme_defence_%284%29_detail.png?018b2",
		},
		{
			id: "extreme_ranging",
			name: "Extreme Ranging",
			quantity: 1,
			doses: 3,
			image: "https://runescape.wiki/images/Extreme_ranging_%284%29_detail.png?018b2",
		},
		{
			id: "extreme_magic",
			name: "Extreme Magic",
			quantity: 1,
			doses: 3,
			image: "https://runescape.wiki/images/Extreme_magic_%284%29_detail.png?018b2",
		},
		{
			id: "extreme_necromancy",
			name: "Extreme Necromancy",
			quantity: 1,
			doses: 3,
			image: "https://runescape.wiki/images/Extreme_necromancy_%284%29_detail.png?018b2",
		},
	],
};

export const additionalOverloadRecipes: Record<string, Potion> = {
	supreme_overload: {
		id: "supreme_overload",
		name: "Supreme Overload",
		image: "https://runescape.wiki/images/Supreme_overload_potion_%286%29.png",
		ingredients: [
			{
				id: "overload",
				name: "Overload",
				quantity: 1,
				doses: 4,
				image: "https://runescape.wiki/images/Overload_%284%29_detail.png?018b2",
			},
			{
				id: "super_attack",
				name: "Super Attack",
				quantity: 1,
				doses: 3,
				image: "https://runescape.wiki/images/Super_attack_%284%29_detail.png?018b2",
			},
			{
				id: "super_strength",
				name: "Super Strength",
				quantity: 1,
				doses: 3,
				image: "https://runescape.wiki/images/Super_strength_%284%29_detail.png?018b2",
			},
			{
				id: "super_defence",
				name: "Super Defence",
				quantity: 1,
				doses: 3,
				image: "https://runescape.wiki/images/Super_defence_%284%29_detail.png?018b2",
			},
			{
				id: "super_ranging",
				name: "Super Ranging",
				quantity: 1,
				doses: 3,
				image: "https://runescape.wiki/images/Super_ranging_%284%29_detail.png?018b2",
			},
			{
				id: "super_magic",
				name: "Super Magic",
				quantity: 1,
				doses: 3,
				image: "https://runescape.wiki/images/Super_magic_%284%29_detail.png?018b2",
			},
			{
				id: "super_necromancy",
				name: "Super Necromancy",
				quantity: 1,
				doses: 3,
				image: "https://runescape.wiki/images/Super_necromancy_%284%29_detail.png?018b2",
			},
		],
	},
	overload_salve: {
		id: "overload_salve",
		name: "Overload Salve",
		image: "https://runescape.wiki/images/Overload_salve_%286%29_detail.png?018b2",
		ingredients: [
			{
				id: "overload",
				name: "Overload",
				quantity: 1,
				image: "https://runescape.wiki/images/Overload_%284%29_detail.png?018b2",
			},
			{
				id: "prayer_renewal",
				name: "Prayer Renewal",
				quantity: 1,
				image: "https://runescape.wiki/images/Prayer_renewal_%284%29_detail.png?018b2",
			},
			{
				id: "prayer_potion",
				name: "Prayer Potion",
				quantity: 1,
				image: "https://runescape.wiki/images/Prayer_potion_%284%29_detail.png?018b2",
			},
			{
				id: "super_antifire",
				name: "Super Antifire",
				quantity: 1,
				image: "https://runescape.wiki/images/Super_antifire_%284%29_detail.png?018b2",
			},
			{
				id: "antifire",
				name: "Antifire",
				quantity: 1,
				image: "https://runescape.wiki/images/Antifire_%284%29_detail.png?018b2",
			},
			{
				id: "super_antipoison",
				name: "Super Antipoison",
				quantity: 1,
				image: "https://runescape.wiki/images/Super_antipoison%2B%2B_%284%29_detail.png?018b2",
			},
		],
	},
	supreme_overload_salve: {
		id: "supreme_overload_salve",
		name: "Supreme Overload Salve",
		image: "https://runescape.wiki/images/Supreme_overload_salve_%286%29_detail.png?018b2",
		ingredients: [
			{
				id: "supreme_overload",
				name: "Supreme Overload",
				quantity: 1,
				image: "https://runescape.wiki/images/Supreme_overload_potion_%286%29_detail.png?018b2",
			},
			{
				id: "prayer_renewal",
				name: "Prayer Renewal",
				quantity: 1,
				image: "https://runescape.wiki/images/Prayer_renewal_%284%29_detail.png?018b2",
			},
			{
				id: "prayer_potion",
				name: "Prayer Potion",
				quantity: 1,
				image: "https://runescape.wiki/images/Prayer_potion_%284%29_detail.png?018b2",
			},
			{
				id: "super_antifire",
				name: "Super Antifire",
				quantity: 1,
				image: "https://runescape.wiki/images/Super_antifire_%284%29_detail.png?018b2",
			},
			{
				id: "antifire",
				name: "Antifire",
				quantity: 1,
				image: "https://runescape.wiki/images/Antifire_%284%29_detail.png?018b2",
			},
			{
				id: "super_antipoison",
				name: "Super Antipoison",
				quantity: 1,
				image: "https://runescape.wiki/images/Super_antipoison%2B%2B_%284%29_detail.png?018b2",
			},
		],
	},
	elder_overload: {
		id: "elder_overload",
		name: "Elder Overload",
		image: "https://runescape.wiki/images/Elder_overload_potion_%286%29_detail.png?018b2",
		ingredients: [
			{
				id: "supreme_overload",
				name: "Supreme Overload",
				quantity: 1,
				image: "https://runescape.wiki/images/Supreme_overload_potion_%286%29_detail.png?018b2",
			},
			{
				id: "primal_extract",
				name: "Primal Extract",
				quantity: 1,
				image: "https://runescape.wiki/images/Primal_extract.png?018b2",
			},
			{
				id: "fellstalk",
				name: "Clean Fellstalk",
				quantity: 1,
				image: "https://runescape.wiki/images/Clean_fellstalk.png?cd9f7",
			},
		],
	},
	elder_overload_salve: {
		id: "elder_overload_salve",
		name: "Elder Overload Salve",
		image: "https://runescape.wiki/images/Elder_overload_salve_%286%29_detail.png?018b2",
		ingredients: [
			{
				id: "elder_overload",
				name: "Elder Overload",
				quantity: 1,
				image: "https://runescape.wiki/images/Elder_overload_potion_%286%29_detail.png?018b2",
			},
			{
				id: "prayer_renewal",
				name: "Prayer Renewal",
				quantity: 1,
				image: "https://runescape.wiki/images/Prayer_renewal_%284%29_detail.png?018b2",
			},
			{
				id: "prayer_potion",
				name: "Prayer Potion",
				quantity: 1,
				image: "https://runescape.wiki/images/Prayer_potion_%284%29_detail.png?018b2",
			},
			{
				id: "super_antifire",
				name: "Super Antifire",
				quantity: 1,
				image: "https://runescape.wiki/images/Super_antifire_%284%29_detail.png?018b2",
			},
			{
				id: "antifire",
				name: "Antifire",
				quantity: 1,
				image: "https://runescape.wiki/images/Antifire_%284%29_detail.png?018b2",
			},
			{
				id: "super_antipoison",
				name: "Super Antipoison",
				quantity: 1,
				image: "https://runescape.wiki/images/Super_antipoison%2B%2B_%284%29_detail.png?018b2",
			},
		],
	},
};

export const extremeRecipes: Record<string, ExtremeRecipe> = {
	extreme_attack: {
		herb: "avantoe",
		secondary: "super_attack",
		doses: 3,
	},
	extreme_strength: {
		herb: "dwarf_weed",
		secondary: "super_strength",
		doses: 3,
	},
	extreme_defence: {
		herb: "lantadyme",
		secondary: "super_defence",
		doses: 3,
	},
	extreme_ranging: {
		herb: "", // No herb needed
		secondary: "super_magic",
		other: "grenwall_spikes",
		otherQuantity: 5,
		doses: 3,
	},
	extreme_magic: {
		herb: "", // No herb needed
		secondary: "super_ranging",
		other: "ground_mud_runes",
		doses: 3,
	},
	extreme_necromancy: {
		herb: "", // No herb needed
		secondary: "super_necromancy",
		other: "ground_miasma_runes",
		doses: 3,
	},
};

export const superRecipes: Record<string, Recipe> = {
	super_attack: {
		herb: "irit",
		secondary: "eye_of_newt",
		doses: 3, // Makes 3 doses
	},
	super_strength: {
		herb: "kwuarm",
		secondary: "limpwurt_root",
		doses: 3,
	},
	super_defence: {
		herb: "cadantine",
		secondary: "white_berries",
		doses: 3,
	},
	super_ranging: {
		herb: "dwarf_weed",
		secondary: "wine_of_zamorak",
		doses: 3,
	},
	super_magic: {
		herb: "lantadyme",
		secondary: "potato_cactus",
		doses: 3,
	},
	super_necromancy: {
		herb: "spirit_weed",
		secondary: "congealed_blood",
		quantity: 5,
		doses: 3,
	},
};

// Additional potion recipes
export const otherPotionRecipes: Record<string, PotionRecipe> = {
	prayer_renewal: {
		herb: "fellstalk",
		secondary: "morchella_mushroom",
		doses: 4,
	},
	prayer_potion: {
		herb: "ranarr",
		secondary: "snape_grass",
		doses: 4,
	},
	super_antipoison: {
		herb: "irit",
		secondary: "unicorn_horn_dust",
		doses: 4,
	},
	antifire: {
		herb: "lantadyme",
		secondary: "dragon_scale_dust",
		doses: 4,
	},
	super_antifire: {
		potion: "antifire",
		secondary: "phoenix_feather",
		doses: 4,
	},
};


export const getDefaultInventory = () => {
	return {
		herbs: herbs.reduce((acc, herb) => ({ ...acc, [herb.id]: 0 }), {}),
		secondaries: secondaries.reduce((acc, secondary) => ({ ...acc, [secondary.id]: 0 }), {}),
		potionDoses: {}, // Stores total doses for each potion type
		potionCounts: {}, // Stores individual potion counts by dose
	};
};
