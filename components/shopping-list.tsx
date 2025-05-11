'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';
import { herbs, secondaries, extremeRecipes, superRecipes, getDefaultInventory, otherPotionRecipes, extremePotions, overloadRecipe, additionalOverloadRecipes } from '@/lib/data';
import type { InventoryState } from '@/lib/types';
import { v4 } from 'uuid';

type OverloadType = 'overload' | 'supreme_overload' | 'overload_salve' | 'supreme_overload_salve' | 'elder_overload' | 'elder_overload_salve';

interface IngredientItem {
	id: string;
	name: string;
	quantity: number;
	image: string;
	have: number;
	need: number;
	sufficient: boolean;
	children?: IngredientItem[]; // Add children for tree structure
	parent?: string; // Track parent relationship
}

export default function ShoppingList() {
	const [desiredAmount, setDesiredAmount] = useState<number>(10);
	const [overloadType, setOverloadType] = useState<OverloadType>('overload');
	const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
	const [inventory, setInventory] = useState<InventoryState>(getDefaultInventory());

	// Load inventory from localStorage on component mount
	useEffect(() => {
		const savedInventory = localStorage.getItem('rs3-herb-inventory');
		if (savedInventory) {
			try {
				const parsedInventory = JSON.parse(savedInventory);
				const defaultInventory = getDefaultInventory();
				setInventory({
					herbs: { ...defaultInventory.herbs, ...parsedInventory.herbs },
					secondaries: { ...defaultInventory.secondaries, ...parsedInventory.secondaries },
					potionDoses: { ...defaultInventory.potionDoses, ...parsedInventory.potionDoses },
					potionCounts: { ...defaultInventory.potionCounts, ...parsedInventory.potionCounts },
				});
			} catch (e) {
				console.error('Failed to parse saved inventory', e);
			}
		}
	}, []);

	// TODO: I need to add something to check/decrement potential doses so that ingredients are not overlapping in terms of doses
	const updateIngredientQuantities = (ingredients: IngredientItem[]): IngredientItem[] => {
		return ingredients.map((ingredient) => {
			let have = 0;
			// Check herbs
			if (ingredient.id in inventory.herbs) {
				have = inventory.herbs[ingredient.id];
			} else if (ingredient.id in inventory.potionDoses) {
				const doses = inventory.potionDoses[ingredient.id];
				// For extreme potions, we need exactly 3 doses
				console.log(ingredient.parent);
				if (ingredient.parent && ingredient.parent.includes('extreme_')) {
					have = Math.floor(doses / 3);
				} else {
					have = Math.floor(doses / 4);
				}
			} else if (ingredient.id in inventory.secondaries) {
				have = inventory.secondaries[ingredient.id];
			}

			const need = Math.max(0, ingredient.quantity - have);
			const sufficient = need === 0;

			// Update children recursively
			const children = ingredient.children ? updateIngredientQuantities(ingredient.children) : [];

			return {
				...ingredient,
				have,
				need,
				sufficient,
				children,
			};
		});
	};

	const getPotionDoses = (id: string): number => {
		return inventory.potionDoses[id] || 0;
	};

	const getEffectivePotionCount = (id: string): number => {
		return Math.floor(getPotionDoses(id) / 4);
	};

	const getSuperPotionCount = getEffectivePotionCount; // They do the same thing now

	const calculateIngredients = () => {
		setIngredients([]);
		const dosesNeeded = desiredAmount * 3; // Each overload needs 3 doses of each extreme potion

		if (overloadType === 'supreme_overload' || overloadType === 'supreme_overload_salve') {
			// Start with Supreme Overload as the root
			const supremeOverload = findItem('supreme_overload');
			if (supremeOverload) {
				addIngredient('supreme_overload', supremeOverload.name, desiredAmount, supremeOverload.image);

				// Add Overload as a child of Supreme Overload
				const overload = findItem('overload');
				if (overload) {
					addIngredient('overload', overload.name, desiredAmount, overload.image, 'supreme_overload');

					// Add extreme potions under the overload (each requires 4 doses)
					const extremePotionsList = ['extreme_attack', 'extreme_strength', 'extreme_defence', 'extreme_ranging', 'extreme_magic', 'extreme_necromancy'];
					extremePotionsList.forEach((potionId) => {
						calculateExtremePotionIngredients(potionId, dosesNeeded, 'supreme_overload.overload');
					});

					// Add torstol under the overload
					const torstolAmount = inventory.herbs.torstol || 0;
					const neededTorstol = Math.max(0, desiredAmount - torstolAmount);
					if (neededTorstol > 0) {
						addIngredient('torstol', 'Clean Torstol', desiredAmount, findItem('torstol')?.image || '', 'supreme_overload.overload');
					}
				}

				// Add super potions as direct children of Supreme Overload
				const superPotionsList = ['super_attack', 'super_strength', 'super_defence', 'super_ranging', 'super_magic', 'super_necromancy'];
				superPotionsList.forEach((potionId) => {
					calculateSuperPotionIngredients(potionId, desiredAmount * 4, 'supreme_overload');
				});

				// Add salve ingredients if making supreme salve
				if (overloadType === 'supreme_overload_salve') {
					calculateOtherPotionIngredients('prayer_renewal', desiredAmount * 4, 'supreme_overload');
					calculateOtherPotionIngredients('prayer_potion', desiredAmount * 4, 'supreme_overload');
					calculateOtherPotionIngredients('super_antifire', desiredAmount * 4, 'supreme_overload');
					calculateOtherPotionIngredients('antifire', desiredAmount * 4, 'supreme_overload');
					calculateOtherPotionIngredients('super_antipoison', desiredAmount * 4, 'supreme_overload');
				}
			}
		} else if (overloadType === 'elder_overload' || overloadType === 'elder_overload_salve') {
			// Start with Elder Overload as the root
			const elderOverload = findItem('elder_overload');
			if (elderOverload) {
				addIngredient('elder_overload', elderOverload.name, desiredAmount, elderOverload.image);

				// Add Supreme Overload as a child of Elder Overload
				const supremeOverload = findItem('supreme_overload');
				if (supremeOverload) {
					addIngredient('supreme_overload', supremeOverload.name, desiredAmount, supremeOverload.image, 'elder_overload');

					// Add Overload as a child of Supreme Overload
					const overload = findItem('overload');
					if (overload) {
						addIngredient('overload', overload.name, desiredAmount, overload.image, 'elder_overload.supreme_overload');

						// Add extreme potions under the overload
						const extremePotionsList = ['extreme_attack', 'extreme_strength', 'extreme_defence', 'extreme_ranging', 'extreme_magic', 'extreme_necromancy'];
						extremePotionsList.forEach((potionId) => {
							calculateExtremePotionIngredients(potionId, dosesNeeded, 'elder_overload.supreme_overload.overload');
						});

						// Add torstol under the overload
						const torstolAmount = inventory.herbs.torstol || 0;
						const neededTorstol = Math.max(0, desiredAmount - torstolAmount);
						if (neededTorstol > 0) {
							addIngredient('torstol', 'Clean Torstol', desiredAmount, findItem('torstol')?.image || '', 'elder_overload.supreme_overload.overload');
						}
					}

					// Add super potions as direct children of Supreme Overload
					const superPotionsList = ['super_attack', 'super_strength', 'super_defence', 'super_ranging', 'super_magic', 'super_necromancy'];
					superPotionsList.forEach((potionId) => {
						calculateSuperPotionIngredients(potionId, dosesNeeded, 'elder_overload.supreme_overload');
					});
				}

				// Add Elder Overload specific ingredients
				const primalExtract = findItem('primal_extract');
				if (primalExtract) {
					const currentAmount = inventory.secondaries.primal_extract || 0;
					const neededAmount = Math.max(0, desiredAmount - currentAmount);
					if (neededAmount > 0) {
						addIngredient('primal_extract', primalExtract.name, desiredAmount, primalExtract.image, 'elder_overload');
					}
				}

				const fellstalk = findItem('fellstalk');
				if (fellstalk) {
					const currentAmount = inventory.herbs.fellstalk || 0;
					const neededAmount = Math.max(0, desiredAmount - currentAmount);
					if (neededAmount > 0) {
						addIngredient('fellstalk', fellstalk.name, desiredAmount, fellstalk.image, 'elder_overload');
					}
				}

				// Add salve ingredients if making elder salve
				if (overloadType === 'elder_overload_salve') {
					calculateOtherPotionIngredients('prayer_renewal', desiredAmount * 4, 'elder_overload');
					calculateOtherPotionIngredients('prayer_potion', desiredAmount * 4, 'elder_overload');
					calculateOtherPotionIngredients('super_antifire', desiredAmount * 4, 'elder_overload');
					calculateOtherPotionIngredients('antifire', desiredAmount * 4, 'elder_overload');
					calculateOtherPotionIngredients('super_antipoison', desiredAmount * 4, 'elder_overload');
				}
			}
		} else if (overloadType === 'overload' || overloadType === 'overload_salve') {
			// Regular overload calculation
			const overload = findItem('overload');
			if (overload) {
				addIngredient('overload', overload.name, desiredAmount, overload.image);

				const extremePotionsList = ['extreme_attack', 'extreme_strength', 'extreme_defence', 'extreme_ranging', 'extreme_magic', 'extreme_necromancy'];
				extremePotionsList.forEach((potionId) => {
					calculateExtremePotionIngredients(potionId, dosesNeeded, 'overload');
				});

				const torstolAmount = inventory.herbs.torstol || 0;
				const neededTorstol = Math.max(0, desiredAmount - torstolAmount);
				if (neededTorstol > 0) {
					addIngredient('torstol', 'Clean Torstol', desiredAmount, findItem('torstol')?.image || '', 'overload');
				}

				// Add salve ingredients if making overload salve
				if (overloadType === 'overload_salve') {
					calculateOtherPotionIngredients('prayer_renewal', desiredAmount * 4, 'overload');
					calculateOtherPotionIngredients('prayer_potion', desiredAmount * 4, 'overload');
					calculateOtherPotionIngredients('super_antifire', desiredAmount * 4, 'overload');
					calculateOtherPotionIngredients('antifire', desiredAmount * 4, 'overload');
					calculateOtherPotionIngredients('super_antipoison', desiredAmount * 4, 'overload');
				}
			}
		}

		// Update quantities after all ingredients are added
		setIngredients((prev) => updateIngredientQuantities(prev));
	};

	// Helper functions need to be updated to handle parent parameter
	const calculateExtremePotionIngredients = (potionId: string, dosesNeeded: number, parentPath?: string) => {
		const recipe = extremeRecipes[potionId];
		if (!recipe) return;

		const potion = findItem(potionId);
		if (potion) {
			// Each craft produces 3 doses, so we need to ceil(dosesNeeded/3) crafts
			const potionsNeeded = Math.ceil(dosesNeeded / 3);
			addIngredient(potionId, potion.name, potionsNeeded, potion.image, parentPath);

			const newParentPath = parentPath ? `${parentPath}.${potionId}` : potionId;

			// Calculate ingredients needed for the extreme potion
			if (recipe.herb) {
				const herb = findItem(recipe.herb);
				if (herb) {
					addIngredient(recipe.herb, herb.name, potionsNeeded, herb.image, newParentPath);
				}
			}

			// Calculate required super potion doses
			// Each extreme potion craft requires 3 doses of the super potion
			const superPotionDosesNeeded = potionsNeeded * 3;
			const superPotionId = potionId.replace('extreme_', 'super_');
			calculateSuperPotionIngredients(superPotionId, superPotionDosesNeeded, newParentPath);

			if (recipe.other) {
				const other = findItem(recipe.other);
				if (other) {
					const otherQuantity = (recipe.otherQuantity || 1) * potionsNeeded;
					addIngredient(recipe.other, other.name, otherQuantity, other.image, newParentPath);
				}
			}
		}
	};

	const calculateSuperPotionIngredients = (potionId: string, dosesNeeded: number, parentPath?: string) => {
		const recipe = superRecipes[potionId];
		if (!recipe) return;

		const potion = findItem(potionId);
		if (potion) {
			// Determine doses needed based on context
			let potionsNeeded;
			if (parentPath?.includes('extreme_')) {
				// If this super potion is used for an extreme potion, we need 3 doses
				potionsNeeded = Math.ceil(dosesNeeded / 3);
			} else {
				// For supreme overload direct supers and salve components, we need 4 doses
				potionsNeeded = Math.ceil(dosesNeeded / 4);
			}

			addIngredient(potionId, potion.name, potionsNeeded, potion.image, parentPath);

			const newParentPath = parentPath ? `${parentPath}.${potionId}` : potionId;

			// Add recipe ingredients
			if (recipe.herb) {
				const herb = findItem(recipe.herb);
				if (herb) {
					addIngredient(recipe.herb, herb.name, potionsNeeded, herb.image, newParentPath);
				}
			}

			const secondary = findItem(recipe.secondary);
			if (secondary) {
				const quantity = (recipe.quantity || 1) * potionsNeeded;
				addIngredient(recipe.secondary, secondary.name, quantity, secondary.image, newParentPath);
			}
		}
	};

	// Calculate ingredients for additional recipes (prayer renewal, antifire, etc)
	const calculateOtherPotionIngredients = (potionId: string, amount: number, parentPath?: string) => {
		const recipe = otherPotionRecipes[potionId as keyof typeof otherPotionRecipes];
		if (!recipe) return;

		// Add the parent potion first
		const parentPotion = findItem(potionId);
		if (parentPotion) {
			addIngredient(potionId, parentPotion.name, amount, parentPotion.image, parentPath);
		}

		const newParentPath = parentPath ? `${parentPath}.${potionId}` : potionId;

		// Handle herb ingredients
		if (recipe.herb) {
			const herb = findItem(recipe.herb);
			if (herb) {
				addIngredient(recipe.herb, herb.name, amount, herb.image, newParentPath);
			}
		}

		// Handle secondary ingredients
		const secondary = findItem(recipe.secondary);
		if (secondary) {
			addIngredient(recipe.secondary, secondary.name, amount, secondary.image, newParentPath);
		}

		// Handle potion ingredients
		if (recipe.potion && typeof recipe.potion === 'string') {
			const potion = findItem(recipe.potion);
			if (potion) {
				addIngredient(recipe.potion, potion.name, amount, potion.image, newParentPath);
				calculateOtherPotionIngredients(recipe.potion, amount, newParentPath);
			}
		}
	};

	const addIngredient = (id: string, name: string, amount: number, image: string, parentPath?: string) => {
		setIngredients((prev) => {
			const newIngredient: IngredientItem = {
				id,
				name,
				quantity: amount,
				image,
				have: 0,
				need: amount,
				parent: parentPath,
				sufficient: false,
				children: [],
			};

			// If there's no parent path, add to root level
			if (!parentPath) {
				return [...prev, newIngredient];
			}

			// Handle dot notation paths (e.g., "overload.extreme_attack.super_attack")
			const parentParts = parentPath.split('.');

			// Helper function to recursively add ingredient to the correct parent
			const addToParent = (items: IngredientItem[], parts: string[]): IngredientItem[] => {
				if (parts.length === 0) return items;

				const currentParent = parts[0];
				const remainingPath = parts.slice(1);

				return items.map((item) => {
					if (item.id === currentParent) {
						return {
							...item,
							children: remainingPath.length === 0 ? [...(item.children || []), newIngredient] : addToParent(item.children || [], remainingPath),
						};
					}
					return item;
				});
			};

			return addToParent(prev, parentParts);
		});
	};

	// Find herb or secondary by ID
	const findItem = (id: string) => {
		const herb = herbs.find((h) => h.id === id);
		if (herb) return herb;
		if (overloadRecipe.id === id) return overloadRecipe;
		const otherOverload = additionalOverloadRecipes[id];
		if (otherOverload) return otherOverload;
		const extremePotion = extremePotions.find((p) => p.id === id);
		if (extremePotion) return extremePotion;
		const secondary = secondaries.find((s) => s.id === id);
		return secondary;
	};

	const getOverloadName = (type: OverloadType) => {
		switch (type) {
			case 'overload':
				return 'Overload';
			case 'supreme_overload':
				return 'Supreme Overload';
			case 'overload_salve':
				return 'Overload Salve';
			case 'supreme_overload_salve':
				return 'Supreme Overload Salve';
			case 'elder_overload':
				return 'Elder Overload';
			case 'elder_overload_salve':
				return 'Elder Overload Salve';
			default:
				return 'Overload';
		}
	};

	// Get the root level ingredients for the tree view
	const getTreeIngredients = () => {
		console.log('Ingredients:', ingredients);
		return ingredients.filter((ingredient) => !ingredient.parent);
	};

	const renderIngredientTree = (ingredient: IngredientItem, level: number = 0) => {
		const cardContent = (
			<div className='flex items-center gap-4'>
				<div className='w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center'>
					<img src={ingredient.image || '/placeholder.svg'} alt={ingredient.name} className='w-10 h-10' />
				</div>
				<div className='flex-1'>
					<p className='font-medium text-white'>{ingredient.name}</p>
					<div className='flex items-center gap-2 text-sm'>
						<span className='text-gray-300'>Have: {ingredient.have}</span>
						<span className='text-gray-300'>•</span>
						<span className='text-gray-300'>Need: {ingredient.need}</span>
					</div>
				</div>
				<div className='text-right flex flex-col items-end'>
					<p className='text-lg font-bold text-white'>{ingredient.quantity} total</p>
					{ingredient.sufficient ? (
						<span className='text-green-400 flex items-center text-sm'>
							<CheckCircle2 className='h-4 w-4 mr-1' /> Sufficient
						</span>
					) : (
						<span className='text-yellow-400 text-sm'>Need {ingredient.need} more</span>
					)}
				</div>
			</div>
		);

		return (
			<div key={ingredient.id} style={{ paddingLeft: `${level * 24}px` }}>
				<Card className={`bg-[#1a2e1a] border-[#2a5331] mb-2 ${ingredient.sufficient ? 'border-l-4 border-l-green-500' : ''}`}>
					<CardContent className='p-3'>{cardContent}</CardContent>
				</Card>
				{ingredient.children && ingredient.children.length > 0 && !ingredient.sufficient && <div className='border-l-2 border-[#2a5331] ml-6 mt-2'>{ingredient.children.map((child) => renderIngredientTree(child, level + 1))}</div>}
			</div>
		);
	};

	return (
		<div className='space-y-6'>
			<h2 className='text-2xl font-bold text-white flex items-center gap-2'>
				<ShoppingBag className='h-6 w-6' />
				Shopping List Calculator
			</h2>

			<Card className='bg-[#1a2e1a] border-[#2a5331]'>
				<CardHeader>
					<CardTitle className='text-white'>Calculate Required Ingredients</CardTitle>
					<CardDescription className='text-gray-300'>Enter the number of overloads you want to make and select the type</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-white'>Number of Overloads</label>
							<Input type='number' min='1' value={desiredAmount} onChange={(e) => setDesiredAmount(Number(e.target.value) || 1)} className='bg-[#0f1f0f] border-[#2a5331] text-white' />
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-white'>Overload Type</label>
							<Select value={overloadType} onValueChange={(value) => setOverloadType(value as OverloadType)}>
								<SelectTrigger className='bg-[#0f1f0f] border-[#2a5331] text-white'>
									<SelectValue placeholder='Select overload type' />
								</SelectTrigger>
								<SelectContent className='bg-[#1a2e1a] border-[#2a5331] text-white'>
									<SelectItem value='overload'>Overload</SelectItem>
									<SelectItem value='supreme_overload'>Supreme Overload</SelectItem>
									<SelectItem value='overload_salve'>Overload Salve</SelectItem>
									<SelectItem value='supreme_overload_salve'>Supreme Overload Salve</SelectItem>
									<SelectItem value='elder_overload'>Elder Overload</SelectItem>
									<SelectItem value='elder_overload_salve'>Elder Overload Salve</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Button onClick={calculateIngredients} className='w-full bg-[#2a5331] hover:bg-[#3a7341] text-white'>
						Calculate Ingredients
					</Button>
				</CardContent>
			</Card>

			<div className='space-y-4'>
				<h3 className='text-xl font-bold text-white'>
					Ingredients for {desiredAmount} {getOverloadName(overloadType)}s
				</h3>

				<div className='space-y-2'>{getTreeIngredients().map((ingredient) => renderIngredientTree(ingredient))}</div>
			</div>
		</div>
	);
}
