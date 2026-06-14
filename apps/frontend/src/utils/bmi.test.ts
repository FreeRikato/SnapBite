import { describe, expect, it } from "vitest";

import { capitalize, getBmiCategory, getCalorieModeInfo } from "@/utils/bmi";

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
