import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BMIResultsCard } from "@/components/BMIResultsCard";

const calorieModeInfo = {
	description:
		"Your target is below estimated maintenance calories to support weight loss.",
	label: "Deficit",
};

function renderBMIResultsCard(
	overrides: Partial<Parameters<typeof BMIResultsCard>[0]> = {},
) {
	const props = {
		bmi: 24.691,
		bmiInfo: { color: "text-emerald-300", label: "Healthy" },
		calorieModeInfo,
		dailyCalories: 1992,
		isCalorieModeTooltipOpen: false,
		onCalorieModeTooltipOpenChange: vi.fn(),
		...overrides,
	};

	const view = render(<BMIResultsCard {...props} />);

	return { props, ...view };
}

describe("BMIResultsCard", () => {
	it("renders BMI rounded to one decimal place", () => {
		renderBMIResultsCard();

		expect(screen.getByText("24.7")).toBeInTheDocument();
		expect(screen.getByText("Healthy")).toHaveClass("text-emerald-300");
	});

	it("renders a placeholder when BMI is null", () => {
		renderBMIResultsCard({ bmi: null, bmiInfo: null });

		expect(screen.getByText("--")).toBeInTheDocument();
		expect(screen.queryByText("Healthy")).not.toBeInTheDocument();
	});

	it("renders the daily calorie target with locale formatting", () => {
		renderBMIResultsCard({ dailyCalories: 12345 });

		expect(screen.getByText("12,345 kcal")).toBeInTheDocument();
	});

	it("does not render daily calories when the target is unavailable", () => {
		renderBMIResultsCard({ dailyCalories: null });

		expect(screen.queryByText(/kcal/i)).not.toBeInTheDocument();
	});

	it("opens and closes the calorie mode tooltip from pointer and keyboard events", async () => {
		const user = userEvent.setup();
		const { props, rerender } = renderBMIResultsCard();
		const modeButton = screen.getByRole("button", { name: "Deficit" });

		await user.hover(modeButton);

		expect(props.onCalorieModeTooltipOpenChange).toHaveBeenCalledWith(true);

		rerender(
			<BMIResultsCard
				{...props}
				isCalorieModeTooltipOpen
				onCalorieModeTooltipOpenChange={props.onCalorieModeTooltipOpenChange}
			/>,
		);

		expect(screen.getByRole("tooltip")).toHaveTextContent(
			calorieModeInfo.description,
		);

		await user.unhover(screen.getByRole("button", { name: "Deficit" }));

		expect(props.onCalorieModeTooltipOpenChange).toHaveBeenCalledWith(false);

		await user.click(screen.getByRole("button", { name: "Deficit" }));
		await user.keyboard("{Escape}");

		expect(props.onCalorieModeTooltipOpenChange).toHaveBeenLastCalledWith(
			false,
		);
	});
});
