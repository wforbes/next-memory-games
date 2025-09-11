import Navbar from '@/app/_components/Navbar'

interface LayoutProps {
	children: React.ReactNode;
}

export default function PublicLayout({ children }: LayoutProps) {
	return <>
		<div className="flex flex-col min-h-screen w-full">
			<Navbar />
			{children}
		</div>
	</>
}