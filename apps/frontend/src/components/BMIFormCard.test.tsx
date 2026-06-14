import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BMIFormCard } from "@/components/BMIFormCard";

function renderBMIFormCard() {
	const props = {
		age: "30",
		gender: "male" as const,
		goal: "lean" as const,
		height: "180",
		onAgeChange: vi.fn(),
		onGenderChange: vi.fn(),
		onGoalChange: vi.fn(),
		onHeightChange: vi.fn(),
		onWeightChange: vi.fn(),
		weight: "80",
	};

	render(<BMIFormCard {...props} />);

	return props;
}

describe("BMIFormCard", () => {
	it("calls field change handlers with numeric input values", () => {
		const props = renderBMIFormCard();

		fireEvent.change(screen.getByRole("spinbutton", { name: /height/i }), {
			target: { value: "181" },
		});
		fireEvent.change(screen.getByRole("spinbutton", { name: /weight/i }), {
			target: { value: "81" },
		});
		fireEvent.change(screen.getByRole("spinbutton", { name: /age/i }), {
			target: { value: "31" },
		});

		expect(props.onHeightChange).toHaveBeenCalledWith("181");
		expect(props.onWeightChange).toHaveBeenCalledWith("81");
		expect(props.onAgeChange).toHaveBeenCalledWith("31");
	});

	it("calls gender and goal handlers when options are selected", async () => {
		const user = userEvent.setup();
		const props = renderBMIFormCard();

		await user.click(screen.getByRole("button", { name: "Female" }));
		await user.click(screen.getByRole("button", { name: /gain/i }));

		expect(props.onGenderChange).toHaveBeenCalledWith("female");
		expect(props.onGoalChange).toHaveBeenCalledWith("gain");
	});

	it("marks the selected gender and goal options", () => {
		renderBMIFormCard();

		expect(screen.getByRole("button", { name: "Male" })).toHaveClass(
			"bg-white",
		);
		expect(screen.getByRole("button", { name: /lean/i })).toHaveClass(
			"border-white",
			"bg-white",
		);
	});
});
