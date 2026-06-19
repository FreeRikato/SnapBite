import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PhotoPreviewPage from "@/screens/PhotoPreview.Page";
import type { CapturedPhoto } from "@/store";
import { useCaptureStore } from "@/store";

const mocks = vi.hoisted(() => ({
	startMealPhotoUploadSession: vi.fn(),
}));

vi.mock("@/lib/mealPhotoUploadSession", () => ({
	startMealPhotoUploadSession: mocks.startMealPhotoUploadSession,
}));

const emptyCaptureState = {
	photos: [],
	note: "",
};

function createTestPhoto(id: string): CapturedPhoto {
	return {
		id,
		blobKey: `capture-${id}`,
		previewObjectUrl: `blob:${id}`,
		width: 640,
		height: 480,
		size: 3,
		mimeType: "image/webp",
	};
}

function renderPhotoPreviewPage() {
	render(
		<MemoryRouter initialEntries={["/preview"]}>
			<Routes>
				<Route path="/clarify-loading" element={<div>Question skeleton</div>} />
				<Route path="/preview" element={<PhotoPreviewPage />} />
			</Routes>
		</MemoryRouter>,
	);
}

describe("PhotoPreviewPage", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		mocks.startMealPhotoUploadSession.mockReset();
		mocks.startMealPhotoUploadSession.mockReturnValue({
			id: "upload-session-1",
			photoSignature: "photo-1",
			photos: [],
			promise: new Promise(() => undefined),
			getProgress: () => 0,
			subscribeProgress: () => () => undefined,
		});
		useCaptureStore.setState({
			...emptyCaptureState,
			photos: [createTestPhoto("photo-1")],
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		useCaptureStore.setState(emptyCaptureState);
	});

	it("navigates to the question skeleton before starting the background upload", () => {
		renderPhotoPreviewPage();

		fireEvent.click(screen.getByRole("button", { name: "Submit 1 photo" }));

		expect(screen.getByText("Question skeleton")).toBeInTheDocument();
		expect(mocks.startMealPhotoUploadSession).not.toHaveBeenCalled();

		act(() => {
			vi.runOnlyPendingTimers();
		});

		expect(mocks.startMealPhotoUploadSession).toHaveBeenCalledWith([
			expect.objectContaining({ id: "photo-1" }),
		]);
	});
});
