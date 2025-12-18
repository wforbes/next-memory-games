
export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<h1 className="text-4xl font-bold">What was this again?</h1>
			<h2 className="text-2xl">I forgot...</h2>
			<p className="mt-4">
				Oh yeah! I had an idea to make a memory card game with React.
			</p>
			<p className="mt-4">
				I was interested in comparing the experience of building something by hand versus using an LLM to &apos;vibe code&apos;.
			</p>
			<p>
				Stuff like how long it takes, how much better or worse the code is, and the user experience of the end result.
			</p>
			<p className="mt-4">
				So I created a memory card game. You can play with it here:
			</p>
			<p className="mt-2">
				<a className="text-blue-600 underline font-black" href="/memory-cards">Memory Cards Game</a>
			</p>

			<h3 className="mt-8 text-lg font-medium">
				The &apos;handmade&apos; repo branch is where I built the game myself.
			</h3>
			<h3 className="mt-4 text-lg font-medium">
				I can&apos;t remember if I ever vibe coded it now...
			</h3>
			<p className="mt-4">
				Oh well, have fun!
			</p>
		</main>
	);
}
