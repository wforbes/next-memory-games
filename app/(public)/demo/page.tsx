'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

type Card = {
	id: number,
	symbol: string,
	flipped: boolean,
	matched: boolean
}
type PreSymbol = {
	icon: string;
	used: number;
}
const emojis = [ "🤷‍♂️", "👍", "👏", "🧠", "😂", "😁", "🎉", "🤩" ];


export default function Home() {
	const out = (s:string) => { console.log(s) }
	const [MAX_CARDS, SET_MAX_CARDS] = useState<number>(16);
	const [CAN_UNFLIP_CARDS, SET_CAN_UNFLIP_CARDS] = useState<boolean>(true);
	const [MISS_FLIP_DELAY, SET_MISS_FLIP_DELAY] = useState<number>(1000);
	const [cards, setCards] = useState<Card[]>([]);
	const [activeCardId, setActiveCardId] = useState<number | null>(null);
	const [flipCount, setFlipCount] = useState<number>(0);
	const [matchCount, setMatchCount] = useState<number>(0);
	const [missCount, setMissCount] = useState<number>(0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [showWinMessage, setShowWinMessage] = useState<boolean>(false);
	

	const setupCardSymbols = useCallback(() => {
		const symbols = [];
		for (let i = 0; i < MAX_CARDS / 2; i++) {
			symbols.push({ icon: emojis[i], used: 0 })
		}
		return symbols;
	}, [MAX_CARDS]);

	const generateNewCards = useCallback((symbols: PreSymbol[]) => {
		const newCards = [];
		for (let i = 0; i < MAX_CARDS; i++) {
			let symPicked = false;
			const max_j = 100;
			let j = 0;
			while (!symPicked) {
				j++;
				if (j >= max_j) {
					console.log('breaking symbol picking while loop')
					break;
				}
				const symIdx = Math.floor(Math.random() * (symbols.length));
				const candidate = symbols[symIdx];
				if (candidate.used === 2) continue;
				newCards.push({
					id: i,
					symbol: candidate.icon,
					flipped: false,
					matched: false
				})
				symbols[symIdx].used++;
				symPicked = true;
			}
		}
		return newCards
	}, [MAX_CARDS]);

	const resetGameStats = useCallback(() => {
		setActiveCardId(null);
		setFlipCount(0);
		setMatchCount(0);
		setMissCount(0);
		setCards([]);
		setPlaying(false);
	}, [])

	const startGame = useCallback(() => {
		resetGameStats();
		const symbols = setupCardSymbols();
		const newCards = generateNewCards(symbols);
		setCards([...newCards]);
		setPlaying(true);
	}, [resetGameStats, setupCardSymbols, generateNewCards, setCards]);

	useEffect(() => {
		startGame();
	}, [startGame]);

	/* win check useEffect */
	useEffect(() => {
		/*out(`matchCount=${matchCount} ; MAX_CARDS=${MAX_CARDS}`)
		out(`condition one: ${matchCount  >= (MAX_CARDS / 2) - 1}`)
		out(`Cards: ${JSON.stringify(cards)}`)
		out(`condition two: ${cards.every((c) => c.matched && c.flipped)}`)*/
		
		if(
			matchCount  >= (MAX_CARDS / 2) - 1
			&& cards.every((c) => c.matched && c.flipped)
		) {
			setShowWinMessage(true);
			//resetGameStats();
		}
	}, [matchCount, MAX_CARDS, cards, resetGameStats])

	const handleCardClick = (card: Card) => {
		out('===========================================')
		out(`handleCardClick on ${JSON.stringify(card)}`)
		if (!playing) {
			out(`can't flip it - playing=${playing}`)
			out('===========================================')
			return;
		}
		if (card.matched === true) {
			out(`can't flip it - card.matched=${card.matched}`)
			out('===========================================')
			return;
		}

		if (activeCardId === card.id && card.flipped === true) {
			out(`Clicked the active card a second time`)
			out(`CAN_UNFLIP_CARDS=${CAN_UNFLIP_CARDS}`);
			if (CAN_UNFLIP_CARDS) {
				out(`- flipping card ${card.id} back over`)
				flipCardById(card.id);
				out(`- done flipping ${card.id}`)
				out(`- set ${card.id} as the activeCardId`)
				setActiveCardId(null);
			}
			out(`RETURNING handleCardClick on ${card.id}`)
			out('===========================================')
			return;
		}
		
		out(`Flipping card ${card.id}`)
		flipCardById(card.id)
		out(`Done flipping card ${card.id}`)
		
		// if activeCard is null, set this as the active card, add 1 to flipCount, and return
		if (activeCardId === null) {
			out(`activeCardId is null (no other cards are flipped)`);
			setActiveCardId(card.id)
			out(`- set ${card.id} as the activeCardId`)
			setFlipCount((prev) => prev + 1);
			out(`- incremented flip count`)
			out(`RETURNING handleCardClick on ${card.id}`)
			out('===========================================')
			return;
		}

		// if this cards symbol matches the active card
		//	add 1 to matchCount
		//	set activeCard and this card as matched (setting them as disabled and opaque)
		out(`Checking this card matches the active card`)
		const activeIdx = cards.findIndex((c) => c.id === activeCardId);
		out(`Found activeCardId ${activeCardId} has cards arr index ${activeIdx}`)
		if (activeIdx === -1) throw Error("active card not found, we dun goofed");
		if (cards[activeIdx].symbol === card.symbol) {
			out(`Found a match between ${card.id} and ${cards[activeIdx].symbol}`)
			setMatchCount((prev) => prev + 1);
			out(`- incremented match count`)
			setCardAsMatchedById(card.id);
			out(`- set Card id:${card.id} as matched`)
			setCardAsMatchedById(activeCardId);
			out(`- set Card id:${activeCardId} as matched`)
			setActiveCardId(null);
			out(`- set activeCardId as null`);
			out(`RETURNING handleCardClick on ${card.id}`)
			out('===========================================')
			return;
		}
		out(`Did not find a match between Cards ${card.id} and ${activeCardId}`)
		
		setMissCount((prev) => prev + 1);
		setActiveCardId(null);
		out(`setting timeout to flip cards back with a ${MISS_FLIP_DELAY}ms delay`)
		setTimeout(resetFlippedCards, MISS_FLIP_DELAY, card.id, cards[activeIdx].id);
		out('===========================================')
	}

	const resetFlippedCards = (id1: number, id2: number) => {
		out('------------------------------------------')
		out(`resetFlippedCards`)
		flipCardById(id1);
		out(`flipped ${id1}`);
		flipCardById(id2);
		out(`flipped ${id2}`);
		out('------------------------------------------')
	}

	const setCardAsMatchedById = (cardId: number) => {
		out(`setCardAsMatchedById`)
		const card = cards.find((c) => c.id === cardId);
		if (!card) throw Error(`could not find card ${cardId} to set as matched`)
		if (card?.matched === true) return;
		out(`setting Card id:${cardId} as matched`)
		setCards((prev) => prev.map(c => 
			c.id === cardId ? { ...c, matched: true } : c
		));
	}

	const flipCardById = (id: number) => {
		out(`flipCardById on ${id}`)
		setCards((prev) => (
			prev.map(
				(item) => (
					item.id === id ? {...item, flipped: !item.flipped} : item 
				)
			)
		));
	}

	return (
		<>
			<div className="container mx-auto px-4 md:px-6 pt-10">
				<div className="flex flex-col w-full max-w-3xl mx-auto space-y-8">
					<h1 className="text-center">Here&apos;s where we&apos;ll play the game and demonstrate the app.</h1>
					<div className="flex flex-col gap-2">
						<div className="flex flex-row gap-2 justify-center">
							<span>Flip Count: {flipCount}</span> |
							<span>Miss Count: {missCount}</span> |
							<span>Match Count: {matchCount}</span> |
							<span>Active Card: {activeCardId || "(none)"}</span>
						</div>
						<div className="flex flex-row h-4 justify-center">
							{showWinMessage && <span className="font-black">You won! Good job.</span>}
						</div>
					</div>
					<div className="flex mx-auto">
						<div className="mem-card-grid">
							{cards.map((card) => {
								return (
									<div key={`card-${card.id}`} className={`mem-card ${card.flipped ? "flipped" : ""} ${card.matched ? "matched" : ""}`} onClick={() => handleCardClick(card)}>
										<div className="front">
											<div className="px-2">
												<Image src="next.svg" width="150" height="150" alt="next.js logo" className="card-back-img"  />
											</div>
										</div>
										<div className="back" >
											<span className="text-3xl">{card.symbol}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>


				</div>
			</div>
		</>
	);
}
