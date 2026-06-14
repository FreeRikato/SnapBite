import { create } from "zustand";
import { persist } from "zustand/middleware";

import analyzed from "@/assets/examples/analyzed.png";
import foodDb from "@/assets/examples/food-db.png";
import heroImage from "@/assets/examples/hero-image.webp";

export type Meal = {
	id: string;
	thumbnail: string;
	name: string;
	kcal: number;
	protein: number;
	carbs: number;
	fat: number;
	uploadedAt: string;
};

type HomeState = {
	selectedDate: string;
	setSelectedDate: (iso: string) => void;
	streak: number;
	setStreak: (n: number) => void;
	consumed: number;
	setConsumed: (n: number) => void;
	meals: Meal[];
};

const DUMMY_MEALS: Meal[] = [
	{
		id: "meal-1",
		thumbnail: foodDb,
		name: "Apple salad bowl",
		kcal: 500,
		protein: 78,
		carbs: 78,
		fat: 78,
		uploadedAt: "2026-06-14T09:00:00.000Z",
	},
	{
		id: "meal-2",
		thumbnail: heroImage,
		name: "Apple salad bowl",
		kcal: 500,
		protein: 78,
		carbs: 78,
		fat: 78,
		uploadedAt: "2026-06-14T09:00:00.000Z",
	},
	{
		id: "meal-3",
		thumbnail: analyzed,
		name: "Apple salad bowl",
		kcal: 500,
		protein: 78,
		carbs: 78,
		fat: 78,
		uploadedAt: "2026-06-14T09:00:00.000Z",
	},
];

const initial = {
	selectedDate: new Date().toISOString().slice(0, 10),
	streak: 7,
	consumed: 800,
	meals: DUMMY_MEALS,
};

export const useHomeStore = create<HomeState>()(
	persist(
		(set) => ({
			...initial,
			setSelectedDate: (selectedDate) => set({ selectedDate }),
			setStreak: (streak) => set({ streak }),
			setConsumed: (consumed) => set({ consumed }),
		}),
		{
			name: "snapbite-home",
			partialize: (state) => ({
				selectedDate: state.selectedDate,
				streak: state.streak,
				consumed: state.consumed,
			}),
		},
	),
);
