import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { extremeRecipes } from "./data";
import type { InventoryState, Recipe } from "./types";
import { superRecipes } from "./data";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Helper function to convert between doses
export function convertDoses(
	potions: Record<string, number>,
	fromDose: number,
	toDose: number,
): Record<string, number> {
	const result: Record<string, number> = { ...potions };

	// Calculate total doses for each potion
	Object.keys(potions).forEach((potionId) => {
		const totalDoses = potions[potionId] * fromDose;

		// Calculate how many full potions of the target dose
		const fullPotions = Math.floor(totalDoses / toDose);

		// Calculate remaining doses
		const remainingDoses = totalDoses % toDose;

		// Store the result
		result[potionId] = fullPotions;

		// If we're tracking 1-dose potions separately, we could add them here
		// For now, we'll just track the full potions
	});

	return result;
}

// Helper function to calculate effective 3-dose potions from 4-dose potions
export function calculateEffective3DosePotions(potions: Record<string, number>): Record<string, number> {
	const result: Record<string, number> = {};

	Object.keys(potions).forEach((potionId) => {
		const fourDosePotions = potions[potionId] || 0;

		// Each 4-dose potion can make 1 3-dose potion and has 1 dose left over
		const threeDosePotions = fourDosePotions;

		// Every 3 leftover doses can make another 3-dose potion
		const leftoverDoses = fourDosePotions;
		const additionalThreeDosePotions = Math.floor(leftoverDoses / 3);

		// Total 3-dose potions
		result[potionId] = threeDosePotions + additionalThreeDosePotions;
	});

	return result;
}

export function calculatePossibleOverloads(inventory: InventoryState): {
	possibleOverloads: number;
	limitingFactors: string[];
} {
	// Check direct ingredients first
	const torstolLimit = inventory.herbs.torstol || 0;

	// Convert 4-dose extremes to effective 3-dose extremes for calculation
	const effective3DoseExtremes = calculateEffective3DosePotions(inventory.extremePotions);

	const extremeLimits = {
		extreme_attack: effective3DoseExtremes.extreme_attack || 0,
		extreme_strength: effective3DoseExtremes.extreme_strength || 0,
		extreme_defence: effective3DoseExtremes.extreme_defence || 0,
		extreme_ranging: effective3DoseExtremes.extreme_ranging || 0,
		extreme_magic: effective3DoseExtremes.extreme_magic || 0,
		extreme_necromancy: effective3DoseExtremes.extreme_necromancy || 0,
	};

	// Find the minimum value among all ingredients
	const limits = [
		torstolLimit,
		extremeLimits.extreme_attack,
		extremeLimits.extreme_strength,
		extremeLimits.extreme_defence,
		extremeLimits.extreme_ranging,
		extremeLimits.extreme_magic,
		extremeLimits.extreme_necromancy,
	];

	const possibleOverloads = Math.min(...limits);

	// Determine limiting factors
	const limitingFactors: string[] = [];

	if (torstolLimit === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Clean Torstol");
	}

	if (extremeLimits.extreme_attack === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Extreme Attack");
	}

	if (extremeLimits.extreme_strength === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Extreme Strength");
	}

	if (extremeLimits.extreme_defence === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Extreme Defence");
	}

	if (extremeLimits.extreme_ranging === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Extreme Ranging");
	}

	if (extremeLimits.extreme_magic === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Extreme Magic");
	}

	if (extremeLimits.extreme_necromancy === possibleOverloads && possibleOverloads !== Number.POSITIVE_INFINITY) {
		limitingFactors.push("Extreme Necromancy");
	}

	return { possibleOverloads, limitingFactors };
}

export function calculatePossibleExtremes(inventory: InventoryState) {
	const results: Record<string, { possible: number; limitingFactor: string; }> = {};

	// Calculate for each extreme potion
	Object.entries(extremeRecipes).forEach(([potionId, recipe]) => {
		const herbId = recipe.herb;
		const secondaryId = recipe.secondary;
		const otherId = recipe.other;
		const otherQuantity = recipe.otherQuantity || 1;

		const herbCount = herbId ? inventory.herbs[herbId] || 0 : Number.POSITIVE_INFINITY;
		const secondaryCount = inventory.secondaries[secondaryId] || 0;
		const otherCount = otherId
			? Math.floor((inventory.secondaries[otherId] || 0) / otherQuantity)
			: Number.POSITIVE_INFINITY;

		const possible = Math.min(herbCount, secondaryCount, otherCount);

		let limitingFactor = "";
		if (herbId && herbCount === possible && possible !== Number.POSITIVE_INFINITY) {
			limitingFactor = `Clean ${herbId.charAt(0).toUpperCase() + herbId.slice(1)}`;
		} else if (secondaryCount === possible && possible !== Number.POSITIVE_INFINITY) {
			limitingFactor = secondaryId
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		} else if (otherId && otherCount === possible && possible !== Number.POSITIVE_INFINITY) {
			limitingFactor = otherId
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		}

		results[potionId] = { possible, limitingFactor };
	});

	return results;
}

export function calculatePossibleSupers(inventory: InventoryState) {
	const results: Record<string, { possible: number; limitingFactor: string; }> = {};

	// Calculate for each super potion
	Object.entries(superRecipes).forEach(([potionId, recipe]) => {
		const herbId = recipe.herb;
		const secondaryId = recipe.secondary;
		const secondaryQuantity = recipe.quantity || 1;

		const herbCount = inventory.herbs[herbId] || 0;
		const secondaryCount = Math.floor((inventory.secondaries[secondaryId] || 0) / secondaryQuantity);

		const possible = Math.min(herbCount, secondaryCount);

		let limitingFactor = "";
		if (herbCount === possible && possible !== Number.POSITIVE_INFINITY) {
			limitingFactor = `Clean ${herbId.charAt(0).toUpperCase() + herbId.slice(1)}`;
		} else if (secondaryCount === possible && possible !== Number.POSITIVE_INFINITY) {
			limitingFactor = secondaryId
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		}

		results[potionId] = { possible, limitingFactor };
	});

	return results;
}

export function calculateOverloadsFromScratch(inventory: InventoryState) {
	// Calculate how many super potions can be made
	const superResults = calculatePossibleSupers(inventory);

	// Calculate how many extreme potions can be made from supers
	const virtualInventory: InventoryState = {
		...inventory,
		secondaries: {
			...inventory.secondaries,
			super_attack: superResults.super_attack?.possible || 0,
			super_strength: superResults.super_strength?.possible || 0,
			super_defence: superResults.super_defence?.possible || 0,
			super_ranging: superResults.super_ranging?.possible || 0,
			super_magic: superResults.super_magic?.possible || 0,
			super_necromancy: superResults.super_necromancy?.possible || 0,
		},
	};

	const extremeResults = calculatePossibleExtremes(virtualInventory);

	// Calculate how many overloads can be made from extremes
	const finalInventory: InventoryState = {
		...virtualInventory,
		extremePotions: {
			extreme_attack: extremeResults.extreme_attack?.possible || 0,
			extreme_strength: extremeResults.extreme_strength?.possible || 0,
			extreme_defence: extremeResults.extreme_defence?.possible || 0,
			extreme_ranging: extremeResults.extreme_ranging?.possible || 0,
			extreme_magic: extremeResults.extreme_magic?.possible || 0,
			extreme_necromancy: extremeResults.extreme_necromancy?.possible || 0,
		},
	};

	const overloadResults = calculatePossibleOverloads(finalInventory);

	return {
		superResults,
		extremeResults,
		overloadResults,
	};
}

export function calculateAdditionalOverloads(
	inventory: InventoryState,
	baseOverloads: number,
): Record<string, { possible: number; limitingFactors: string[]; }> {
	const results: Record<string, { possible: number; limitingFactors: string[]; }> = {};

	// Supreme Overload
	const overloads = baseOverloads;
	const superAttack = inventory.secondaries.super_attack || 0;
	const superStrength = inventory.secondaries.super_strength || 0;
	const superDefence = inventory.secondaries.super_defence || 0;
	const superRanging = inventory.secondaries.super_ranging || 0;
	const superMagic = inventory.secondaries.super_magic || 0;
	const superNecromancy = inventory.secondaries.super_necromancy || 0;

	const possibleSupremeOverloads = Math.min(
		overloads,
		superAttack,
		superStrength,
		superDefence,
		superRanging,
		superMagic,
		superNecromancy,
	);

	const supremeLimitingFactors: string[] = [];
	if (overloads === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Overload");
	}
	if (superAttack === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Super Attack");
	}
	if (superStrength === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Super Strength");
	}
	if (superDefence === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Super Defence");
	}
	if (superRanging === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Super Ranging");
	}
	if (superMagic === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Super Magic");
	}
	if (superNecromancy === possibleSupremeOverloads && possibleSupremeOverloads !== Number.POSITIVE_INFINITY) {
		supremeLimitingFactors.push("Super Necromancy");
	}

	results.supreme_overload = {
		possible: possibleSupremeOverloads,
		limitingFactors: supremeLimitingFactors,
	};

	// Overload Salve
	const prayerRenewal = inventory.secondaries.prayer_renewal || 0;
	const prayerPotion = inventory.secondaries.prayer_potion || 0;
	const superAntifire = inventory.secondaries.super_antifire || 0;
	const antifire = inventory.secondaries.antifire || 0;
	const superAntipoison = inventory.secondaries.super_antipoison || 0;

	const possibleOverloadSalve = Math.min(baseOverloads, prayerRenewal, prayerPotion, superAntifire, antifire, superAntipoison);

	const salveLimitingFactors: string[] = [];
	if (baseOverloads === possibleOverloadSalve && possibleOverloadSalve !== Number.POSITIVE_INFINITY) {
		salveLimitingFactors.push("Overload");
	}
	if (prayerRenewal === possibleOverloadSalve && possibleOverloadSalve !== Number.POSITIVE_INFINITY) {
		salveLimitingFactors.push("Prayer Renewal");
	}
	if (prayerPotion === possibleOverloadSalve && possibleOverloadSalve !== Number.POSITIVE_INFINITY) {
		salveLimitingFactors.push("Prayer Potion");
	}
	if (superAntifire === possibleOverloadSalve && possibleOverloadSalve !== Number.POSITIVE_INFINITY) {
		salveLimitingFactors.push("Super Antifire");
	}
	if (antifire === possibleOverloadSalve && possibleOverloadSalve !== Number.POSITIVE_INFINITY) {
		salveLimitingFactors.push("Antifire");
	}
	if (superAntipoison === possibleOverloadSalve && possibleOverloadSalve !== Number.POSITIVE_INFINITY) {
		salveLimitingFactors.push("Super Antipoison");
	}

	results.overload_salve = {
		possible: possibleOverloadSalve,
		limitingFactors: salveLimitingFactors,
	};

	// Supreme Overload Salve
	const possibleSupremeOverloadSalve = Math.min(possibleSupremeOverloads, prayerRenewal, prayerPotion, superAntifire, antifire, superAntipoison);

	const supremeSalveLimitingFactors: string[] = [];
	if (possibleSupremeOverloads === possibleSupremeOverloadSalve && possibleSupremeOverloadSalve !== Number.POSITIVE_INFINITY) {
		supremeSalveLimitingFactors.push("Supreme Overload");
	}
	if (prayerRenewal === possibleSupremeOverloadSalve && possibleSupremeOverloadSalve !== Number.POSITIVE_INFINITY) {
		supremeSalveLimitingFactors.push("Prayer Renewal");
	}
	if (prayerPotion === possibleSupremeOverloadSalve && possibleSupremeOverloadSalve !== Number.POSITIVE_INFINITY) {
		supremeSalveLimitingFactors.push("Prayer Potion");
	}
	if (superAntifire === possibleSupremeOverloadSalve && possibleSupremeOverloadSalve !== Number.POSITIVE_INFINITY) {
		supremeSalveLimitingFactors.push("Super Antifire");
	}
	if (antifire === possibleSupremeOverloadSalve && possibleSupremeOverloadSalve !== Number.POSITIVE_INFINITY) {
		supremeSalveLimitingFactors.push("Antifire");
	}
	if (superAntipoison === possibleSupremeOverloadSalve && possibleSupremeOverloadSalve !== Number.POSITIVE_INFINITY) {
		supremeSalveLimitingFactors.push("Super Antipoison");
	}

	results.supreme_overload_salve = {
		possible: possibleSupremeOverloadSalve,
		limitingFactors: supremeSalveLimitingFactors,
	};

	// Elder Overload
	const primalExtract = inventory.secondaries.primal_extract || 0;
	const fellstalk = inventory.herbs.fellstalk || 0;
	const possibleElderOverload = Math.min(possibleSupremeOverloads, primalExtract, fellstalk);

	const elderLimitingFactors: string[] = [];
	if (possibleSupremeOverloads === possibleElderOverload && possibleElderOverload !== Number.POSITIVE_INFINITY) {
		elderLimitingFactors.push("Supreme Overload");
	}
	if (primalExtract === possibleElderOverload && possibleElderOverload !== Number.POSITIVE_INFINITY) {
		elderLimitingFactors.push("Primal Extract");
	}
	if (fellstalk === possibleElderOverload && possibleElderOverload !== Number.POSITIVE_INFINITY) {
		elderLimitingFactors.push("Clean Fellstalk");
	}

	results.elder_overload = {
		possible: possibleElderOverload,
		limitingFactors: elderLimitingFactors,
	};

	// Elder Overload Salve
	const possibleElderOverloadSalve = Math.min(possibleElderOverload, prayerRenewal, prayerPotion, superAntifire, antifire, superAntipoison);

	const elderSalveLimitingFactors: string[] = [];
	if (possibleElderOverload === possibleElderOverloadSalve && possibleElderOverloadSalve !== Number.POSITIVE_INFINITY) {
		elderSalveLimitingFactors.push("Elder Overload");
	}
	if (prayerRenewal === possibleElderOverloadSalve && possibleElderOverloadSalve !== Number.POSITIVE_INFINITY) {
		elderSalveLimitingFactors.push("Prayer Renewal");
	}
	if (prayerPotion === possibleElderOverloadSalve && possibleElderOverloadSalve !== Number.POSITIVE_INFINITY) {
		elderSalveLimitingFactors.push("Prayer Potion");
	}
	if (superAntifire === possibleElderOverloadSalve && possibleElderOverloadSalve !== Number.POSITIVE_INFINITY) {
		elderSalveLimitingFactors.push("Super Antifire");
	}
	if (antifire === possibleElderOverloadSalve && possibleElderOverloadSalve !== Number.POSITIVE_INFINITY) {
		elderSalveLimitingFactors.push("Antifire");
	}
	if (superAntipoison === possibleElderOverloadSalve && possibleElderOverloadSalve !== Number.POSITIVE_INFINITY) {
		elderSalveLimitingFactors.push("Super Antipoison");
	}

	results.elder_overload_salve = {
		possible: possibleElderOverloadSalve,
		limitingFactors: elderSalveLimitingFactors,
	};

	return results;
}
