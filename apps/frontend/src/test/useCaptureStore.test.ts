import { clear, get } from "idb-keyval";
import { beforeEach, describe, expect, it } from "vitest";

import { useCaptureStore } from "@/store";

const emptyCaptureState = {
	photos: [],
	note: "",
};

async function resetStore() {
	await clear();
	useCaptureStore.setState(emptyCaptureState);
}

// Persisted writes go through async IndexedDB storage; let the microtask flush.
function flushPersist() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("useCaptureStore", () => {
	beforeEach(async () => {
		await resetStore();
	});

	it("starts with an empty capture state", () => {
		expect(useCaptureStore.getState()).toMatchObject(emptyCaptureState);
	});

	it("stores photos and note", () => {
		const photo = {
			id: "photo-1",
			blobKey: "capture-photo-1",
			previewObjectUrl: "blob:photo-1",
			width: 640,
			height: 480,
			size: 123,
			mimeType: "image/jpeg",
		};

		useCaptureStore.getState().addPhotos([photo]);
		useCaptureStore.getState().setNote("extra sauce");

		expect(useCaptureStore.getState()).toMatchObject({
			photos: [photo],
			note: "extra sauce",
		});
	});

	it("persists capture state under the expected storage key", async () => {
		const photo = {
			id: "photo-1",
			blobKey: "capture-photo-1",
			previewObjectUrl: "blob:photo-1",
			width: 640,
			height: 480,
			size: 123,
			mimeType: "image/jpeg",
		};

		useCaptureStore.getState().addPhotos([photo]);
		useCaptureStore.getState().setNote("extra sauce");

		await flushPersist();

		const persistedValue = await get<string>("snapbite-capture");

		expect(persistedValue).not.toBeUndefined();
		expect(JSON.parse(persistedValue ?? "{}")).toMatchObject({
			state: {
				photos: [{ ...photo, previewObjectUrl: "" }],
			},
		});
	});

	it("clears photos and note", async () => {
		useCaptureStore.getState().addPhotos([
			{
				id: "photo-1",
				blobKey: "capture-photo-1",
				previewObjectUrl: "blob:photo-1",
				width: 640,
				height: 480,
				size: 123,
				mimeType: "image/jpeg",
			},
		]);
		useCaptureStore.getState().setNote("extra sauce");

		await useCaptureStore.getState().clearPhotos();

		expect(useCaptureStore.getState()).toMatchObject(emptyCaptureState);
	});
});
