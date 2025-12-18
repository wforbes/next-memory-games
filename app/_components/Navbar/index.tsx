import Link from 'next/link';
import { Brain } from 'lucide-react';

const navLinks = [{
	key: 'memory-cards',
	label: 'Memory Cards',
	href: '/memory-cards'
}]

export default function Navbar() {
	return (
		<header data-testid="appbar" className="sticky top-0 z-40 w-full px-4 lg:px-6 h-14 flex border-b bg-background">
			<div className="w-full max-w-screen-2xl mx-auto flex items-center">
				{/* todo: <SidebarTrigger /> goes here */}
				<Link className="flex items-center justify-center z-10" href={"/"}>
					<Brain className="h-6 w-6 mr-2" />
					<span className="text-xl font-bold">Memory Game</span>
				</Link>
				<div className="flex-1 flex justify-center ml-[-180px]">
					<nav className="hidden md:flex items-center w-full">
						<div className="flex flex-row items-center justify-center gap-2 w-[80%] mx-auto">
							{navLinks.map((item) =>
								<Link key={`${item.key}-nav-link`} className="text-lg font-medium hover:underline underline-offset-4" href={item.href}>
									{item.label}
								</Link>
							)}
						</div>
					</nav>
				</div>
				<div className="flex gap-2 items-center">
					{/* todo: auth and user icon buttons go here */}
				</div>
			</div>
		</header>
	)
}