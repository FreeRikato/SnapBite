import { del, get, set } from "idb-keyval";
import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";

import {
	createPreviewUrl,
	deleteCapturePhotoBlob,
	getCapturePhotoBlob,
	revokePreviewUrl,
} from "@/lib/photoBlobStore";

const indexedDbStorage: StateStorage = {
	getItem: async (name) => (await get(name)) ?? null,
	setItem: async (name, value) => {
		await set(name, value);
	},
	removeItem: async (name) => {
		await del(name);
	},
};

export type CapturedPhoto = {
	id: string;
	blobKey: string;
	previewObjectUrl: string;
	width: number;
	height: number;
	size: number;
	mimeType: string;
};

type CaptureState = {
	photos: CapturedPhoto[];
	note: string;
	setPhotos: (photos: CapturedPhoto[]) => void;
	addPhotos: (photos: CapturedPhoto[]) => void;
	removePhoto: (id: string) => Promise<void>;
	setNote: (note: string) => void;
	clearPhotos: () => Promise<void>;
	hydratePhotoPreviews: () => Promise<void>;
};

const initialCaptureState = {
	photos: [],
	note: "",
};

export const useCaptureStore = create<CaptureState>()(
	persist(
		(set) => ({
			...initialCaptureState,
			setPhotos: (photos) => set({ photos }),
			addPhotos: (photos) =>
				set((state) => {
					const existingIds = new Set(state.photos.map((photo) => photo.id));
					const next = photos.filter((photo) => !existingIds.has(photo.id));
					return { photos: [...state.photos, ...next] };
				}),
			removePhoto: async (id) => {
				const photo = useCaptureStore
					.getState()
					.photos.find((current) => current.id === id);

				if (photo) {
					revokePreviewUrl(photo.blobKey);
					await deleteCapturePhotoBlob(photo.blobKey);
				}

				set((state) => ({
					photos: state.photos.filter((current) => current.id !== id),
				}));
			},
			setNote: (note) => set({ note }),
			clearPhotos: async () => {
				const photos = useCaptureStore.getState().photos;
				await Promise.all(
					photos.map((photo) => {
						revokePreviewUrl(photo.blobKey);
						return deleteCapturePhotoBlob(photo.blobKey);
					}),
				);
				set(initialCaptureState);
			},
			hydratePhotoPreviews: async () => {
				const photos = useCaptureStore.getState().photos;
				const hydrated = await Promise.all(
					photos.map(async (photo) => {
						const blob = await getCapturePhotoBlob(photo.blobKey);
						if (!blob) return null;
						return {
							...photo,
							previewObjectUrl: await createPreviewUrl(photo.blobKey, blob),
						};
					}),
				);

				set({
					photos: hydrated.filter((photo): photo is CapturedPhoto => !!photo),
				});
			},
		}),
		{
			name: "snapbite-capture",
			storage: createJSONStorage(() => indexedDbStorage),
			partialize: (state) => ({
				photos: state.photos.map(
					({ previewObjectUrl: _previewObjectUrl, ...photo }) => ({
						...photo,
						previewObjectUrl: "",
					}),
				),
			}),
			onRehydrateStorage: () => (state) => {
				void state?.hydratePhotoPreviews();
			},
		},
	),
);
