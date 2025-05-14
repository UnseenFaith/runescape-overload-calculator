import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { extremeRecipes } from "./data";
import type { InventoryState } from "./types";
import { superRecipes } from "./data";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getPotionDoses(inventory: InventoryState, potionId: string): number {
	return inventory.potionDoses[potionId] || 0;
}

export function calculatePossibleOverloads(inventory: InventoryState): {
	possibleOverloads: number;
	limitingFactors: string[];
} {
	// Check direct ingredients first
	const torstolLimit = inventory.herbs.torstol || 0;

	// Get dose counts for each extreme potion
	const extremeLimits = {
		extreme_attack: getPotionDoses(inventory, 'extreme_attack'),
		extreme_strength: getPotionDoses(inventory, 'extreme_strength'),
		extreme_defence: getPotionDoses(inventory, 'extreme_defence'),
		extreme_ranging: getPotionDoses(inventory, 'extreme_ranging'),
		extreme_magic: getPotionDoses(inventory, 'extreme_magic'),
		extreme_necromancy: getPotionDoses(inventory, 'extreme_necromancy'),
	};

	// Each overload requires 3 doses of each extreme component
	const limits = [
		Math.floor(torstolLimit),  // 1 torstol per overload
		Math.floor(extremeLimits.extreme_attack / 3),  // 3 doses per overload
		Math.floor(extremeLimits.extreme_strength / 3),
		Math.floor(extremeLimits.extreme_defence / 3),
		Math.floor(extremeLimits.extreme_ranging / 3),
		Math.floor(extremeLimits.extreme_magic / 3),
		Math.floor(extremeLimits.extreme_necromancy / 3),
	];

	const possibleOverloads = Math.min(...limits);
	const limitingFactors: string[] = [];

	// Find limiting factors
	if (torstolLimit === Math.min(...limits)) {
		limitingFactors.push('Clean Torstol');
	}
	if (extremeLimits.extreme_attack / 3 === Math.min(...limits)) {
		limitingFactors.push('Extreme Attack');
	}
	if (extremeLimits.extreme_strength / 3 === Math.min(...limits)) {
		limitingFactors.push('Extreme Strength');
	}
	if (extremeLimits.extreme_defence / 3 === Math.min(...limits)) {
		limitingFactors.push('Extreme Defence');
	}
	if (extremeLimits.extreme_ranging / 3 === Math.min(...limits)) {
		limitingFactors.push('Extreme Ranging');
	}
	if (extremeLimits.extreme_magic / 3 === Math.min(...limits)) {
		limitingFactors.push('Extreme Magic');
	}
	if (extremeLimits.extreme_necromancy / 3 === Math.min(...limits)) {
		limitingFactors.push('Extreme Necromancy');
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
		const secondaryDoses = getPotionDoses(inventory, secondaryId);
		const otherCount = otherId
			? Math.floor((inventory.secondaries[otherId] || 0) / otherQuantity)
			: Number.POSITIVE_INFINITY;

		// Each extreme potion requires 3 doses of the super potion
		const effectiveSecondaryCount = Math.floor(secondaryDoses / 3);

		// Also consider existing extreme doses
		const existingDoses = getPotionDoses(inventory, potionId);
		// Extreme potions are always calculated in 3-dose units
		const existingPotions = Math.floor(existingDoses / 3);

		// Add the existing potions to what we can make
		const possible = existingPotions + Math.min(herbCount, effectiveSecondaryCount, otherCount);

		let limitingFactor = "";
		if (herbId && herbCount === Math.min(herbCount, effectiveSecondaryCount, otherCount) && herbCount !== Number.POSITIVE_INFINITY) {
			limitingFactor = `Clean ${herbId.charAt(0).toUpperCase() + herbId.slice(1)}`;
		} else if (effectiveSecondaryCount === Math.min(herbCount || Number.POSITIVE_INFINITY, effectiveSecondaryCount, otherCount) && effectiveSecondaryCount !== Number.POSITIVE_INFINITY) {
			limitingFactor = secondaryId
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		} else if (otherId && otherCount === Math.min(herbCount || Number.POSITIVE_INFINITY, effectiveSecondaryCount, otherCount) && otherCount !== Number.POSITIVE_INFINITY) {
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

		// Consider existing super potion doses
		const existingDoses = getPotionDoses(inventory, potionId);
		// Super potions for extremes need 3 doses, but 4 doses for supreme overloads
		const existingPotions = Math.floor(existingDoses / (secondaryId.includes('supreme_') ? 4 : 3));

		// Add the existing potions to what we can make
		const possible = existingPotions + Math.min(herbCount, secondaryCount);

		let limitingFactor = "";
		if (herbCount === Math.min(herbCount, secondaryCount) && herbCount !== Number.POSITIVE_INFINITY) {
			limitingFactor = `Clean ${herbId.charAt(0).toUpperCase() + herbId.slice(1)}`;
		} else if (secondaryCount === Math.min(herbCount, secondaryCount) && secondaryCount !== Number.POSITIVE_INFINITY) {
			limitingFactor = secondaryId
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		}

		results[potionId] = { possible, limitingFactor };
	});

	return results;
}

function getLimitingFactor(amounts: Record<string, number>): string {
	let minAmount = Infinity;
	let limitingFactor = '';

	for (const [name, amount] of Object.entries(amounts)) {
		if (amount < minAmount) {
			minAmount = amount;
			limitingFactor = name;
		}
	}

	return limitingFactor;
}

export function calculateOverloadsFromScratch(inventory: InventoryState) {
	// Keep track of remaining herbs after each step
	const remainingHerbs = { ...inventory.herbs };

	// First calculate super potions - these are the base requirement
	// Each recipe needs specific herbs, so let's calculate them one by one
	const superPotionsHerbMap = {
		super_attack: { herb: 'irit', required: 1 },
		super_strength: { herb: 'kwuarm', required: 1 },
		super_defence: { herb: 'cadantine', required: 1 },
		super_ranging: { herb: 'dwarf_weed', required: 1 },
		super_magic: { herb: 'lantadyme', required: 1 },
		super_necromancy: { herb: 'spirit_weed', required: 1 },
	};

	const superPotionsInventory = {
		...inventory,
		herbs: remainingHerbs
	};

	const superResults = calculatePossibleSupers(superPotionsInventory);

	// Subtract used herbs from remaining herbs
	Object.entries(superPotionsHerbMap).forEach(([potionId, { herb, required }]) => {
		const amountUsed = (superResults[potionId]?.possible || 0) * required;
		remainingHerbs[herb] = Math.max(0, (remainingHerbs[herb] || 0) - amountUsed);
	});

	// Create inventory for extreme potions with remaining herbs and created super potions
	const extremeInventory: InventoryState = {
		...inventory,
		herbs: remainingHerbs,
		potionDoses: {
			...inventory.potionDoses,
			super_attack: (superResults.super_attack?.possible || 0) * 3,
			super_strength: (superResults.super_strength?.possible || 0) * 3,
			super_defence: (superResults.super_defence?.possible || 0) * 3,
			super_ranging: (superResults.super_ranging?.possible || 0) * 3,
			super_magic: (superResults.super_magic?.possible || 0) * 3,
			super_necromancy: (superResults.super_necromancy?.possible || 0) * 3,
		}
	};

	// Calculate extremes using the virtual inventory
	const extremePotionsHerbMap = {
		extreme_attack: { herb: 'avantoe', required: 1 },
		extreme_strength: { herb: 'dwarf_weed', required: 1 },
		extreme_defence: { herb: 'lantadyme', required: 1 },
		// extreme_ranging: no herb needed,
		// extreme_magic: no herb needed,
		// extreme_necromancy: no herb needed
	};

	const extremeResults = calculatePossibleExtremes(extremeInventory);

	// Subtract herbs used for extreme potions
	Object.entries(extremePotionsHerbMap).forEach(([potionId, { herb, required }]) => {
		const amountUsed = (extremeResults[potionId]?.possible || 0) * required;
		remainingHerbs[herb] = Math.max(0, (remainingHerbs[herb] || 0) - amountUsed);
	});

	// Create inventory for overload calculation with remaining herbs and created extreme potions
	const overloadInventory: InventoryState = {
		...inventory,
		herbs: remainingHerbs,
		potionDoses: {
			...inventory.potionDoses,
			extreme_attack: (extremeResults.extreme_attack?.possible || 0) * 3,
			extreme_strength: (extremeResults.extreme_strength?.possible || 0) * 3,
			extreme_defence: (extremeResults.extreme_defence?.possible || 0) * 3,
			extreme_ranging: (extremeResults.extreme_ranging?.possible || 0) * 3,
			extreme_magic: (extremeResults.extreme_magic?.possible || 0) * 3,
			extreme_necromancy: (extremeResults.extreme_necromancy?.possible || 0) * 3,
		}
	};

	// Finally calculate overloads based on the virtual extreme potions and remaining herbs
	// Overloads need torstol
	const torstolNeeded = 1; // 1 torstol per overload
	const overloadInventoryWithTorstol: InventoryState = {
		...overloadInventory,
		herbs: {
			...remainingHerbs,
			torstol: remainingHerbs.torstol || 0
		}
	};

	const overloadResults = calculatePossibleOverloads(overloadInventoryWithTorstol);

	// Return the results of everything that can be made from scratch, along with remaining herbs for debugging
	return {
		superResults,
		extremeResults,
		overloadResults,
		remainingHerbs // This helps identify which herbs are the limiting factors
	};
}

export function calculateAdditionalOverloads(inventory: InventoryState) {
	// Calculate ingredients needed for supreme overloads
	const superDoses = {
		attack: inventory.potionDoses.super_attack || 0,
		strength: inventory.potionDoses.super_strength || 0,
		defence: inventory.potionDoses.super_defence || 0,
		ranging: inventory.potionDoses.super_ranging || 0,
		magic: inventory.potionDoses.super_magic || 0,
		necromancy: inventory.potionDoses.super_necromancy || 0,
	};

	// For supreme overload, we need 4 doses of each super potion and 4 doses of regular overload
	const possibleSupremeFromOverloads = Math.floor(inventory.potionDoses.overload / 4);
	const possibleSupremeFromSupers = Math.min(
		Math.floor(superDoses.attack / 4),
		Math.floor(superDoses.strength / 4),
		Math.floor(superDoses.defence / 4),
		Math.floor(superDoses.ranging / 4),
		Math.floor(superDoses.magic / 4),
		Math.floor(superDoses.necromancy / 4)
	);

	const supremeOverloads = Math.min(
		possibleSupremeFromOverloads,
		possibleSupremeFromSupers,
		inventory.herbs.arbuck || 0,
		inventory.herbs.primalExtract || 0
	);

	return {
		supreme_overload: {
			possible: supremeOverloads,
			limitingFactors: [getLimitingFactor({
				'Regular Overload (4-dose)': possibleSupremeFromOverloads,
				'Super Potions (4-dose each)': possibleSupremeFromSupers,
				'Arbuck': inventory.herbs.arbuck || 0,
				'Primal Extract': inventory.herbs.primalExtract || 0
			})]
		}
	};
}
