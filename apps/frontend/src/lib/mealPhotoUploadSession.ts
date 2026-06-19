import { uploadMealPhoto } from "@/lib/mealPhotoUpload";
import type { MealPhotoRecord } from "@/lib/mealRecords";
import { previewUrlToFile } from "@/lib/mealRecords";
import { cacheMealPhotoBlob } from "@/lib/photoBlobStore";
import type { CapturedPhoto } from "@/store";

type ProgressListener = (progress: number) => void;

export type MealPhotoUploadSession = {
	id: string;
	photoSignature: string;
	photos: CapturedPhoto[];
	promise: Promise<MealPhotoRecord[]>;
	getProgress: () => number;
	subscribeProgress: (listener: ProgressListener) => () => void;
};

let activeSession: MealPhotoUploadSession | null = null;

function getPhotoSignature(photos: CapturedPhoto[]) {
	return photos
		.map((photo) =>
			[
				photo.id,
				photo.blobKey,
				photo.size,
				photo.mimeType,
				photo.width,
				photo.height,
			].join(":"),
		)
		.join("|");
}

function createSessionId() {
	return `photo-upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function logSession(sessionId: string, message: string, data = {}) {
	console.info("[SnapBite upload-session]", message, { sessionId, ...data });
}

function logSessionError(sessionId: string, message: string, err: unknown) {
	console.error("[SnapBite upload-session]", message, { sessionId, err });
}

export function getActiveMealPhotoUploadSession() {
	return activeSession;
}

export function isActiveMealPhotoUploadSession(sessionId: string) {
	return activeSession?.id === sessionId;
}

export function clearActiveMealPhotoUploadSession(sessionId?: string) {
	if (!sessionId || activeSession?.id === sessionId) {
		activeSession = null;
	}
}

export function startMealPhotoUploadSession(
	capturedPhotos: CapturedPhoto[],
): MealPhotoUploadSession {
	const photos = capturedPhotos.map((photo) => ({ ...photo }));
	const photoSignature = getPhotoSignature(photos);

	if (activeSession?.photoSignature === photoSignature) {
		logSession(activeSession.id, "reusing active photo upload session", {
			photoCount: photos.length,
		});
		return activeSession;
	}

	const sessionId = createSessionId();
	const totalBytes = photos.reduce((sum, photo) => sum + photo.size, 0);
	const loadedBytes = new Array(photos.length).fill(0) as number[];
	const listeners = new Set<ProgressListener>();
	let progress = 0;

	function notify(nextProgress: number) {
		progress = Math.min(1, Math.max(progress, nextProgress));
		for (const listener of listeners) {
			listener(progress);
		}
	}

	const promise = (async () => {
		logSession(sessionId, "background upload started", {
			photoCount: photos.length,
			totalBytes,
		});

		try {
			const files = await Promise.all(
				photos.map((photo, index) =>
					previewUrlToFile(photo, index, `${sessionId}:photo-${index + 1}`),
				),
			);

			const uploadedPhotos = await Promise.all(
				files.map(async (file, index) => {
					const upload = await uploadMealPhoto({
						file,
						debugId: `${sessionId}:photo-${index + 1}`,
						onProgress: (loaded) => {
							loadedBytes[index] = loaded;
							const loadedTotal = loadedBytes.reduce(
								(sum, value) => sum + value,
								0,
							);
							notify(totalBytes > 0 ? loadedTotal / totalBytes : 0);
						},
					});

					loadedBytes[index] = file.size;
					const loadedTotal = loadedBytes.reduce(
						(sum, value) => sum + value,
						0,
					);
					notify(totalBytes > 0 ? loadedTotal / totalBytes : 1);

					await cacheMealPhotoBlob(upload.key, file);
					return {
						key: upload.key,
						contentType: file.type || "image/webp",
						size: file.size,
						width: photos[index]?.width ?? null,
						height: photos[index]?.height ?? null,
						etag: upload.etag ?? upload.httpEtag ?? null,
					} satisfies MealPhotoRecord;
				}),
			);

			notify(1);
			logSession(sessionId, "background upload complete", {
				photoCount: uploadedPhotos.length,
			});
			return uploadedPhotos;
		} catch (err) {
			logSessionError(sessionId, "background upload failed", err);
			throw err;
		}
	})();

	activeSession = {
		id: sessionId,
		photoSignature,
		photos,
		promise,
		getProgress: () => progress,
		subscribeProgress: (listener) => {
			listeners.add(listener);
			listener(progress);
			return () => listeners.delete(listener);
		},
	};

	return activeSession;
}

export function resetMealPhotoUploadSessionForTests() {
	activeSession = null;
}
