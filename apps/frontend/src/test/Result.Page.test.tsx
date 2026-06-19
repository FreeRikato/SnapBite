import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { clear, set } from "idb-keyval";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	resetMealPhotoUploadSessionForTests,
	startMealPhotoUploadSession,
} from "@/lib/mealPhotoUploadSession";
import ResultPage from "@/screens/Result.Page";
import type { CapturedPhoto } from "@/store";
import { useAnalysisStore, useCaptureStore, useHomeStore } from "@/store";

const mocks = vi.hoisted(() => ({
	createMeal: vi.fn(),
	uploadMealPhoto: vi.fn(),
}));

vi.mock("convex/react", () => ({
	useMutation: () => mocks.createMeal,
}));

vi.mock("@/lib/mealPhotoUpload", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/mealPhotoUpload")>();

	return {
		...actual,
		uploadMealPhoto: mocks.uploadMealPhoto,
	};
});

const emptyCaptureState = {
	photos: [],
	note: "",
};

function createTestPhoto(
	id: string,
	previewObjectUrl: string,
	mimeType = "image/webp",
) {
	return {
		id,
		blobKey: `capture-${id}`,
		previewObjectUrl,
		width: 640,
		height: 480,
		size: 3,
		mimeType,
	};
}

async function seedTestPhotoBlob(id: string, mimeType = "image/webp") {
	await set(
		`snapbite-capture-photo:capture-${id}`,
		new Blob(["one"], { type: mimeType }),
	);
}

async function resetStores() {
	await clear();
	localStorage.clear();
	resetMealPhotoUploadSessionForTests();
	useCaptureStore.setState(emptyCaptureState);
	useAnalysisStore.getState().resetAnalysis();
	useHomeStore.setState({
		selectedDate: "2026-06-17",
		streak: 0,
	});
	mocks.createMeal.mockReset();
	mocks.createMeal.mockResolvedValue("meal-1");
	mocks.uploadMealPhoto.mockReset();
	mocks.uploadMealPhoto.mockResolvedValue({
		key: "users/demo-user/meals/2026-06-17/photo.webp",
		size: 3,
		etag: '"etag"',
		httpEtag: '"etag"',
	});
}

function startPreviewUploadSession(photos: CapturedPhoto[]) {
	const uploadSession = startMealPhotoUploadSession(photos);
	void uploadSession.promise.catch(() => undefined);
	return uploadSession;
}

function renderResultPage() {
	render(
		<MemoryRouter initialEntries={["/result"]}>
			<Routes>
				<Route path="/" element={<div>Home</div>} />
				<Route path="/result" element={<ResultPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("ResultPage", () => {
	beforeEach(async () => {
		await resetStores();
	});

	afterEach(() => {
		vi.useRealTimers();
		resetMealPhotoUploadSessionForTests();
	});

	it("lets users move through all analyzed photos", async () => {
		const user = userEvent.setup();
		const photos = [
			createTestPhoto("photo-1", "blob:one", "image/jpeg"),
			createTestPhoto("photo-2", "blob:two", "image/jpeg"),
			createTestPhoto("photo-3", "blob:three", "image/jpeg"),
		];
		useCaptureStore.setState({ photos, note: "" });

		renderResultPage();

		expect(screen.getByRole("img", { name: /photo 1 of 3/i })).toHaveAttribute(
			"src",
			photos[0].previewObjectUrl,
		);
		expect(screen.getByText("1 / 3")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /next photo/i }));

		expect(screen.getByRole("img", { name: /photo 2 of 3/i })).toHaveAttribute(
			"src",
			photos[1].previewObjectUrl,
		);
		expect(screen.getByText("2 / 3")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /previous photo/i }));

		expect(screen.getByRole("img", { name: /photo 1 of 3/i })).toHaveAttribute(
			"src",
			photos[0].previewObjectUrl,
		);
		expect(screen.getByText("1 / 3")).toBeInTheDocument();
	});

	it("hides carousel controls when only one photo is available", () => {
		useCaptureStore.setState({
			photos: [createTestPhoto("photo-1", "blob:one", "image/jpeg")],
			note: "",
		});

		renderResultPage();

		expect(screen.queryByRole("button", { name: /next photo/i })).toBeNull();
		expect(
			screen.queryByRole("button", { name: /previous photo/i }),
		).toBeNull();
	});

	it("defaults meal date and time to the current moment and allows edits", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-06-17T07:45:00"));

		renderResultPage();

		const mealDate = screen.getByLabelText(/meal date/i);
		const mealTime = screen.getByLabelText(/meal time/i);

		expect(mealDate).toHaveValue("2026-06-17");
		expect(mealTime).toHaveValue("07:45");

		fireEvent.change(mealDate, { target: { value: "2026-06-18" } });
		fireEvent.change(mealTime, { target: { value: "19:30" } });

		expect(mealDate).toHaveValue("2026-06-18");
		expect(mealTime).toHaveValue("19:30");
	});

	it("allows users to edit predicted calories from a modal", async () => {
		const user = userEvent.setup();

		renderResultPage();

		expect(screen.getByText("621")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /edit calories/i }));

		const dialog = screen.getByRole("dialog", { name: /edit calories/i });
		const calories = within(dialog).getByRole("spinbutton", {
			name: /calories/i,
		});

		expect(calories).toHaveValue(621);
		expect(calories).toHaveFocus();

		fireEvent.change(calories, { target: { value: "700" } });
		await user.click(screen.getByRole("button", { name: /save/i }));

		expect(screen.getByText("700")).toBeInTheDocument();
	});

	it("defaults empty calorie edits to zero", async () => {
		const user = userEvent.setup();

		renderResultPage();

		await user.click(screen.getByRole("button", { name: /edit calories/i }));

		const dialog = screen.getByRole("dialog", { name: /edit calories/i });
		const calories = within(dialog).getByRole("spinbutton", {
			name: /calories/i,
		});

		fireEvent.change(calories, { target: { value: "" } });
		await user.click(screen.getByRole("button", { name: /save/i }));

		expect(screen.getByText("0")).toBeInTheDocument();
	});

	it("creates a saved Convex meal from the preview-started upload when users finish the result", async () => {
		const user = userEvent.setup();
		await seedTestPhotoBlob("photo-1");
		const photos = [createTestPhoto("photo-1", "blob:one")];
		useCaptureStore.setState({
			photos,
			note: "",
		});
		startPreviewUploadSession(photos);

		renderResultPage();

		await user.click(screen.getByRole("button", { name: "Done" }));

		expect(screen.getByText("Home")).toBeInTheDocument();
		await waitFor(() => expect(mocks.uploadMealPhoto).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(mocks.createMeal).toHaveBeenCalledWith({
				status: "saved",
				photos: [
					{
						key: "users/demo-user/meals/2026-06-17/photo.webp",
						contentType: "image/webp",
						size: 3,
						width: 640,
						height: 480,
						etag: '"etag"',
					},
				],
				name: "Grilled salmon",
				kcal: 621,
				uploadedAt: expect.any(String),
				foodItems: expect.any(Array),
			}),
		);
	});

	it("creates a draft Convex meal from the preview-started upload when users back out of the result", async () => {
		const user = userEvent.setup();
		await seedTestPhotoBlob("photo-1");
		const photos = [createTestPhoto("photo-1", "blob:one")];
		useCaptureStore.setState({
			photos,
			note: "",
		});
		startPreviewUploadSession(photos);

		renderResultPage();

		await user.click(screen.getByRole("button", { name: /back to home/i }));

		expect(screen.getByText("Home")).toBeInTheDocument();
		await waitFor(() => expect(mocks.uploadMealPhoto).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(mocks.createMeal).toHaveBeenCalledWith(
				expect.objectContaining({
					status: "draft",
					kcal: 621,
				}),
			),
		);
	});

	it("does not start an upload from result actions when the preview upload session is missing", async () => {
		const user = userEvent.setup();
		useCaptureStore.setState({
			photos: [createTestPhoto("photo-1", "blob:one")],
			note: "",
		});

		renderResultPage();

		await user.click(screen.getByRole("button", { name: /back to home/i }));

		expect(mocks.uploadMealPhoto).not.toHaveBeenCalled();
		expect(mocks.createMeal).not.toHaveBeenCalled();
		expect(
			screen.getByText("Photo upload was not started. Please submit again."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /back to home/i }),
		).toBeInTheDocument();
	});

	it("does not block result navigation when the preview-started upload fails", async () => {
		const user = userEvent.setup();
		mocks.uploadMealPhoto.mockRejectedValue(new Error("Upload failed"));
		await seedTestPhotoBlob("photo-1");
		const photos = [createTestPhoto("photo-1", "blob:one")];
		useCaptureStore.setState({
			photos,
			note: "",
		});
		startPreviewUploadSession(photos);

		renderResultPage();

		await user.click(screen.getByRole("button", { name: "Done" }));

		expect(screen.getByText("Home")).toBeInTheDocument();
		await waitFor(() => {
			expect(useHomeStore.getState().pendingMeals[0]?.error).toBe(
				"Upload failed",
			);
		});
		expect(mocks.createMeal).not.toHaveBeenCalled();
	});
});
