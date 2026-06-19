import {
	CookingPot,
	Croissant,
	Donut,
	Droplets,
	Flame,
	Leaf,
	Salad,
	Scaling,
	Soup,
	UtensilsCrossed,
} from "lucide-react";

import type { ClarifyQuestion, FoodItem, QuantityUnit } from "@/types/analysis";

/** Shared id for the "type your answer…" option on every question. */
export const CUSTOM_OPTION_ID = "custom";

export const QUANTITY_UNITS: QuantityUnit[] = [
	"Plates",
	"Pieces",
	"Grams",
	"ml",
	"l",
];

export const CLARIFY_QUESTIONS: ClarifyQuestion[] = [
	{
		id: "cooking-method",
		prompt: "How was this prepared?",
		icon: Flame,
		color: "text-orange-400",
		options: [
			{
				id: "grilled",
				label: "Grilled",
				icon: Flame,
				color: "text-orange-400",
			},
			{ id: "fried", label: "Fried", icon: Donut, color: "text-amber-400" },
			{
				id: "steamed",
				label: "Steamed or boiled",
				icon: Soup,
				color: "text-sky-400",
			},
		],
	},
	{
		id: "portion-size",
		prompt: "How big is the portion?",
		icon: Scaling,
		color: "text-violet-400",
		options: [
			{
				id: "small",
				label: "Small / snack",
				icon: Leaf,
				color: "text-emerald-400",
			},
			{
				id: "medium",
				label: "Regular meal",
				icon: Salad,
				color: "text-lime-400",
			},
			{
				id: "large",
				label: "Large / sharing",
				icon: UtensilsCrossed,
				color: "text-rose-400",
			},
		],
	},
	{
		id: "extras",
		prompt: "Any oils, sauces or dressings?",
		icon: Droplets,
		color: "text-sky-400",
		options: [
			{
				id: "olive-oil",
				label: "Olive oil",
				icon: Droplets,
				color: "text-emerald-400",
			},
			{
				id: "butter",
				label: "Butter or ghee",
				icon: Croissant,
				color: "text-amber-400",
			},
			{
				id: "sauce",
				label: "Sauce or dressing",
				icon: CookingPot,
				color: "text-rose-400",
			},
		],
	},
];

/** Mocked detection output until the AI estimate flow is wired up. */
export const DEFAULT_FOOD_ITEMS: FoodItem[] = [
	{
		id: "food-salmon",
		emoji: "🐟",
		name: "Grilled salmon",
		quantity: 1,
		unit: "Pieces",
	},
	{
		id: "food-broccoli",
		emoji: "🥦",
		name: "Steamed broccoli",
		quantity: 120,
		unit: "Grams",
	},
	{
		id: "food-rice",
		emoji: "🍚",
		name: "White rice",
		quantity: 1,
		unit: "Plates",
	},
];

export const NEW_FOOD_ITEM_EMOJI = "🍽️";

/** Mocked calorie estimate shown on the result screen. */
export const ANALYZED_CALORIES = 621;
