export interface Herb {
	id: string;
	name: string;
	image: string;
	quantity: number;
}

export interface Potion {
	id: string;
	name: string;
	image: string;
	ingredients: PotionIngredient[];
}

export interface PotionIngredient {
	id: string;
	name: string;
	quantity: number;
	image: string;
}

export interface InventoryState {
	herbs: Record<string, number>;
	secondaries: Record<string, number>;
	extremePotions: Record<string, number>;
}

export interface ExtremeRecipe {
	herb: string;
	secondary: string;
	other?: string;
	otherQuantity?: number;
}

export interface Recipe {
	herb: string;
	secondary: string;
	quantity?: number;
	other?: string;
	otherQuantity?: number;
}
