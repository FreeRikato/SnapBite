import type { LucideIcon } from "lucide-react";

export type QuantityUnit = "Plates" | "Pieces" | "Grams" | "ml" | "l";

export type ClarifyOption = {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
};

export type ClarifyQuestion = {
	id: string;
	prompt: string;
	icon: LucideIcon;
	color: string;
	options: ClarifyOption[];
};

export type ClarifyAnswer = {
	selectedOptionIds: string[];
	customText: string;
};

export type FoodItem = {
	id: string;
	emoji: string;
	name: string;
	quantity: number;
	unit: QuantityUnit;
};
