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

	// Each overload requires 3 doses of each component (changed from 4)
	const limits = [
		Math.floor(torstolLimit),
		Math.floor(extremeLimits.extreme_attack / 3),
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

		// Each extreme potion requires 3 doses of the super potion (changed from 4)
		const effectiveSecondaryCount = Math.floor(secondaryDoses / 3);

		// Also consider existing extreme doses
		const existingDoses = getPotionDoses(inventory, potionId);
		const existingPotions = Math.floor(existingDoses / 3); // Changed from 4

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
		const existingPotions = Math.floor(existingDoses / 3); // Changed from 4

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
	const extremeResults = calculatePossibleExtremes(inventory);
	const overloadResults = calculatePossibleOverloads(inventory);

	const virtualInventory: InventoryState = {
		...inventory,
		potionDoses: {
			...inventory.potionDoses,
			extreme_attack: Number(extremeResults.extreme_attack || 0) * 3,
			extreme_strength: Number(extremeResults.extreme_strength || 0) * 3,
			extreme_defence: Number(extremeResults.extreme_defence || 0) * 3,
			extreme_ranging: Number(extremeResults.extreme_ranging || 0) * 3,
			extreme_magic: Number(extremeResults.extreme_magic || 0) * 3,
			extreme_necromancy: (Number(extremeResults.extreme_necromancy) || 0) * 3,
			overload: overloadResults.possibleOverloads * 3,
		},
		potionCounts: {
			...inventory.potionCounts,
			overload: {
				oneDose: 0,
				twoDose: 0,
				threeDose: overloadResults.possibleOverloads,
				fourDose: 0
			}
		}
	};

	return virtualInventory;
}

export function calculateAdditionalOverloads(inventory: InventoryState) {
	// Calculate Supreme overloads (requires 4-dose overloads)
	const possibleSupremeFromOverloads = Math.floor(inventory.potionDoses.overload / 4);
	const supremeOverloads = Math.min(
		possibleSupremeFromOverloads,
		inventory.herbs.arbuck || 0,
		inventory.herbs.primalExtract || 0
	);

	return {
		supreme_overload: {
			possible: supremeOverloads,
			limitingFactors: [getLimitingFactor({
				'Regular Overload (4-dose)': possibleSupremeFromOverloads,
				'Arbuck': inventory.herbs.arbuck || 0,
				'Primal Extract': inventory.herbs.primalExtract || 0
			})]
		}
	};
}
