'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { herbs, secondaries, extremePotions, getDefaultInventory } from '@/lib/data';
import type { InventoryState } from '@/lib/types';

interface PotionCounts {
	oneDose: number;
	twoDose: number;
	threeDose: number;
	fourDose: number;
}

export default function HerbTracker() {
	const [inventory, setInventory] = useState<InventoryState>(getDefaultInventory());
	const [potionInputs, setPotionInputs] = useState<Record<string, PotionCounts>>({});
	const [activeTab, setActiveTab] = useState('herbs');

	// Load inventory from localStorage on component mount
	useEffect(() => {
		const savedInventory = localStorage.getItem('rs3-herb-inventory');
		if (savedInventory) {
			try {
				const parsedInventory = JSON.parse(savedInventory);
				const defaultInventory = getDefaultInventory();
				setInventory({
					...defaultInventory,
					herbs: { ...defaultInventory.herbs, ...parsedInventory.herbs },
					secondaries: { ...defaultInventory.secondaries, ...parsedInventory.secondaries },
					potionDoses: { ...defaultInventory.potionDoses, ...parsedInventory.potionDoses },
					potionCounts: { ...defaultInventory.potionCounts, ...parsedInventory.potionCounts },
				});

				// Set the potion inputs based on stored counts
				setPotionInputs(parsedInventory.potionCounts || {});
			} catch (e) {
				console.error('Failed to parse saved inventory', e);
			}
		}
	}, []);

	// Save inventory to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem('rs3-herb-inventory', JSON.stringify(inventory));
	}, [inventory]);

	const updateHerbQuantity = (id: string, quantity: number) => {
		setInventory((prev) => ({
			...prev,
			herbs: {
				...prev.herbs,
				[id]: Math.max(0, quantity),
			},
		}));
	};

	const updateSecondaryQuantity = (id: string, quantity: number) => {
		setInventory((prev) => ({
			...prev,
			secondaries: {
				...prev.secondaries,
				[id]: Math.max(0, quantity),
			},
		}));
	};

	const updatePotionQuantity = (id: string, oneDose: number, twoDose: number, threeDose: number, fourDose: number) => {
		// Update the counts in inventory
		setInventory((prev) => ({
			...prev,
			potionCounts: {
				...prev.potionCounts,
				[id]: {
					oneDose: Math.max(0, oneDose),
					twoDose: Math.max(0, twoDose),
					threeDose: Math.max(0, threeDose),
					fourDose: Math.max(0, fourDose),
				},
			},
			potionDoses: {
				...prev.potionDoses,
				[id]: Math.max(0, oneDose) * 1 + Math.max(0, twoDose) * 2 + Math.max(0, threeDose) * 3 + Math.max(0, fourDose) * 4,
			},
		}));

		// Update the potionInputs state to match
		setPotionInputs((prev) => ({
			...prev,
			[id]: {
				oneDose: Math.max(0, oneDose),
				twoDose: Math.max(0, twoDose),
				threeDose: Math.max(0, threeDose),
				fourDose: Math.max(0, fourDose),
			},
		}));
	};

	const resetInventory = () => {
		if (confirm('Are you sure you want to reset your inventory?')) {
			setInventory(getDefaultInventory());
			setPotionInputs({});
		}
	};

	const getDefaultPotionCounts = (id: string): PotionCounts => {
		return potionInputs[id] || { oneDose: 0, twoDose: 0, threeDose: 0, fourDose: 0 };
	};

	const renderPotionInputs = (potion: { id: string; name: string; image: string }) => (
		<div key={potion.id} className='flex items-center gap-4'>
			<div className='w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center'>
				<img src={potion.image} alt={potion.name} className='w-10 h-10' />
			</div>
			<div className='flex-1'>
				<p className='text-white'>{potion.name}</p>
			</div>
			<div className='flex gap-2'>
				<div className='flex flex-col gap-1'>
					<Input type='number' min='0' value={getDefaultPotionCounts(potion.id).oneDose} onChange={(e) => updatePotionQuantity(potion.id, Number(e.target.value), getDefaultPotionCounts(potion.id).twoDose, getDefaultPotionCounts(potion.id).threeDose, getDefaultPotionCounts(potion.id).fourDose)} className='w-20 bg-[#0f1f0f] border-[#2a5331] text-white' placeholder='1-dose' />
					<span className='text-xs text-center text-gray-400'>1-dose</span>
				</div>
				<div className='flex flex-col gap-1'>
					<Input type='number' min='0' value={getDefaultPotionCounts(potion.id).twoDose} onChange={(e) => updatePotionQuantity(potion.id, getDefaultPotionCounts(potion.id).oneDose, Number(e.target.value), getDefaultPotionCounts(potion.id).threeDose, getDefaultPotionCounts(potion.id).fourDose)} className='w-20 bg-[#0f1f0f] border-[#2a5331] text-white' placeholder='2-dose' />
					<span className='text-xs text-center text-gray-400'>2-dose</span>
				</div>
				<div className='flex flex-col gap-1'>
					<Input type='number' min='0' value={getDefaultPotionCounts(potion.id).threeDose} onChange={(e) => updatePotionQuantity(potion.id, getDefaultPotionCounts(potion.id).oneDose, getDefaultPotionCounts(potion.id).twoDose, Number(e.target.value), getDefaultPotionCounts(potion.id).fourDose)} className='w-20 bg-[#0f1f0f] border-[#2a5331] text-white' placeholder='3-dose' />
					<span className='text-xs text-center text-gray-400'>3-dose</span>
				</div>
				<div className='flex flex-col gap-1'>
					<Input type='number' min='0' value={getDefaultPotionCounts(potion.id).fourDose} onChange={(e) => updatePotionQuantity(potion.id, getDefaultPotionCounts(potion.id).oneDose, getDefaultPotionCounts(potion.id).twoDose, getDefaultPotionCounts(potion.id).threeDose, Number(e.target.value))} className='w-20 bg-[#0f1f0f] border-[#2a5331] text-white' placeholder='4-dose' />
					<span className='text-xs text-center text-gray-400'>4-dose</span>
				</div>
			</div>
		</div>
	);

	return (
		<div className='space-y-6'>
			<h2 className='text-2xl font-bold text-white'>Herb Tracker</h2>

			<Tabs defaultValue='herbs' className='space-y-4' value={activeTab} onValueChange={setActiveTab}>
				<TabsList className='bg-[#1a2e1a] border-[#2a5331]'>
					<TabsTrigger value='herbs'>Herbs</TabsTrigger>
					<TabsTrigger value='potions'>Potions</TabsTrigger>
					<TabsTrigger value='other'>Other Items</TabsTrigger>
				</TabsList>

				<TabsContent value='herbs'>
					<Card className='bg-[#1a2e1a] border-[#2a5331]'>
						<CardHeader>
							<CardTitle className='text-white'>Herbs</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{herbs.map((herb) => (
									<div key={herb.id} className='flex items-center gap-4'>
										<div className='w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center'>
											<img src={herb.image} alt={herb.name} className='w-10 h-10' />
										</div>
										<div className='flex-1'>
											<p className='text-white'>{herb.name}</p>
										</div>
										<Input type='number' min='0' value={inventory.herbs[herb.id] || 0} onChange={(e) => updateHerbQuantity(herb.id, Number(e.target.value))} className='w-24 bg-[#0f1f0f] border-[#2a5331] text-white' />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='potions'>
					<div className='grid grid-cols-1 gap-4'>
						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Potions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>{extremePotions.map(renderPotionInputs)}</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Potions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>{secondaries.filter((secondary) => secondary.id.startsWith('super_')).map(renderPotionInputs)}</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Regular Potions</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>{secondaries.filter((secondary) => ['prayer_renewal', 'prayer_potion', 'antifire'].includes(secondary.id)).map(renderPotionInputs)}</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value='other'>
					<Card className='bg-[#1a2e1a] border-[#2a5331]'>
						<CardHeader>
							<CardTitle className='text-white'>Other Items</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{secondaries
									.filter((secondary) => !secondary.id.startsWith('super_') && !['prayer_renewal', 'prayer_potion', 'antifire'].includes(secondary.id))
									.map((secondary) => (
										<div key={secondary.id} className='flex items-center gap-4'>
											<div className='w-12 h-12 bg-[#2a5331] rounded-md flex items-center justify-center'>
												<img src={secondary.image} alt={secondary.name} className='w-10 h-10' />
											</div>
											<div className='flex-1'>
												<p className='text-white'>{secondary.name}</p>
											</div>
											<Input type='number' min='0' value={inventory.secondaries[secondary.id] || 0} onChange={(e) => updateSecondaryQuantity(secondary.id, Number(e.target.value))} className='w-24 bg-[#0f1f0f] border-[#2a5331] text-white' />
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Button onClick={resetInventory} variant='destructive' className='w-full bg-red-900 hover:bg-red-800 text-white'>
				Reset Inventory
			</Button>
		</div>
	);
}
