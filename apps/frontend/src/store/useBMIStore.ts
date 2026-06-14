import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Gender, Goal } from "@/types/bmi";

type BMIState = {
	height: string;
	weight: string;
	age: string;
	gender: Gender | null;
	goal: Goal | null;
	setHeight: (height: string) => void;
	setWeight: (weight: string) => void;
	setAge: (age: string) => void;
	setGender: (gender: Gender) => void;
	setGoal: (goal: Goal) => void;
	resetBMI: () => void;
};

const initialBMIState = {
	height: "",
	weight: "",
	age: "",
	gender: null,
	goal: null,
};

export const useBMIStore = create<BMIState>()(
	persist(
		(set) => ({
			...initialBMIState,
			setHeight: (height) => set({ height }),
			setWeight: (weight) => set({ weight }),
			setAge: (age) => set({ age }),
			setGender: (gender) => set({ gender }),
			setGoal: (goal) => set({ goal }),
			resetBMI: () => set(initialBMIState),
		}),
		{
			name: "snapbite-bmi",
		},
	),
);
