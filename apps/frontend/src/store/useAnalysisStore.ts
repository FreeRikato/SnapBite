import { create } from "zustand";

import { DEFAULT_FOOD_ITEMS } from "@/constants/analysis";
import type { ClarifyAnswer, FoodItem } from "@/types/analysis";

type AnalysisState = {
	answers: Record<string, ClarifyAnswer>;
	foodItems: FoodItem[];
	toggleOption: (questionId: string, optionId: string) => void;
	setCustomText: (questionId: string, text: string) => void;
	addFoodItem: (item: Omit<FoodItem, "id">) => void;
	updateFoodItem: (id: string, patch: Partial<Omit<FoodItem, "id">>) => void;
	removeFoodItem: (id: string) => void;
	resetAnalysis: () => void;
};

const emptyAnswer = (): ClarifyAnswer => ({
	selectedOptionIds: [],
	customText: "",
});

function createId() {
	return `food-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAnalysisStore = create<AnalysisState>()((set) => ({
	answers: {},
	foodItems: DEFAULT_FOOD_ITEMS,
	toggleOption: (questionId, optionId) =>
		set((state) => {
			const current = state.answers[questionId] ?? emptyAnswer();
			const selected = current.selectedOptionIds.includes(optionId)
				? current.selectedOptionIds.filter((id) => id !== optionId)
				: [...current.selectedOptionIds, optionId];
			return {
				answers: {
					...state.answers,
					[questionId]: { ...current, selectedOptionIds: selected },
				},
			};
		}),
	setCustomText: (questionId, text) =>
		set((state) => {
			const current = state.answers[questionId] ?? emptyAnswer();
			return {
				answers: {
					...state.answers,
					[questionId]: { ...current, customText: text },
				},
			};
		}),
	addFoodItem: (item) =>
		set((state) => ({
			foodItems: [...state.foodItems, { ...item, id: createId() }],
		})),
	updateFoodItem: (id, patch) =>
		set((state) => ({
			foodItems: state.foodItems.map((item) =>
				item.id === id ? { ...item, ...patch } : item,
			),
		})),
	removeFoodItem: (id) =>
		set((state) => ({
			foodItems: state.foodItems.filter((item) => item.id !== id),
		})),
	resetAnalysis: () => set({ answers: {}, foodItems: DEFAULT_FOOD_ITEMS }),
}));
