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
	doses?: number; // How many doses this ingredient provides/requires
}

export interface InventoryState {
	herbs: Record<string, number>;
	secondaries: Record<string, number>;
	potionDoses: Record<string, number>; // Total doses of each potion type
	potionCounts: Record<string, {
		oneDose: number;
		twoDose: number;
		threeDose: number;
		fourDose: number;
	}>;
}

export interface ExtremeRecipe {
	herb: string;
	secondary: string;
	other?: string;
	otherQuantity?: number;
	doses?: number; // How many doses this recipe requires
}

export interface Recipe {
	herb: string;
	secondary: string;
	quantity?: number;
	doses?: number; // How many doses this recipe requires
	other?: string;
	otherQuantity?: number;
}

export interface PotionRecipe {
	potion?: string;
	herb?: string;
	secondary: string;
	quantity?: number;
	doses?: number; // How many doses this recipe requires
}
