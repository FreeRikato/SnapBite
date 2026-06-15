export type ResizedMealPhoto = {
	file: File;
	width: number;
	height: number;
	originalBytes: number;
	resizedBytes: number;
	mimeType: string;
};

const DEFAULT_MAX_EDGE = 1280;
const FALLBACK_MAX_EDGE = 1024;
const DEFAULT_QUALITY = 0.82;
const MIN_QUALITY = 0.72;
const TARGET_BYTES = 650 * 1024;

function getTargetDimensions(
	width: number,
	height: number,
	maxEdge: number,
): { width: number; height: number } {
	const scale = Math.min(1, maxEdge / Math.max(width, height));

	return {
		width: Math.round(width * scale),
		height: Math.round(height * scale),
	};
}

function canvasToBlob(
	canvas: HTMLCanvasElement,
	type: string,
	quality: number,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Failed to create image blob"));
					return;
				}

				resolve(blob);
			},
			type,
			quality,
		);
	});
}

async function drawImageToCanvas(
	bitmap: ImageBitmap,
	maxEdge: number,
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
	const { width, height } = getTargetDimensions(
		bitmap.width,
		bitmap.height,
		maxEdge,
	);
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not create canvas context");
	}

	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(bitmap, 0, 0, width, height);

	return { canvas, width, height };
}

async function encodeCanvas(
	canvas: HTMLCanvasElement,
	quality: number,
): Promise<{ blob: Blob; mimeType: string }> {
	let blob = await canvasToBlob(canvas, "image/webp", quality);

	if (blob.type === "image/webp") {
		return { blob, mimeType: "image/webp" };
	}

	blob = await canvasToBlob(canvas, "image/jpeg", quality);
	return { blob, mimeType: "image/jpeg" };
}

export async function resizeMealPhoto(file: File): Promise<ResizedMealPhoto> {
	if (!file.type.startsWith("image/")) {
		throw new Error("Please select an image file");
	}

	const bitmap = await createImageBitmap(file, {
		imageOrientation: "from-image",
	});

	try {
		let { canvas, width, height } = await drawImageToCanvas(
			bitmap,
			DEFAULT_MAX_EDGE,
		);
		let quality = DEFAULT_QUALITY;
		let { blob, mimeType } = await encodeCanvas(canvas, quality);

		while (blob.size > TARGET_BYTES && quality > MIN_QUALITY) {
			quality = Math.max(MIN_QUALITY, quality - 0.05);
			blob = await canvasToBlob(canvas, mimeType, quality);
		}

		if (blob.size > TARGET_BYTES) {
			const smaller = await drawImageToCanvas(bitmap, FALLBACK_MAX_EDGE);
			canvas = smaller.canvas;
			width = smaller.width;
			height = smaller.height;
			quality = DEFAULT_QUALITY;
			blob = await canvasToBlob(canvas, mimeType, quality);
		}

		const extension = mimeType === "image/jpeg" ? "jpg" : "webp";
		const filename = file.name.replace(/\.[^.]+$/, `.${extension}`);
		const resizedFile = new File([blob], filename, {
			type: mimeType,
			lastModified: Date.now(),
		});

		return {
			file: resizedFile,
			width,
			height,
			originalBytes: file.size,
			resizedBytes: resizedFile.size,
			mimeType,
		};
	} finally {
		bitmap.close();
	}
}
