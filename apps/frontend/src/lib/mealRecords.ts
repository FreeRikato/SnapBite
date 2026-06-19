import type { Doc } from "@repo/convex/convex/_generated/dataModel";

import analyzedFallback from "@/assets/examples/analyzed.png";
import {
	getCachedMealPhotoObjectUrl,
	getCapturePhotoBlob,
	hydrateMealPhotoObjectUrl,
} from "@/lib/photoBlobStore";
import { getMealPhotoUrl } from "@/lib/mealPhotoUpload";
import type { CapturedPhoto, Meal } from "@/store";

export type MealPhotoRecord = {
	key: string;
	contentType: string;
	size: number;
	width: number | null;
	height: number | null;
	etag: string | null;
};

function getBestMealPhotoUrl(key: string) {
	return getCachedMealPhotoObjectUrl(key) ?? getMealPhotoUrl(key);
}

function logPreview(debugId: string | undefined, message: string, data = {}) {
	console.info("[SnapBite preview]", message, { debugId, ...data });
}

export function mealRecordToMeal(record: Doc<"meals">): Meal {
	const photoKeys = record.photos.map((photo) => photo.key);
	const photos = photoKeys.map(getBestMealPhotoUrl);
	const thumbnail = record.thumbnailKey
		? getBestMealPhotoUrl(record.thumbnailKey)
		: (photos[0] ?? analyzedFallback);

	return {
		id: record._id,
		thumbnail,
		photos: photos.length > 0 ? photos : [thumbnail],
		thumbnailKey: record.thumbnailKey,
		photoKeys,
		name: record.name,
		status: record.status,
		kcal: record.kcal,
		protein: record.protein,
		carbs: record.carbs,
		fat: record.fat,
		uploadedAt: record.uploadedAt,
		foodItems: record.foodItems,
	};
}

export async function hydrateMealLocalPhotoUrls(meals: Meal[]) {
	const hydratedMeals = await Promise.all(
		meals.map(async (meal) => {
			const photoKeys = meal.photoKeys ?? [];
			if (photoKeys.length === 0 && !meal.thumbnailKey) return meal;

			const photoUrls = await Promise.all(
				photoKeys.map(async (key, index) => {
					return (await hydrateMealPhotoObjectUrl(key)) ?? meal.photos[index];
				}),
			);
			const thumbnail =
				meal.thumbnailKey &&
				((await hydrateMealPhotoObjectUrl(meal.thumbnailKey)) ?? null);

			return {
				...meal,
				photos: photoUrls.length ? photoUrls : meal.photos,
				thumbnail: thumbnail ?? meal.thumbnail,
			};
		}),
	);

	return hydratedMeals;
}

function parseDataUrl(dataUrl: string) {
	const separatorIndex = dataUrl.indexOf(",");

	if (!dataUrl.startsWith("data:") || separatorIndex === -1) {
		throw new Error("Invalid preview image");
	}

	const header = dataUrl.slice(0, separatorIndex);
	const content = dataUrl.slice(separatorIndex + 1);
	const contentType = header.match(/^data:([^;]+)/)?.[1] ?? "image/webp";
	const isBase64 = header.includes(";base64");

	if (isBase64) {
		const binary = atob(content);
		const bytes = new Uint8Array(binary.length);

		for (let index = 0; index < binary.length; index += 1) {
			bytes[index] = binary.charCodeAt(index);
		}

		return { blob: new Blob([bytes], { type: contentType }), contentType };
	}

	const decoded = decodeURIComponent(content);
	return { blob: new Blob([decoded], { type: contentType }), contentType };
}

export async function previewUrlToFile(
	photo: CapturedPhoto,
	index: number,
	debugId?: string,
): Promise<File> {
	const storedBlob = await getCapturePhotoBlob(photo.blobKey);
	if (storedBlob) {
		const extension = photo.mimeType === "image/jpeg" ? "jpg" : "webp";
		const file = new File(
			[storedBlob],
			`meal-preview-${index + 1}.${extension}`,
			{
				type: photo.mimeType,
				lastModified: Date.now(),
			},
		);

		logPreview(debugId, "created File from capture blob", {
			index,
			contentType: photo.mimeType,
			size: file.size,
			name: file.name,
		});

		return file;
	}

	const url = photo.previewObjectUrl;
	if (url.startsWith("data:")) {
		logPreview(debugId, "converting data URL to File", {
			index,
			urlLength: url.length,
		});
		const { blob, contentType } = parseDataUrl(url);
		const extension = contentType === "image/jpeg" ? "jpg" : "webp";

		const file = new File([blob], `meal-preview-${index + 1}.${extension}`, {
			type: contentType,
			lastModified: Date.now(),
		});

		logPreview(debugId, "created File from data URL", {
			index,
			contentType,
			size: file.size,
			name: file.name,
		});

		return file;
	}

	logPreview(debugId, "fetching preview URL", { index, url });
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Unable to read preview image ${index + 1}`);
	}

	const blob = await response.blob();
	const contentType = blob.type || "image/webp";
	const extension = contentType === "image/jpeg" ? "jpg" : "webp";

	const file = new File([blob], `meal-preview-${index + 1}.${extension}`, {
		type: contentType,
		lastModified: Date.now(),
	});

	logPreview(debugId, "created File from fetched URL", {
		index,
		contentType,
		size: file.size,
		name: file.name,
	});

	return file;
}
