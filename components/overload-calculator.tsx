'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDefaultInventory as defaultInventory } from '@/lib/data';
import type { InventoryState } from './types';
import { calculateOverloadsFromScratch, calculateAdditionalOverloads } from '@/lib/utils';
import { AlertCircle, Beaker, FlaskRoundIcon as Flask, Layers } from 'lucide-react';

function calculatePossibleOverloads(state: InventoryState) {
	const torstolCount = state.herbs['torstol'] || 0;

	// Calculate total extreme potion doses
	const extremeDoses = {
		attack: state.potionDoses['extreme_attack'] || 0,
		strength: state.potionDoses['extreme_strength'] || 0,
		defence: state.potionDoses['extreme_defence'] || 0,
		magic: state.potionDoses['extreme_magic'] || 0,
		ranging: state.potionDoses['extreme_ranging'] || 0,
		necromancy: state.potionDoses['extreme_necromancy'] || 0,
	};

	// Each overload needs 3 doses of each extreme potion
	const possibleFromExtremes = Math.min(Math.floor(extremeDoses.attack / 3), Math.floor(extremeDoses.strength / 3), Math.floor(extremeDoses.defence / 3), Math.floor(extremeDoses.magic / 3), Math.floor(extremeDoses.ranging / 3), Math.floor(extremeDoses.necromancy / 3));

	const overloads = Math.min(torstolCount, possibleFromExtremes);

	// Determine limiting factors
	const limitingFactors: string[] = [];
	if (torstolCount <= possibleFromExtremes) limitingFactors.push('Torstol');
	if (Math.floor(extremeDoses.attack / 3) <= overloads) limitingFactors.push('Extreme Attack doses');
	if (Math.floor(extremeDoses.strength / 3) <= overloads) limitingFactors.push('Extreme Strength doses');
	if (Math.floor(extremeDoses.defence / 3) <= overloads) limitingFactors.push('Extreme Defence doses');
	if (Math.floor(extremeDoses.magic / 3) <= overloads) limitingFactors.push('Extreme Magic doses');
	if (Math.floor(extremeDoses.ranging / 3) <= overloads) limitingFactors.push('Extreme Ranging doses');
	if (Math.floor(extremeDoses.necromancy / 3) <= overloads) limitingFactors.push('Extreme Necromancy doses');

	return {
		possibleOverloads: overloads,
		limitingFactors,
	};
}

function calculatePossibleExtremes(state: InventoryState): Record<string, { possible: number; limitingFactor: string }> {
	const results: Record<string, { possible: number; limitingFactor: string }> = {};

	// Check Super potion doses and herbs for each extreme
	const superDoses = {
		attack: state.potionDoses['super_attack'] || 0,
		strength: state.potionDoses['super_strength'] || 0,
		defence: state.potionDoses['super_defence'] || 0,
		magic: state.potionDoses['super_magic'] || 0,
		ranging: state.potionDoses['super_ranging'] || 0,
		necromancy: state.potionDoses['super_necromancy'] || 0,
	};

	const herbs = {
		avantoe: state.herbs['avantoe'] || 0,
		dwarfWeed: state.herbs['dwarf_weed'] || 0,
		lantadyme: state.herbs['lantadyme'] || 0,
	};

	// Calculate possible extremes for each type
	const types = ['attack', 'strength', 'defence', 'ranging', 'magic', 'necromancy'] as const;
	types.forEach((type) => {
		const superDoseCount = superDoses[type];
		let herbCount = 0;
		let limitingFactor = '';

		switch (type) {
			case 'attack':
				herbCount = herbs.avantoe;
				break;
			case 'strength':
				herbCount = herbs.dwarfWeed;
				break;
			case 'defence':
				herbCount = herbs.lantadyme;
				break;
			case 'ranging':
			case 'magic':
			case 'necromancy':
				herbCount = Infinity; // These use other secondaries instead of herbs
				break;
		}

		const possible = Math.min(superDoseCount, herbCount);
		limitingFactor = possible === superDoseCount ? `Super ${type} doses` : `${type === 'attack' ? 'Avantoe' : type === 'strength' ? 'Dwarf Weed' : 'Lantadyme'}`;

		results[`extreme_${type}`] = {
			possible,
			limitingFactor,
		};
	});

	return results;
}

function calculatePossibleSupers(state: InventoryState): Record<string, { possible: number; limitingFactor: string }> {
	const results: Record<string, { possible: number; limitingFactor: string }> = {};

	const herbMap = {
		super_attack: 'irit',
		super_strength: 'kwuarm',
		super_defence: 'cadantine',
		super_ranging: 'dwarf_weed',
		super_magic: 'lantadyme',
		super_necromancy: 'spirit_weed',
	} as const;

	const secondaryMap = {
		super_attack: 'eye_of_newt',
		super_strength: 'limpwurt_root',
		super_defence: 'white_berries',
		super_ranging: 'wine_of_zamorak',
		super_magic: 'potato_cactus',
		super_necromancy: 'congealed_blood',
	} as const;

	for (const [potionType, herbType] of Object.entries(herbMap)) {
		const herbCount = state.herbs[herbType] || 0;
		const secondaryType = secondaryMap[potionType as keyof typeof secondaryMap];
		const secondaryCount = state.secondaries[secondaryType] || 0;

		const possible = Math.min(herbCount, secondaryCount);
		const limitingFactor =
			possible === herbCount
				? herbType
						.split('_')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ')
				: secondaryType
						.split('_')
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');

		results[potionType] = { possible, limitingFactor };
	}

	return results;
}

function calculateEffective3DosePotions(potionCounts: Record<string, { oneDose: number; twoDose: number; threeDose: number; fourDose: number }>) {
	const results: Record<string, number> = {};

	for (const [potion, counts] of Object.entries(potionCounts)) {
		// Convert all potions to effective 3-dose potions
		const totalDoses = counts.oneDose * 1 + counts.twoDose * 2 + counts.threeDose * 3 + counts.fourDose * 4;

		results[potion] = Math.floor(totalDoses / 3);
	}

	return results;
}

export default function OverloadCalculator() {
	const [inventory, setInventory] = useState<InventoryState>({
		herbs: {},
		secondaries: {},
		potionDoses: {},
		potionCounts: {},
	});
	const [overloadResults, setOverloadResults] = useState({ possibleOverloads: 0, limitingFactors: [] as string[] });
	const [extremeResults, setExtremeResults] = useState<Record<string, { possible: number; limitingFactor: string }>>({});
	const [superResults, setSuperResults] = useState<Record<string, { possible: number; limitingFactor: string }>>({});
	const [fromScratchResults, setFromScratchResults] = useState<any>(null);
	const [additionalResults, setAdditionalResults] = useState<Record<string, { possible: number; limitingFactors: string[] }>>({});

	// Load inventory from localStorage on component mount
	useEffect(() => {
		const savedInventory = localStorage.getItem('rs3-herb-inventory');
		if (savedInventory) {
			try {
				setInventory(JSON.parse(savedInventory));
			} catch (e) {
				console.error('Failed to parse saved inventory', e);
			}
		}
	}, []);

	// Calculate results whenever inventory changes
	useEffect(() => {
		const overloads = calculatePossibleOverloads(inventory);
		setOverloadResults(overloads);
		setExtremeResults(calculatePossibleExtremes(inventory));
		setSuperResults(calculatePossibleSupers(inventory));
		setFromScratchResults(calculateOverloadsFromScratch(inventory));
		setAdditionalResults(calculateAdditionalOverloads(inventory));
	}, [inventory]);

	return (
		<div className='space-y-6'>
			<h2 className='text-2xl font-bold text-white'>Overload Calculator</h2>

			<Tabs defaultValue='direct' className='w-full'>
				<TabsList className='grid w-full h-full grid-cols-3 mb-8 bg-[#1a2e1a] border border-[#2a5331]'>
					<TabsTrigger value='direct' className='text-lg text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white'>
						Direct Calculation
					</TabsTrigger>
					<TabsTrigger value='scratch' className='text-lg text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white'>
						From Scratch
					</TabsTrigger>
					<TabsTrigger value='variants' className='text-lg text-white data-[state=active]:bg-[#2a5331] data-[state=active]:text-white'>
						Overload Variants
					</TabsTrigger>
				</TabsList>

				<TabsContent value='direct'>
					<Card className='bg-[#1a2e1a] border-[#2a5331]'>
						<CardHeader>
							<CardTitle className='text-white flex items-center gap-2'>
								<Beaker className='h-6 w-6' />
								Overload Potions
							</CardTitle>
							<CardDescription className='text-gray-300'>You can make overloads by combining clean torstol with all six extreme potions.</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='text-3xl font-bold text-white'>
								{overloadResults.possibleOverloads} <span className='text-lg font-normal text-gray-300'>possible overloads</span>
							</div>

							{overloadResults.limitingFactors.length > 0 && (
								<Alert variant='destructive' className='bg-[#2a5331] border-[#3a7341]'>
									<AlertCircle className='h-4 w-4' />
									<AlertTitle className='text-white'>Limiting Factors</AlertTitle>
									<AlertDescription className='text-gray-200'>You're limited by: {overloadResults.limitingFactors.join(', ')}</AlertDescription>
								</Alert>
							)}

							<div className='mt-4 p-4 bg-[#2a5331] rounded-md'>
								<h4 className='text-white font-medium mb-2'>Dose Conversion</h4>
								<p className='text-gray-200 text-sm'>The calculator automatically converts between 4-dose and 3-dose potions. Each 4-dose potion can make 1 3-dose potion with 1 dose left over. Every 3 leftover doses can make another 3-dose potion.</p>
							</div>
						</CardContent>
					</Card>

					<h3 className='text-xl font-bold mt-8 text-white'>Extreme Potions</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Attack</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>4-dose potions:</span>
										<span className='font-bold'>{inventory.potionCounts['extreme_attack']?.fourDose || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Total doses:</span>
										<span className='font-bold'>{inventory.potionDoses['extreme_attack'] || 0}</span>
									</div>
									{extremeResults.extreme_attack?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {extremeResults.extreme_attack.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Strength</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>4-dose potions:</span>
										<span className='font-bold'>{inventory.potionCounts['extreme_strength']?.fourDose || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Total doses:</span>
										<span className='font-bold'>{inventory.potionDoses['extreme_strength'] || 0}</span>
									</div>
									{extremeResults.extreme_strength?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {extremeResults.extreme_strength.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Defence</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>4-dose potions:</span>
										<span className='font-bold'>{inventory.potionCounts['extreme_defence']?.fourDose || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Total doses:</span>
										<span className='font-bold'>{inventory.potionDoses['extreme_defence'] || 0}</span>
									</div>
									{extremeResults.extreme_defence?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {extremeResults.extreme_defence.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Ranging</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>4-dose potions:</span>
										<span className='font-bold'>{inventory.potionCounts['extreme_ranging']?.fourDose || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Total doses:</span>
										<span className='font-bold'>{inventory.potionDoses['extreme_ranging'] || 0}</span>
									</div>
									{extremeResults.extreme_ranging?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {extremeResults.extreme_ranging.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Magic</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>4-dose potions:</span>
										<span className='font-bold'>{inventory.potionCounts['extreme_magic']?.fourDose || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Total doses:</span>
										<span className='font-bold'>{inventory.potionDoses['extreme_magic'] || 0}</span>
									</div>
									{extremeResults.extreme_magic?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {extremeResults.extreme_magic.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Extreme Necromancy</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>4-dose potions:</span>
										<span className='font-bold'>{inventory.potionCounts['extreme_necromancy']?.fourDose || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Total doses:</span>
										<span className='font-bold'>{inventory.potionDoses['extreme_necromancy'] || 0}</span>
									</div>
									{extremeResults.extreme_necromancy?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {extremeResults.extreme_necromancy.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>
					</div>

					<h3 className='text-xl font-bold mt-8 text-white'>Super Potions</h3>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Attack</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>Possible to make:</span>
										<span className='font-bold'>{superResults.super_attack?.possible || 0}</span>
									</div>
									{superResults.super_attack?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {superResults.super_attack.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Strength</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>Possible to make:</span>
										<span className='font-bold'>{superResults.super_strength?.possible || 0}</span>
									</div>
									{superResults.super_strength?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {superResults.super_strength.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Defence</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>Possible to make:</span>
										<span className='font-bold'>{superResults.super_defence?.possible || 0}</span>
									</div>
									{superResults.super_defence?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {superResults.super_defence.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Ranging</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>Possible to make:</span>
										<span className='font-bold'>{superResults.super_ranging?.possible || 0}</span>
									</div>
									{superResults.super_ranging?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {superResults.super_ranging.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Magic</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>Possible to make:</span>
										<span className='font-bold'>{superResults.super_magic?.possible || 0}</span>
									</div>
									{superResults.super_magic?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {superResults.super_magic.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Super Necromancy</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-2'>
									<div className='flex justify-between text-white'>
										<span>Possible to make:</span>
										<span className='font-bold'>{superResults.super_necromancy?.possible || 0}</span>
									</div>
									{superResults.super_necromancy?.limitingFactor && <div className='text-sm text-gray-300'>Limited by: {superResults.super_necromancy.limitingFactor}</div>}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value='scratch'>
					<Card className='bg-[#1a2e1a] border-[#2a5331]'>
						<CardHeader>
							<CardTitle className='text-white flex items-center gap-2'>
								<Layers className='h-6 w-6' />
								Overloads From Scratch
							</CardTitle>
							<CardDescription className='text-gray-300'>Calculate how many overloads you can make starting from basic ingredients.</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{fromScratchResults && (
								<div className='space-y-6'>
									<div className='text-3xl font-bold text-white'>
										{fromScratchResults.overloadResults.possibleOverloads} <span className='text-lg font-normal text-gray-300'>possible overloads from scratch</span>
									</div>

									{fromScratchResults.overloadResults.limitingFactors.length > 0 && (
										<Alert variant='destructive' className='bg-[#2a5331] border-[#3a7341]'>
											<AlertCircle className='h-4 w-4' />
											<AlertTitle className='text-white'>Limiting Factors</AlertTitle>
											<AlertDescription className='text-gray-200'>You're limited by: {fromScratchResults.overloadResults.limitingFactors.join(', ')}</AlertDescription>
										</Alert>
									)}

									<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
										<div>
											<h3 className='text-xl font-bold mb-4 text-white'>Super Potions</h3>
											<div className='space-y-4'>
												<Card className='bg-[#1a2e1a] border-[#2a5331]'>
													<CardContent className='pt-4'>
														<div className='grid grid-cols-2 gap-4'>
															<div>
																<p className='font-semibold text-white'>Super Attack</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.superResults.super_attack?.possible || 0} possible</p>
																{fromScratchResults.superResults.super_attack?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.superResults.super_attack.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Super Strength</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.superResults.super_strength?.possible || 0} possible</p>
																{fromScratchResults.superResults.super_strength?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.superResults.super_strength.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Super Defence</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.superResults.super_defence?.possible || 0} possible</p>
																{fromScratchResults.superResults.super_defence?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.superResults.super_defence.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Super Ranging</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.superResults.super_ranging?.possible || 0} possible</p>
																{fromScratchResults.superResults.super_ranging?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.superResults.super_ranging.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Super Magic</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.superResults.super_magic?.possible || 0} possible</p>
																{fromScratchResults.superResults.super_magic?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.superResults.super_magic.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Super Necromancy</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.superResults.super_necromancy?.possible || 0} possible</p>
																{fromScratchResults.superResults.super_necromancy?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.superResults.super_necromancy.limitingFactor}</p>}
															</div>
														</div>
													</CardContent>
												</Card>
											</div>
										</div>

										<div>
											<h3 className='text-xl font-bold mb-4 text-white'>Extreme Potions</h3>
											<div className='space-y-4'>
												<Card className='bg-[#1a2e1a] border-[#2a5331]'>
													<CardContent className='pt-4'>
														<div className='grid grid-cols-2 gap-4'>
															<div>
																<p className='font-semibold text-white'>Extreme Attack</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.extremeResults.extreme_attack?.possible || 0} possible</p>
																{fromScratchResults.extremeResults.extreme_attack?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.extremeResults.extreme_attack.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Extreme Strength</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.extremeResults.extreme_strength?.possible || 0} possible</p>
																{fromScratchResults.extremeResults.extreme_strength?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.extremeResults.extreme_strength.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Extreme Defence</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.extremeResults.extreme_defence?.possible || 0} possible</p>
																{fromScratchResults.extremeResults.extreme_defence?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.extremeResults.extreme_defence.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Extreme Ranging</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.extremeResults.extreme_ranging?.possible || 0} possible</p>
																{fromScratchResults.extremeResults.extreme_ranging?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.extremeResults.extreme_ranging.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Extreme Magic</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.extremeResults.extreme_magic?.possible || 0} possible</p>
																{fromScratchResults.extremeResults.extreme_magic?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.extremeResults.extreme_magic.limitingFactor}</p>}
															</div>
															<div>
																<p className='font-semibold text-white'>Extreme Necromancy</p>
																<p className='text-sm text-gray-300'>{fromScratchResults.extremeResults.extreme_necromancy?.possible || 0} possible</p>
																{fromScratchResults.extremeResults.extreme_necromancy?.limitingFactor && <p className='text-xs text-gray-300'>Limited by: {fromScratchResults.extremeResults.extreme_necromancy.limitingFactor}</p>}
															</div>
														</div>
													</CardContent>
												</Card>
											</div>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='variants'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Overload Salve (6)</CardTitle>
								<CardDescription className='text-gray-300'>Combines overload with prayer renewal, antifire, and antipoison.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='text-2xl font-bold text-white'>{additionalResults.overload_salve?.possible || 0} possible</div>

								{additionalResults.overload_salve?.limitingFactors.length > 0 && <div className='text-sm text-gray-300'>Limited by: {additionalResults.overload_salve?.limitingFactors.join(', ')}</div>}

								<div className='mt-4'>
									<h4 className='font-semibold mb-2 text-white'>Recipe:</h4>
									<ul className='list-disc pl-5 space-y-1 text-gray-200'>
										<li>1 × Overload (4)</li>
										<li>1 × Prayer Renewal (4)</li>
										<li>1 × Prayer Potion (4)</li>
										<li>1 × Super Antifire (4)</li>
										<li>1 × Antifire (4)</li>
										<li>1 × Super Antipoison (4)</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Supreme Overload (6)</CardTitle>
								<CardDescription className='text-gray-300'>Stronger version of the overload potion.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='text-2xl font-bold text-white'>{additionalResults.supreme_overload?.possible || 0} possible</div>

								{additionalResults.supreme_overload?.limitingFactors.length > 0 && <div className='text-sm text-gray-300'>Limited by: {additionalResults.supreme_overload?.limitingFactors.join(', ')}</div>}

								<div className='mt-4'>
									<h4 className='font-semibold mb-2 text-white'>Recipe:</h4>
									<ul className='list-disc pl-5 space-y-1 text-gray-200'>
										<li>1 × Overload (4)</li>
										<li>1 × Super Attack (4)</li>
										<li>1 × Super Strength (4)</li>
										<li>1 × Super Defence (4)</li>
										<li>1 × Super Ranging (4)</li>
										<li>1 × Super Magic (4)</li>
										<li>1 × Super Necromancy (4)</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Supreme Overload Salve (6)</CardTitle>
								<CardDescription className='text-gray-300'>Combines supreme overload with prayer renewal, antifire, and antipoison.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='text-2xl font-bold text-white'>{additionalResults.supreme_overload_salve?.possible || 0} possible</div>

								{additionalResults.supreme_overload_salve?.limitingFactors.length > 0 && <div className='text-sm text-gray-300'>Limited by: {additionalResults.supreme_overload_salve?.limitingFactors.join(', ')}</div>}

								<div className='mt-4'>
									<h4 className='font-semibold mb-2 text-white'>Recipe:</h4>
									<ul className='list-disc pl-5 space-y-1 text-gray-200'>
										<li>1 × Supreme Overload (6)</li>
										<li>1 × Prayer Renewal (4)</li>
										<li>1 × Prayer Potion (4)</li>
										<li>1 × Super Antifire (4)</li>
										<li>1 × Antifire (4)</li>
										<li>1 × Super Antipoison (4)</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Elder Overload (6)</CardTitle>
								<CardDescription className='text-gray-300'>The strongest overload variant.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='text-2xl font-bold text-white'>{additionalResults.elder_overload?.possible || 0} possible</div>

								{additionalResults.elder_overload?.limitingFactors.length > 0 && <div className='text-sm text-gray-300'>Limited by: {additionalResults.elder_overload?.limitingFactors.join(', ')}</div>}

								<div className='mt-4'>
									<h4 className='font-semibold mb-2 text-white'>Recipe:</h4>
									<ul className='list-disc pl-5 space-y-1 text-gray-200'>
										<li>1 × Supreme Overload (6)</li>
										<li>1 × Primal Extract</li>
										<li>1 × Clean Fellstalk</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						<Card className='bg-[#1a2e1a] border-[#2a5331]'>
							<CardHeader>
								<CardTitle className='text-white'>Elder Overload Salve (6)</CardTitle>
								<CardDescription className='text-gray-300'>The strongest combined overload variant.</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='text-2xl font-bold text-white'>{additionalResults.elder_overload_salve?.possible || 0} possible</div>

								{additionalResults.elder_overload_salve?.limitingFactors.length > 0 && <div className='text-sm text-gray-300'>Limited by: {additionalResults.elder_overload_salve?.limitingFactors.join(', ')}</div>}

								<div className='mt-4'>
									<h4 className='font-semibold mb-2 text-white'>Recipe:</h4>
									<ul className='list-disc pl-5 space-y-1 text-gray-200'>
										<li>1 × Elder Overload (6)</li>
										<li>1 × Prayer Renewal (4)</li>
										<li>1 × Prayer Potion (4)</li>
										<li>1 × Super Antifire (4)</li>
										<li>1 × Antifire (4)</li>
										<li>1 × Super Antipoison (4)</li>
									</ul>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			<Card className='bg-[#1a2e1a] border-[#2a5331] mt-8'>
				<CardHeader>
					<CardTitle className='text-white flex items-center gap-2'>
						<Flask className='h-6 w-6' />
						Overload Recipe
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<h4 className='font-semibold mb-2 text-white'>Ingredients per Overload:</h4>
								<ul className='list-disc pl-5 space-y-1 text-gray-200'>
									<li>1 × Clean Torstol</li>
									<li>1 × Extreme Attack (3)</li>
									<li>1 × Extreme Strength (3)</li>
									<li>1 × Extreme Defence (3)</li>
									<li>1 × Extreme Ranging (3)</li>
									<li>1 × Extreme Magic (3)</li>
									<li>1 × Extreme Necromancy (3)</li>
								</ul>
							</div>

							<div>
								<h4 className='font-semibold mb-2 text-white'>Extreme Potion Ingredients:</h4>
								<ul className='list-disc pl-5 space-y-1 text-gray-200'>
									<li>
										<span className='text-white'>Extreme Attack:</span> Super Attack + Avantoe
									</li>
									<li>
										<span className='text-white'>Extreme Strength:</span> Super Strength + Dwarf Weed
									</li>
									<li>
										<span className='text-white'>Extreme Defence:</span> Super Defence + Lantadyme
									</li>
									<li>
										<span className='text-white'>Extreme Ranging:</span> Super Magic + 5 Grenwall Spikes
									</li>
									<li>
										<span className='text-white'>Extreme Magic:</span> Super Ranging + Ground Mud Runes
									</li>
									<li>
										<span className='text-white'>Extreme Necromancy:</span> Super Necromancy + Ground Miasma Runes
									</li>
								</ul>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

const getDefaultInventory = (): InventoryState => ({
	herbs: {},
	secondaries: {},
	extremePotions: {},
	extremePotions3: {},
	superPotions3: {},
	overloadPotions: { overload: 0 },
	overloadPotions3: { overload: 0 },
	overloads: { overload: 0 },
	overloads3: { overload: 0 },
});
