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
	{
		id: "meal-4",
		thumbnail: foodDb,
		name: "Greek yogurt parfait",
		kcal: 320,
		protein: 28,
		carbs: 42,
		fat: 7,
		uploadedAt: "2026-06-13T15:20:00.000Z",
	},
	{
		id: "meal-5",
		thumbnail: heroImage,
		name: "Grilled chicken plate",
		kcal: 610,
		protein: 52,
		carbs: 48,
		fat: 22,
		uploadedAt: "2026-06-13T12:45:00.000Z",
	},
	{
		id: "meal-6",
		thumbnail: analyzed,
		name: "Avocado egg toast",
		kcal: 450,
		protein: 20,
		carbs: 40,
		fat: 25,
		uploadedAt: "2026-06-12T08:15:00.000Z",
	},
	{
		id: "meal-7",
		thumbnail: foodDb,
		name: "Salmon rice bowl",
		kcal: 680,
		protein: 46,
		carbs: 72,
		fat: 24,
		uploadedAt: "2026-06-11T19:10:00.000Z",
	},
	{
		id: "meal-8",
		thumbnail: heroImage,
		name: "Protein smoothie",
		kcal: 290,
		protein: 32,
		carbs: 24,
		fat: 8,
		uploadedAt: "2026-06-11T10:30:00.000Z",
	},
	{
		id: "meal-9",
		thumbnail: analyzed,
		name: "Turkey sandwich",
		kcal: 520,
		protein: 36,
		carbs: 58,
		fat: 16,
		uploadedAt: "2026-06-10T13:05:00.000Z",
	},
	{
		id: "meal-10",
		thumbnail: foodDb,
		name: "Oatmeal with berries",
		kcal: 380,
		protein: 14,
		carbs: 64,
		fat: 9,
		uploadedAt: "2026-06-10T07:50:00.000Z",
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
