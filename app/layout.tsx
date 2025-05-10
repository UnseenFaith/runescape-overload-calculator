import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Overload Tracker',
	description: 'A tool to track your Overload potions in RuneScape 3.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body>{children}</body>
		</html>
	);
}
