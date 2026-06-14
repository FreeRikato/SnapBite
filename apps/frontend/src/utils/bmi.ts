import type { BmiCategory, CalorieModeInfo, Goal } from "@/types/bmi";

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
