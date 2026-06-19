import { getCachedMealPhotoObjectUrl } from "@/lib/photoBlobStore";

export type MealPhotoUploadResult = {
	key: string;
	size: number;
	etag?: string;
	httpEtag?: string;
};

type UploadMealPhotoOptions = {
	file: File;
	userId?: string;
	workerUrl?: string;
	signal?: AbortSignal;
	debugId?: string;
	onProgress?: (loaded: number, total: number) => void;
};

type WorkerErrorResponse = {
	error?: string;
};

type DeleteImagesResponse = {
	deleted?: number;
};

type DeleteMealPhotosOptions = {
	keys: string[];
	userId?: string;
	workerUrl?: string;
	signal?: AbortSignal;
	debugId?: string;
};

type UploadUrlResponse = {
	key: string;
	uploadUrl: string;
	method: "PUT";
	headers: {
		"Content-Type": string;
	};
	expiresIn: number;
	maxBytes: number;
};

const UPLOAD_FETCH_TIMEOUT_MS = 30_000;

function logUpload(debugId: string | undefined, message: string, data = {}) {
	console.info("[SnapBite upload]", message, { debugId, ...data });
}

function logDelete(debugId: string | undefined, message: string, data = {}) {
	console.info("[SnapBite delete]", message, { debugId, ...data });
}

function logUploadError(
	debugId: string | undefined,
	message: string,
	err: unknown,
) {
	console.error("[SnapBite upload]", message, { debugId, err });
}

function logDeleteError(
	debugId: string | undefined,
	message: string,
	err: unknown,
) {
	console.error("[SnapBite delete]", message, { debugId, err });
}

async function fetchWithTimeout(
	input: RequestInfo | URL,
	init: RequestInit,
	timeoutMs: number,
	debugId: string | undefined,
	step: string,
) {
	const controller = new AbortController();
	const timeout = window.setTimeout(() => {
		controller.abort(new Error(`${step} timed out after ${timeoutMs}ms`));
	}, timeoutMs);

	function abortFromParent() {
		controller.abort(init.signal?.reason);
	}

	try {
		if (init.signal?.aborted) {
			abortFromParent();
		} else {
			init.signal?.addEventListener("abort", abortFromParent, { once: true });
		}

		return await fetch(input, {
			...init,
			signal: controller.signal,
		});
	} catch (err) {
		if (step.startsWith("r2-delete")) {
			logDeleteError(debugId, `${step} fetch failed`, err);
		} else {
			logUploadError(debugId, `${step} fetch failed`, err);
		}
		throw err;
	} finally {
		window.clearTimeout(timeout);
		init.signal?.removeEventListener("abort", abortFromParent);
	}
}

function getWorkerUrl(override?: string): string {
	const workerUrl = override ?? import.meta.env.VITE_R2_WORKER_URL;

	if (!workerUrl) {
		throw new Error("Missing VITE_R2_WORKER_URL");
	}

	return workerUrl.replace(/\/+$/, "");
}

async function getUploadError(response: Response): Promise<string> {
	const fallback = `Upload failed with status ${response.status}`;

	try {
		const data = (await response.json()) as WorkerErrorResponse;
		return data.error ?? fallback;
	} catch {
		return fallback;
	}
}

async function getWorkerError(
	response: Response,
	fallbackPrefix: string,
): Promise<string> {
	const fallback = `${fallbackPrefix} failed with status ${response.status}`;

	try {
		const data = (await response.json()) as WorkerErrorResponse;
		return data.error ?? fallback;
	} catch {
		return fallback;
	}
}

function putToR2WithProgress(
	url: string,
	headers: Record<string, string>,
	file: File,
	timeoutMs: number,
	signal: AbortSignal | undefined,
	debugId: string | undefined,
	onProgress?: (loaded: number, total: number) => void,
): Promise<{ ok: boolean; status: number; etag: string | null }> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("PUT", url);

		for (const [key, value] of Object.entries(headers)) {
			xhr.setRequestHeader(key, value);
		}

		const timeout = window.setTimeout(() => {
			xhr.abort();
			logUploadError(debugId, "r2-upload XHR timed out", {
				timeoutMs,
			});
			reject(new Error(`r2-upload timed out after ${timeoutMs}ms`));
		}, timeoutMs);

		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				onProgress?.(event.loaded, event.total);
			}
		};

		xhr.onload = () => {
			window.clearTimeout(timeout);
			resolve({
				ok: xhr.status >= 200 && xhr.status < 300,
				status: xhr.status,
				etag: xhr.getResponseHeader("ETag"),
			});
		};

		xhr.onerror = () => {
			window.clearTimeout(timeout);
			reject(new Error("Network error during R2 upload"));
		};

		xhr.onabort = () => {
			window.clearTimeout(timeout);
			reject(new Error("R2 upload aborted"));
		};

		if (signal) {
			if (signal.aborted) {
				xhr.abort();
				reject(new Error("Upload aborted"));
				return;
			}
			signal.addEventListener("abort", () => xhr.abort(), { once: true });
		}

		xhr.send(file);
	});
}

export async function uploadMealPhoto({
	file,
	userId = "demo-user",
	workerUrl,
	signal,
	debugId,
	onProgress,
}: UploadMealPhotoOptions): Promise<MealPhotoUploadResult> {
	if (!file.type.startsWith("image/")) {
		throw new Error("Please select an image file");
	}

	const baseWorkerUrl = getWorkerUrl(workerUrl);
	logUpload(debugId, "requesting upload URL", {
		workerUrl: baseWorkerUrl,
		fileName: file.name,
		fileType: file.type,
		fileSize: file.size,
	});
	const uploadUrlResponse = await fetchWithTimeout(
		`${baseWorkerUrl}/upload-url`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-User-Id": userId,
			},
			body: JSON.stringify({
				contentType: file.type,
				size: file.size,
			}),
			signal,
		},
		UPLOAD_FETCH_TIMEOUT_MS,
		debugId,
		"upload-url",
	);

	if (!uploadUrlResponse.ok) {
		const error = await getUploadError(uploadUrlResponse);
		logUpload(debugId, "upload URL rejected", {
			status: uploadUrlResponse.status,
			error,
		});
		throw new Error(error);
	}

	const upload = (await uploadUrlResponse.json()) as UploadUrlResponse;
	logUpload(debugId, "upload URL received", {
		key: upload.key,
		method: upload.method,
		expiresIn: upload.expiresIn,
		maxBytes: upload.maxBytes,
		targetOrigin: new URL(upload.uploadUrl).origin,
		targetPathname: new URL(upload.uploadUrl).pathname,
	});
	const r2Response = await putToR2WithProgress(
		upload.uploadUrl,
		upload.headers,
		file,
		UPLOAD_FETCH_TIMEOUT_MS,
		signal,
		debugId,
		onProgress,
	);

	if (!r2Response.ok) {
		logUpload(debugId, "R2 upload rejected", { status: r2Response.status });
		throw new Error(`Upload failed with status ${r2Response.status}`);
	}

	const etag = r2Response.etag ?? undefined;
	logUpload(debugId, "R2 upload complete", {
		key: upload.key,
		status: r2Response.status,
		etag,
	});

	return {
		key: upload.key,
		size: file.size,
		etag,
		httpEtag: etag,
	};
}

export async function deleteMealPhotos({
	keys,
	userId = "demo-user",
	workerUrl,
	signal,
	debugId,
}: DeleteMealPhotosOptions): Promise<void> {
	const uniqueKeys = Array.from(new Set(keys.map((key) => key.trim()))).filter(
		Boolean,
	);

	if (uniqueKeys.length === 0) {
		logDelete(debugId, "skipping R2 meal photo delete with no keys", {
			inputKeyCount: keys.length,
		});
		return;
	}

	const baseWorkerUrl = getWorkerUrl(workerUrl);
	logDelete(debugId, "deleting R2 meal photos", {
		workerUrl: baseWorkerUrl,
		keyCount: uniqueKeys.length,
		keys: uniqueKeys,
	});

	const response = await fetchWithTimeout(
		`${baseWorkerUrl}/images`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-User-Id": userId,
				...(debugId ? { "X-Debug-Id": debugId } : {}),
			},
			body: JSON.stringify({ keys: uniqueKeys }),
			signal,
		},
		UPLOAD_FETCH_TIMEOUT_MS,
		debugId,
		"r2-delete",
	);

	if (!response.ok) {
		const error = await getWorkerError(response, "Delete");
		logDelete(debugId, "R2 delete rejected", {
			status: response.status,
			error,
			keys: uniqueKeys,
		});
		throw new Error(error);
	}

	let deleted: number | undefined;
	try {
		const data = (await response.json()) as DeleteImagesResponse;
		deleted = data.deleted;
	} catch (err) {
		logDeleteError(debugId, "R2 delete response JSON parse failed", err);
	}

	logDelete(debugId, "R2 delete complete", {
		keyCount: uniqueKeys.length,
		deleted,
		keys: uniqueKeys,
	});
}

export function getMealPhotoUrl(key: string, workerUrl?: string): string {
	const localUrl = getCachedMealPhotoObjectUrl(key);
	if (localUrl) return localUrl;

	const search = new URLSearchParams({ key });
	return `${getWorkerUrl(workerUrl)}/image?${search.toString()}`;
}
