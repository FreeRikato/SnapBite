import { del, get, set } from "idb-keyval";

const CAPTURE_PHOTO_PREFIX = "snapbite-capture-photo:";
const MEAL_PHOTO_PREFIX = "snapbite-meal-photo:";

const objectUrls = new Map<string, string>();

function getCapturePhotoKey(blobKey: string) {
	return `${CAPTURE_PHOTO_PREFIX}${blobKey}`;
}

function getMealPhotoKey(r2Key: string) {
	return `${MEAL_PHOTO_PREFIX}${r2Key}`;
}

function readBlobAsDataUrl(blob: Blob) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
			} else {
				reject(new Error("Unable to read image preview"));
			}
		});
		reader.addEventListener("error", () => {
			reject(reader.error ?? new Error("Unable to read image preview"));
		});
		reader.readAsDataURL(blob);
	});
}

export async function createPreviewUrl(key: string, blob: Blob) {
	if (objectUrls.has(key)) {
		return objectUrls.get(key) as string;
	}

	if (typeof URL.createObjectURL === "function") {
		const objectUrl = URL.createObjectURL(blob);
		objectUrls.set(key, objectUrl);
		return objectUrl;
	}

	return readBlobAsDataUrl(blob);
}

export function revokePreviewUrl(key: string) {
	const objectUrl = objectUrls.get(key);
	if (objectUrl && typeof URL.revokeObjectURL === "function") {
		URL.revokeObjectURL(objectUrl);
	}
	objectUrls.delete(key);
}

export async function saveCapturePhotoBlob(blobKey: string, blob: Blob) {
	await set(getCapturePhotoKey(blobKey), blob);
}

export async function getCapturePhotoBlob(blobKey: string) {
	return ((await get(getCapturePhotoKey(blobKey))) as Blob | undefined) ?? null;
}

export async function deleteCapturePhotoBlob(blobKey: string) {
	await del(getCapturePhotoKey(blobKey));
}

export async function cacheMealPhotoBlob(r2Key: string, blob: Blob) {
	await set(getMealPhotoKey(r2Key), blob);
	await createPreviewUrl(r2Key, blob);
}

export async function getMealPhotoBlob(r2Key: string) {
	return ((await get(getMealPhotoKey(r2Key))) as Blob | undefined) ?? null;
}

export function getCachedMealPhotoObjectUrl(r2Key: string) {
	return objectUrls.get(r2Key) ?? null;
}

export async function hydrateMealPhotoObjectUrl(r2Key: string) {
	const cached = getCachedMealPhotoObjectUrl(r2Key);
	if (cached) return cached;

	const blob = await getMealPhotoBlob(r2Key);
	if (!blob) return null;

	return createPreviewUrl(r2Key, blob);
}
