import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

import BMIPage from "@/screens/BMI.Page";
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

function renderBMIPage(
	initialEntry:
		| string
		| { pathname: string; search?: string; state?: unknown } = "/bmi-calculate",
) {
	render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<Routes>
				<Route path="/" element={<div>Home</div>} />
				<Route path="/bmi-calculate" element={<BMIPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

async function enterBaseMeasurements() {
	const user = userEvent.setup();

	await user.type(screen.getByRole("spinbutton", { name: /height/i }), "180");
	await user.type(screen.getByRole("spinbutton", { name: /weight/i }), "80");

	return user;
}

describe("BMIPage", () => {
	beforeEach(() => {
		resetStore();
	});

	it("keeps submit disabled until all fields are filled", async () => {
		renderBMIPage();

		const user = await enterBaseMeasurements();

		expect(
			screen.getByRole("button", { name: /fill in all fields/i }),
		).toBeDisabled();

		await user.type(screen.getByRole("spinbutton", { name: /age/i }), "30");
		await user.click(screen.getByRole("button", { name: "Male" }));
		await user.click(screen.getByRole("button", { name: /lean/i }));

		expect(
			screen.getByRole("button", { name: /continue with my plan/i }),
		).toBeEnabled();
	});

	it("shows the BMI result after height and weight are entered", async () => {
		renderBMIPage();

		await enterBaseMeasurements();

		expect(screen.getByText("24.7")).toBeInTheDocument();
		expect(screen.getByText("Healthy")).toBeInTheDocument();
	});

	it("shows calories after age and gender are available", async () => {
		const user = userEvent.setup();

		renderBMIPage();

		await enterBaseMeasurements();

		expect(screen.queryByText(/kcal/i)).not.toBeInTheDocument();

		await user.type(screen.getByRole("spinbutton", { name: /age/i }), "30");
		await user.click(screen.getByRole("button", { name: "Male" }));

		expect(screen.getByText("2,492 kcal")).toBeInTheDocument();
	});

	it("adjusts calorie targets by selected goal", async () => {
		const user = userEvent.setup();

		renderBMIPage();

		await enterBaseMeasurements();
		await user.type(screen.getByRole("spinbutton", { name: /age/i }), "30");
		await user.click(screen.getByRole("button", { name: "Male" }));

		expect(screen.getByText("2,492 kcal")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /lean/i }));
		expect(screen.getByText("1,992 kcal")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /gain/i }));
		expect(screen.getByText("2,992 kcal")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /maintain/i }));
		expect(screen.getByText("2,492 kcal")).toBeInTheDocument();
	});

	it("shows the back button for edit mode query params", () => {
		renderBMIPage("/bmi-calculate?mode=edit");

		expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
	});

	it("shows the back button for route state", () => {
		renderBMIPage({
			pathname: "/bmi-calculate",
			state: { showBackButton: true },
		});

		expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
	});
});
