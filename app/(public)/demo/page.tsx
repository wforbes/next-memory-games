'use client';
import './demo.css';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'
import DemoSettingsDialog from '@/app/(public)/demo/_components/DemoSettingsDialog'
import { Card, PreSymbol, DemoGameSettings } from './types'

const emojis = [ "🤷‍♂️", "👍", "👏", "🧠", "😂", "😁", "🎉", "🤩" ];
/*
TODO:
- reset existing game button (keep cards/symbols)
- new game button (regen cards/symbols)
- end current game button (end play session, disable card clicking, allow for settings change)
- refactor matching algo to handle 3 or more "Cards per Match"
- rename 'Card' type to 'MemCard' to avoid confusion with shadcn Card
*/


export default function Home() {
	const out = (s:string) => { console.log(s) }
	const defaultGameSettings: DemoGameSettings = {
		cardCount: 16, cardsPerMatch: 2, canUnflipCards: true, missFlipDelay: 1000
	}
	const [gameSettings, setGameSettings] = useState<DemoGameSettings>({...defaultGameSettings});
	const [cards, setCards] = useState<Card[]>([]);
	const [activeCardId, setActiveCardId] = useState<number | null>(null);
	const [flipCount, setFlipCount] = useState<number>(0);
	const [matchCount, setMatchCount] = useState<number>(0);
	const [missCount, setMissCount] = useState<number>(0);
	const [playing, setPlaying] = useState<boolean>(false);
	const [showWinMessage, setShowWinMessage] = useState<boolean>(false);
	const [gameIsComplete, setGameIsComplete] = useState<boolean>(false);
	

	const setupCardSymbols = useCallback(() => {
		if (gameSettings.cardsPerMatch === 0 || gameSettings.cardCount <= gameSettings.cardsPerMatch || gameSettings.cardCount % gameSettings.cardsPerMatch !== 0) {
			throw new Error(`Cant generate game cards with gameSettings.cardCount=${gameSettings.cardCount} or gameSettings.cardsPerMatch=${gameSettings.cardsPerMatch} values`);
		}
		const symbols = [];
		for (let i = 0; i < gameSettings.cardCount / gameSettings.cardsPerMatch; i++) {
			symbols.push({ icon: emojis[i], used: 0 })
		}
		return symbols;
	}, [gameSettings.cardCount, gameSettings.cardsPerMatch]);

	const generateNewCards = useCallback((symbols: PreSymbol[]) => {
		if (gameSettings.cardsPerMatch === 0 || gameSettings.cardCount <= gameSettings.cardsPerMatch || gameSettings.cardCount % gameSettings.cardsPerMatch !== 0) {
			throw new Error(`Cant generate game cards with gameSettings.cardCount=${gameSettings.cardCount} or gameSettings.cardsPerMatch=${gameSettings.cardsPerMatch} values`);
		}
		const newCards = [];
		for (let i = 0; i < gameSettings.cardCount; i++) {
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
				if (candidate.used === gameSettings.cardsPerMatch) continue;
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
	}, [gameSettings.cardCount, gameSettings.cardsPerMatch]);
	
	const resetGameStats = useCallback(() => {
		setActiveCardId(null);
		setFlipCount(0);
		setMatchCount(0);
		setMissCount(0);
		setCards([]);
	}, [])

	const startGame = useCallback(() => {
		resetGameStats();
		try {
			const symbols = setupCardSymbols();
			const newCards = generateNewCards(symbols);
			setCards([...newCards]);
		} catch (err) {
			// todo: error logging with posthog or sentry or something
			console.error(err);
		}
		
		setPlaying(true);
	}, [resetGameStats, setupCardSymbols, generateNewCards, setCards]);

	useEffect(() => {
		startGame();
	}, [startGame]);

	const winConditionsMet = useCallback(() => {
		return matchCount === (gameSettings.cardCount / gameSettings.cardsPerMatch)
				&& cards.every((c) => c.matched && c.flipped);
	}, [matchCount, gameSettings.cardCount, gameSettings.cardsPerMatch, cards]);

	const endGame = useCallback(() => {
		setPlaying(false);
		setGameIsComplete(true);
		setShowWinMessage(true);
	}, [setPlaying, setGameIsComplete, setShowWinMessage])

	/* win check useEffect */
	useEffect(() => {
		/*out(`matchCount=${matchCount} ; MAX_CARDS=${MAX_CARDS}`)
		out(`condition one: ${matchCount  >= (MAX_CARDS / 2) - 1}`)
		out(`Cards: ${JSON.stringify(cards)}`)
		out(`condition two: ${cards.every((c) => c.matched && c.flipped)}`)*/
		
		if(
			winConditionsMet()
		) {
			endGame();
			setGameIsComplete(true);
			setShowWinMessage(true);
			//resetGameStats();
		}
	}, [matchCount, gameSettings.cardCount, cards, winConditionsMet, endGame])

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
			out(`gameSettings.canUnflipCards=${gameSettings.canUnflipCards}`);
			if (gameSettings.canUnflipCards) {
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
		out(`setting timeout to flip cards back with a ${gameSettings.missFlipDelay}ms delay`)
		setTimeout(resetFlippedCards, gameSettings.missFlipDelay, card.id, cards[activeIdx].id);
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

	const handlePlayAgainClick = () => {
		if (playing || !winConditionsMet() || !gameIsComplete) return;
		setShowWinMessage(false);
		startGame();
	}

	/*const restartGame = () => {
		setPlaying(false);
	}*/

	const handleSettingsUpdate = (newSettings: DemoGameSettings) => {
		setPlaying(false);
		setGameSettings((prev) => ({...prev, ...newSettings}))
		setGameIsComplete(true);
		startGame();
	}

	return (
		<>
			<div className="container mx-auto px-4 md:px-6 pt-10">
				<div className="flex flex-col w-full max-w-3xl mx-auto space-y-8">
					<h1 className="text-3xl text-center">Memory Cards Demo</h1>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-2">
								<div className="flex flex-col text-center">
									<span>Card Count: <span className="font-black">{gameSettings.cardCount}</span></span>
									<span>Cards per match: <span className="font-black">{gameSettings.cardsPerMatch}</span></span>
								</div>
								<div className="flex flex-row justify-center">
									<DemoSettingsDialog settings={gameSettings} onSave={handleSettingsUpdate} />
								</div>
							</div>
							<div className="flex flex-row h-10 justify-center align-middle gap-2">
								{showWinMessage && <>
									<div className="flex flex-col items-center justify-center font-black text-green-700">
										You won! Good job.
									</div>
									<div className="flex justify-center items-center">
										<Button className='h-8 bg-green-700' onClick={handlePlayAgainClick}>Play Again ?</Button>
									</div>
								</>}
							</div>
						</div>
						<div className="flex flex-row gap-2 justify-center">
							<span>Flip Count: {flipCount}</span> |
							<span>Miss Count: {missCount}</span> |
							<span>Match Count: {matchCount}</span> |
							<span>Active Card: {activeCardId || "(none)"}</span>
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
