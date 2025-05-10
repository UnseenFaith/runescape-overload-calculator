'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDefaultInventory } from '@/lib/data';
import type { InventoryState } from './types';
import { calculatePossibleOverloads, calculatePossibleExtremes, calculatePossibleSupers, calculateOverloadsFromScratch, calculateAdditionalOverloads, calculateEffective3DosePotions } from '@/lib/utils';
import { AlertCircle, Beaker, FlaskRoundIcon as Flask, Layers } from 'lucide-react';

export default function OverloadCalculator() {
	const [inventory, setInventory] = useState<InventoryState>(getDefaultInventory());
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
		setAdditionalResults(calculateAdditionalOverloads(inventory, overloads.possibleOverloads));
	}, [inventory]);

	// Calculate effective 3-dose potions for display
	const effective3DoseExtremes = calculateEffective3DosePotions(inventory.extremePotions);

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
										<span className='font-bold'>{inventory.extremePotions.extreme_attack || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Effective 3-dose potions:</span>
										<span className='font-bold'>{effective3DoseExtremes.extreme_attack || 0}</span>
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
										<span className='font-bold'>{inventory.extremePotions.extreme_strength || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Effective 3-dose potions:</span>
										<span className='font-bold'>{effective3DoseExtremes.extreme_strength || 0}</span>
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
										<span className='font-bold'>{inventory.extremePotions.extreme_defence || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Effective 3-dose potions:</span>
										<span className='font-bold'>{effective3DoseExtremes.extreme_defence || 0}</span>
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
										<span className='font-bold'>{inventory.extremePotions.extreme_ranging || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Effective 3-dose potions:</span>
										<span className='font-bold'>{effective3DoseExtremes.extreme_ranging || 0}</span>
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
										<span className='font-bold'>{inventory.extremePotions.extreme_magic || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Effective 3-dose potions:</span>
										<span className='font-bold'>{effective3DoseExtremes.extreme_magic || 0}</span>
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
										<span className='font-bold'>{inventory.extremePotions.extreme_necromancy || 0}</span>
									</div>
									<div className='flex justify-between text-white'>
										<span>Effective 3-dose potions:</span>
										<span className='font-bold'>{effective3DoseExtremes.extreme_necromancy || 0}</span>
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

					<Card className='bg-[#1a2e1a] border-[#2a5331] mt-8'>
						<CardHeader>
							<CardTitle className='text-white flex items-center gap-2'>
								<Flask className='h-6 w-6' />
								Recipe Chain
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<h4 className='font-semibold mb-2 text-white'>Super Potion Recipes:</h4>
										<ul className='list-disc pl-5 space-y-1 text-gray-200'>
											<li>
												<span className='text-white'>Super Attack:</span> Clean Irit + Eye of Newt
											</li>
											<li>
												<span className='text-white'>Super Strength:</span> Clean Kwuarm + Limpwurt Root
											</li>
											<li>
												<span className='text-white'>Super Defence:</span> Clean Cadantine + White Berries
											</li>
											<li>
												<span className='text-white'>Super Ranging:</span> Clean Dwarf Weed + Wine of Zamorak
											</li>
											<li>
												<span className='text-white'>Super Magic:</span> Clean Lantadyme + Potato Cactus
											</li>
											<li>
												<span className='text-white'>Super Necromancy:</span> Clean Spirit Weed + 5 Congealed Blood
											</li>
										</ul>
									</div>

									<div>
										<h4 className='font-semibold mb-2 text-white'>Extreme Potion Recipes:</h4>
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
