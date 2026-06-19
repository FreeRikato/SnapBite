import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";

import type { FoodItem } from "@/types/analysis";

const indexedDbStorage: StateStorage = {
	getItem: async (name) => (await get(name)) ?? null,
	setItem: async (name, value) => {
		await set(name, value);
	},
	removeItem: async (name) => {
		await del(name);
	},
};

export type Meal = {
	id: string;
	thumbnail: string;
	photos: string[];
	thumbnailKey?: string | null;
	photoKeys?: string[];
	name: string;
	status: "saved" | "draft";
	kcal: number;
	protein: number;
	carbs: number;
	fat: number;
	uploadedAt: string;
	foodItems: FoodItem[];
	pending?: true;
	error?: string | null;
	progress?: number;
};

type HomeState = {
	selectedDate: string;
	setSelectedDate: (iso: string) => void;
	streak: number;
	setStreak: (n: number) => void;
	pendingMeals: Meal[];
	recentMeals: Meal[];
	mealsById: Record<string, Meal>;
	addPendingMeal: (meal: Meal) => void;
	removePendingMeal: (id: string) => void;
	setPendingMealError: (id: string, error: string) => void;
	setPendingMealProgress: (id: string, progress: number) => void;
	setRecentMeals: (meals: Meal[]) => void;
	upsertCachedMeals: (meals: Meal[]) => void;
	removeCachedMeal: (id: string) => void;
};

export const useHomeStore = create<HomeState>()(
	persist(
		(set) => ({
			selectedDate: new Date().toISOString().slice(0, 10),
			setSelectedDate: (selectedDate) => set({ selectedDate }),
			streak: 7,
			setStreak: (streak) => set({ streak }),
			pendingMeals: [],
			recentMeals: [],
			mealsById: {},
			addPendingMeal: (meal) =>
				set((state) => ({ pendingMeals: [meal, ...state.pendingMeals] })),
			removePendingMeal: (id) =>
				set((state) => ({
					pendingMeals: state.pendingMeals.filter((m) => m.id !== id),
				})),
			setPendingMealError: (id, error) =>
				set((state) => ({
					pendingMeals: state.pendingMeals.map((m) =>
						m.id === id ? { ...m, error } : m,
					),
				})),
			setPendingMealProgress: (id, progress) =>
				set((state) => ({
					pendingMeals: state.pendingMeals.map((m) =>
						m.id === id ? { ...m, progress } : m,
					),
				})),
			setRecentMeals: (meals) =>
				set((state) => ({
					recentMeals: meals,
					mealsById: {
						...state.mealsById,
						...Object.fromEntries(meals.map((meal) => [meal.id, meal])),
					},
				})),
			upsertCachedMeals: (meals) =>
				set((state) => {
					const incomingById = Object.fromEntries(
						meals.map((meal) => [meal.id, meal]),
					);
					const recentIds = new Set(state.recentMeals.map((meal) => meal.id));
					const restoredMeals = meals.filter((meal) => !recentIds.has(meal.id));

					return {
						mealsById: {
							...state.mealsById,
							...incomingById,
						},
						recentMeals: [
							...restoredMeals,
							...state.recentMeals.map((meal) => incomingById[meal.id] ?? meal),
						],
					};
				}),
			removeCachedMeal: (id) =>
				set((state) => {
					const { [id]: _removed, ...mealsById } = state.mealsById;
					return {
						mealsById,
						recentMeals: state.recentMeals.filter((meal) => meal.id !== id),
						pendingMeals: state.pendingMeals.filter((meal) => meal.id !== id),
					};
				}),
		}),
		{
			name: "snapbite-home-cache",
			storage: createJSONStorage(() => indexedDbStorage),
			partialize: (state) => ({
				selectedDate: state.selectedDate,
				streak: state.streak,
				recentMeals: state.recentMeals,
				mealsById: state.mealsById,
			}),
		},
	),
);
