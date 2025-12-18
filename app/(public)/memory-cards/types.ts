export type Card = {
	id: number,
	symbol: string,
	flipped: boolean,
	matched: boolean
}
export type PreSymbol = {
	icon: string;
	used: number;
}
export type DemoGameSettings = {
	cardCount: number;
	cardsPerMatch: number;
	canUnflipCards: boolean;
	missFlipDelay: number;
}