import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MealPreviewPage from "@/screens/MealPreview.Page";

const mocks = vi.hoisted(() => ({
	deleteMealPhotos: vi.fn(),
	removeMeal: vi.fn(),
	useQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useMutation: () => mocks.removeMeal,
	useQuery: () => mocks.useQuery(),
}));

vi.mock("@/lib/mealPhotoUpload", () => ({
	deleteMealPhotos: mocks.deleteMealPhotos,
	getMealPhotoUrl: (key: string) => `https://r2.test/${key}`,
}));

const mealRecord = {
	_id: "meal-1",
	_creationTime: 1,
	userKey: "demo-user",
	status: "saved",
	thumbnailKey:
		"users/demo-user/meals/2026-06-17/11111111-1111-4111-8111-111111111111.webp",
	photos: [
		{
			key: "users/demo-user/meals/2026-06-17/11111111-1111-4111-8111-111111111111.webp",
			contentType: "image/webp",
			size: 1200,
			width: null,
			height: null,
			etag: '"etag-1"',
		},
		{
			key: "users/demo-user/meals/2026-06-17/22222222-2222-4222-8222-222222222222.jpg",
			contentType: "image/jpeg",
			size: 1300,
			width: null,
			height: null,
			etag: '"etag-2"',
		},
	],
	name: "Protein bowl",
	kcal: 510,
	protein: 0,
	carbs: 0,
	fat: 0,
	uploadedAt: "2026-06-17T12:30:00.000Z",
	foodItems: [
		{
			id: "item-1",
			emoji: "PB",
			name: "Protein bowl",
			quantity: 1,
			unit: "Plates",
		},
	],
};

function renderMealPreviewPage() {
	render(
		<MemoryRouter initialEntries={["/meals/meal-1"]}>
			<Routes>
				<Route path="/" element={<div>Home</div>} />
				<Route path="/meals/:mealId" element={<MealPreviewPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("MealPreviewPage", () => {
	beforeEach(() => {
		mocks.deleteMealPhotos.mockReset();
		mocks.deleteMealPhotos.mockResolvedValue(undefined);
		mocks.removeMeal.mockReset();
		mocks.removeMeal.mockResolvedValue({
			deleted: true,
			photoKeys: mealRecord.photos.map((photo) => photo.key),
		});
		mocks.useQuery.mockReset();
		mocks.useQuery.mockReturnValue(mealRecord);
		vi.spyOn(window, "confirm").mockReturnValue(true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("deletes the meal photos from R2 and removes the Convex meal", async () => {
		const user = userEvent.setup();

		renderMealPreviewPage();

		await user.click(screen.getByRole("button", { name: /delete meal/i }));

		expect(window.confirm).toHaveBeenCalledWith(
			"Delete this meal from recently uploaded?",
		);
		expect(mocks.deleteMealPhotos).toHaveBeenCalledWith({
			keys: mealRecord.photos.map((photo) => photo.key),
			debugId: "delete-meal-meal-1",
		});
		expect(mocks.removeMeal).toHaveBeenCalledWith({ id: "meal-1" });
		expect(screen.getByText("Home")).toBeInTheDocument();
	});
});
