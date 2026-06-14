import type { BmiCategory, CalorieModeInfo, Gender, Goal } from "@/types/bmi";

type DailyCaloriesInput = {
	height: number;
	weight: number;
	age: number;
	gender: Gender;
	goal: Goal | null;
};

export function computeDailyCalories({
	height,
	weight,
	age,
	gender,
	goal,
}: DailyCaloriesInput): number | null {
	if (!height || !weight || height <= 0 || !age || !gender) return null;
	const bmr =
		10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
	const tdee = bmr * 1.4;
	if (goal === "lean") return Math.round(tdee - 500);
	if (goal === "gain") return Math.round(tdee + 500);
	return Math.round(tdee);
}

export function getBmiCategory(bmi: number): BmiCategory {
	if (bmi < 18.5) return { label: "Underweight", color: "text-sky-300" };
	if (bmi < 25) return { label: "Healthy", color: "text-emerald-300" };
	if (bmi < 30) return { label: "Overweight", color: "text-amber-300" };
	return { label: "Obese", color: "text-rose-300" };
}

export function getCalorieModeInfo(goal: Goal | null): CalorieModeInfo {
	if (goal === "lean") {
		return {
			label: "Deficit",
			description:
				"Your target is below estimated maintenance calories to support weight loss.",
		};
	}
	if (goal === "gain") {
		return {
			label: "Surplus",
			description:
				"Your target is above estimated maintenance calories to support weight gain.",
		};
	}
	return {
		label: "Maintenance",
		description:
			"Your target is near estimated maintenance calories to help keep weight stable.",
	};
}

export function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
