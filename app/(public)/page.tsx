
export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<h1 className="text-4xl font-bold">What was this again?</h1>
			<h2 className="text-2xl">I forgot...</h2>
			<p className="mt-4">
				Oh yeah! I had an idea to make a memory card game with React.
			</p>
			<p className="mt-4">
				So I started doing that, you can play with it here:
			</p>
			<p className="mt-2">
				<a className="text-blue-600 underline font-black" href="/memory-cards">Memory Cards Game</a>
			</p>
			<h3 className="mt-8 text-lg font-medium">
				But I forgot what I was going to build next...
			</h3>
			<p>
				Oh well, have fun!
			</p>
		</main>
	);
}
