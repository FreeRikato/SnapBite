import { beforeEach, describe, expect, it } from "vitest";

import { useBMIStore } from "@/store";

const emptyBMIState = {
	age: "",
	gender: null,
	goal: null,
	height: "",
	weight: "",
};

function resetStore() {
	localStorage.clear();
	useBMIStore.setState(emptyBMIState);
}

describe("useBMIStore", () => {
	beforeEach(() => {
		resetStore();
	});

	it("starts with an empty BMI state", () => {
		expect(useBMIStore.getState()).toMatchObject(emptyBMIState);
	});

	it("updates each BMI field", () => {
		const store = useBMIStore.getState();

		store.setHeight("180");
		store.setWeight("82");
		store.setAge("32");
		store.setGender("male");
		store.setGoal("gain");

		expect(useBMIStore.getState()).toMatchObject({
			age: "32",
			gender: "male",
			goal: "gain",
			height: "180",
			weight: "82",
		});
	});

	it("resets BMI fields back to their initial values", () => {
		useBMIStore.getState().setHeight("165");
		useBMIStore.getState().setWeight("60");
		useBMIStore.getState().setAge("28");
		useBMIStore.getState().setGender("female");
		useBMIStore.getState().setGoal("lean");

		useBMIStore.getState().resetBMI();

		expect(useBMIStore.getState()).toMatchObject(emptyBMIState);
	});

	it("persists BMI state under the expected storage key", () => {
		useBMIStore.getState().setHeight("175");

		const persistedValue = localStorage.getItem("snapbite-bmi");

		expect(persistedValue).not.toBeNull();
		expect(JSON.parse(persistedValue ?? "{}")).toMatchObject({
			state: {
				height: "175",
			},
		});
	});
});
