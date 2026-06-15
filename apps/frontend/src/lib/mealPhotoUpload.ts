export type MealPhotoUploadResult = {
	key: string;
	size: number;
	etag: string;
	httpEtag?: string;
};

type UploadMealPhotoOptions = {
	file: File;
	userId?: string;
	workerUrl?: string;
	signal?: AbortSignal;
};

type WorkerErrorResponse = {
	error?: string;
};

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

export async function uploadMealPhoto({
	file,
	userId = "demo-user",
	workerUrl,
	signal,
}: UploadMealPhotoOptions): Promise<MealPhotoUploadResult> {
	if (!file.type.startsWith("image/")) {
		throw new Error("Please select an image file");
	}

	const response = await fetch(`${getWorkerUrl(workerUrl)}/upload`, {
		method: "POST",
		headers: {
			"Content-Type": file.type,
			"X-User-Id": userId,
		},
		body: file,
		signal,
	});

	if (!response.ok) {
		throw new Error(await getUploadError(response));
	}

	return (await response.json()) as MealPhotoUploadResult;
}

export function getMealPhotoUrl(key: string, workerUrl?: string): string {
	const search = new URLSearchParams({ key });
	return `${getWorkerUrl(workerUrl)}/image?${search.toString()}`;
}
