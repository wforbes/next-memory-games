import { useState, useEffect, useCallback } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DemoGameSettings } from '../types';


type DemoSettingsDialogProps = {
	settings: DemoGameSettings;
	onSave: (newSettings: DemoGameSettings) => void;
}

export default function DemoSettingsDialog(
	{ settings, onSave }: DemoSettingsDialogProps
) {
	const [open, setOpen] = useState<boolean>(false);
	const [validationError, setValidationError] = useState<string>("");
	const [cardCount, setCardCount] = useState<string>("");
	const [cardsPerMatch, setCardsPerMatch] = useState<string>("");
	const [canUnflipCards, setCanUnflipCards] = useState<boolean>(false);
	const [missFlipDelay, setMissFlipDelay] = useState<string>("");

	const loadSettings = useCallback(() => {
		if (!settings) return;
		console.log(JSON.stringify(settings));
		setCardCount(""+settings.cardCount);
		setCardsPerMatch(""+settings.cardsPerMatch);
		setCanUnflipCards(settings.canUnflipCards);
		setMissFlipDelay(""+settings.missFlipDelay);
	}, [settings])

	const clearSettings = useCallback(() => {
		setCardCount("");
		setCardsPerMatch("");
		setCanUnflipCards(false);
		setMissFlipDelay("");
	}, [])

	useEffect(() => {
		
		if (open === true) {
			console.log("opened")
			loadSettings();
		} else {
			console.log("closed")
			clearSettings();
		}
	}, [open, loadSettings, clearSettings])

	const saveIsValid = () => {
		if (isNaN(parseInt(cardCount))) {
			setValidationError("Card Count must be a number")
			return false;
		}
		if (+cardCount <= 0) {
			setValidationError("Card Count must be greater than 0")
			return false;
		}
		if (isNaN(parseInt(cardsPerMatch))) {
			setValidationError("Cards Per Match must be a number")
			return false;
		}
		if (+cardsPerMatch <= 1) {
			setValidationError("Cards Per Match must be greater than 1")
			return false;
		}
		if (+cardCount <= +cardsPerMatch) {
			setValidationError("CardCount must be greater than cards per match")
			return false;
		}
		if ((+cardCount) % (+cardsPerMatch) !== 0) {
			setValidationError("Card Count must be evenly divisible by Cards Per Match");
			return false;
		}

		return true;
	}

	const handleSave = () => {
		setValidationError("");
		if(!saveIsValid()) {
			return;
		}
		const newSettings: DemoGameSettings = {
			cardCount: +cardCount,
			cardsPerMatch: +cardsPerMatch,
			canUnflipCards,
			missFlipDelay: +missFlipDelay
		};
		console.log("saving new settings state")
		console.log(JSON.stringify(newSettings));
		onSave(newSettings);
		setOpen(false);
	}

	const canSave = () => {
		return (
			(settings.cardCount+"") !== cardCount
			|| (settings.cardsPerMatch+"") !== cardsPerMatch
			|| (settings.canUnflipCards) !== canUnflipCards
			|| (settings.missFlipDelay+"") !== missFlipDelay
		);
	}

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button>Change Settings</Button>
				</DialogTrigger>
				<DialogContent className="px-3">
					<DialogHeader>
						<DialogTitle className="text-center">Demo Game Settings</DialogTitle>
						<DialogDescription></DialogDescription>
					</DialogHeader>
					<Card className="flex flex-col p-4 gap-4">
						<div>
							<Label htmlFor="setting_cardCount">Card Count</Label>
							<Input
								id="setting_cardCount"
								type="text"
								placeholder="Card Count"
								value={cardCount}
								onChange={(e) => setCardCount(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="setting_cardsPerMatch">Cards per Match</Label>
							<Input
								id="setting_cardsPerMatch"
								type="text"
								placeholder="Cards per Match"
								value={cardsPerMatch}
								onChange={(e) => setCardsPerMatch(e.target.value)}
								disabled
								className="cursor-not-allowed"
							/>
						</div>
						<div>
							<Label htmlFor="setting_canUnflipCards">Can Unflip Cards</Label>
							<Checkbox
								id="setting_canUnflipCards"
								checked={canUnflipCards}
								onCheckedChange={() => setCanUnflipCards(!canUnflipCards)}
							/>
						</div>
						<div>
							<Label htmlFor="setting_missFlipDelay">Delay after missing a card match (in milliseconds)</Label>
							<Input
								id="setting_missFlipDelay"
								type="text"
								placeholder="Delay after missing a card match (in milliseconds)"
								value={missFlipDelay}
								onChange={(e) => setMissFlipDelay(e.target.value)}
							/>
						</div>
						{validationError && validationError.length > 0 &&
							<div className="text-red-600 text-center">
								Error: {validationError}
							</div>
						}
					</Card>
					<DialogFooter className="flex flex-row">
						<Button onClick={handleSave} disabled={!canSave()}>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}