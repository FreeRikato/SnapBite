import { describe, expect, it } from "vitest";

import {
	capitalize,
	computeDailyCalories,
	getBmiCategory,
	getCalorieModeInfo,
} from "@/utils/bmi";

describe("getBmiCategory", () => {
	it.each([
		{ bmi: 18.4, label: "Underweight", color: "text-sky-300" },
		{ bmi: 18.5, label: "Healthy", color: "text-emerald-300" },
		{ bmi: 24.9, label: "Healthy", color: "text-emerald-300" },
		{ bmi: 25, label: "Overweight", color: "text-amber-300" },
		{ bmi: 29.9, label: "Overweight", color: "text-amber-300" },
		{ bmi: 30, label: "Obese", color: "text-rose-300" },
	])("returns $label for BMI $bmi", ({ bmi, color, label }) => {
		expect(getBmiCategory(bmi)).toEqual({ color, label });
	});
});

describe("getCalorieModeInfo", () => {
	it("returns deficit copy for lean goals", () => {
		expect(getCalorieModeInfo("lean")).toMatchObject({
			label: "Deficit",
			description: expect.stringContaining("below estimated maintenance"),
		});
	});

	it("returns surplus copy for gain goals", () => {
		expect(getCalorieModeInfo("gain")).toMatchObject({
			label: "Surplus",
			description: expect.stringContaining("above estimated maintenance"),
		});
	});

	it.each([
		"maintain",
		null,
	] as const)("returns maintenance copy for %s", (goal) => {
		expect(getCalorieModeInfo(goal)).toMatchObject({
			label: "Maintenance",
			description: expect.stringContaining("keep weight stable"),
		});
	});
});

describe("capitalize", () => {
	it("uppercases the first character and keeps the rest unchanged", () => {
		expect(capitalize("lean")).toBe("Lean");
		expect(capitalize("mALE")).toBe("MALE");
	});

	it("returns an empty string unchanged", () => {
		expect(capitalize("")).toBe("");
	});
});

describe("computeDailyCalories", () => {
	// Sample profile: 175cm, 70kg, 25yrs, male, maintain
	// bmr = 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
	// tdee = 1673.75 * 1.4 = 2343.25 -> 2343
	const base = { height: 175, weight: 70, age: 25, gender: "male" as const };

	it("returns maintenance kcal rounded for the maintain goal", () => {
		expect(computeDailyCalories({ ...base, goal: "maintain" })).toBe(
			Math.round(1673.75 * 1.4),
		);
	});

	it("subtracts 500 kcal for a lean goal", () => {
		const maintain = computeDailyCalories({ ...base, goal: "maintain" });
		expect(computeDailyCalories({ ...base, goal: "lean" })).toBe(
			(maintain ?? 0) - 500,
		);
	});

	it("adds 500 kcal for a gain goal", () => {
		const maintain = computeDailyCalories({ ...base, goal: "maintain" });
		expect(computeDailyCalories({ ...base, goal: "gain" })).toBe(
			(maintain ?? 0) + 500,
		);
	});

	it("returns null when required inputs are missing or invalid", () => {
		expect(
			computeDailyCalories({ ...base, height: 0, goal: "maintain" }),
		).toBeNull();
		expect(
			computeDailyCalories({ ...base, weight: 0, goal: "maintain" }),
		).toBeNull();
		expect(
			computeDailyCalories({ ...base, age: 0, goal: "maintain" }),
		).toBeNull();
	});
});
