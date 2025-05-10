import Link from 'next/link';
import HerbTracker from '@/components/herb-tracker';
import OverloadCalculator from '@/components/overload-calculator';
import ShoppingList from '@/components/shopping-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
	return (
		<div className='min-h-screen bg-[#1a1a1a] text-white'>
			<header className='bg-[#1e3a23] border-b border-[#2a5331] p-4'>
				<div className='container mx-auto flex items-center justify-between'>
					<h1 className='text-white font-bold text-2xl'>Runescape 3 Overload Tracker</h1>
					<nav>
						<Link href='https://runescape.wiki/w/Overload' target='_blank' className='text-white hover:text-gray-300'>
							Overload (RS Wiki)
						</Link>
					</nav>
				</div>
			</header>

			<main className='container mx-auto py-4'>
				<Tabs defaultValue='tracker' className='w-full'>
					<TabsList className='grid w-full h-full grid-cols-3 mb-4 bg-[#1a2e1a] border border-[#2a5331] '>
						<TabsTrigger value='tracker' className='text-lg text-white rounded-md transition-colors data-[state=active]:bg-[#2a5331] data-[state=active]:text-white'>
							Herb Inventory
						</TabsTrigger>
						<TabsTrigger value='calculator' className='text-lg text-white rounded-md transition-colors data-[state=active]:bg-[#2a5331] data-[state=active]:text-white'>
							Overload Calculator
						</TabsTrigger>
						<TabsTrigger value='shopping' className='text-lg text-white rounded-md transition-colors data-[state=active]:bg-[#2a5331] data-[state=active]:text-white'>
							Shopping List
						</TabsTrigger>
					</TabsList>

					<TabsContent value='tracker'>
						<HerbTracker />
					</TabsContent>

					<TabsContent value='calculator'>
						<OverloadCalculator />
					</TabsContent>

					<TabsContent value='shopping'>
						<ShoppingList />
					</TabsContent>
				</Tabs>
			</main>

			<footer className='bg-[#1e3a23] border-t border-[#2a5331] p-4 mt-auto'>
				<div className='container mx-auto text-center text-sm text-white'>This is a fan-made tool and is not affiliated with Jagex or RuneScape.</div>
			</footer>
		</div>
	);
}
