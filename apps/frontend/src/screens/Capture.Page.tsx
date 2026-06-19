import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { CaptureCameraPreview } from "@/components/CaptureCameraPreview";
import { CaptureControls } from "@/components/CaptureControls";
import { CaptureHeader } from "@/components/CaptureHeader";
import { createPreviewUrl, saveCapturePhotoBlob } from "@/lib/photoBlobStore";
import { resizeMealPhoto } from "@/lib/resizeMealPhoto";
import type { CapturedPhoto } from "@/store";
import { useCaptureStore } from "@/store";

type FacingMode = "environment" | "user";

let activeCameraLeaseCount = 0;
let cachedCameraStream: MediaStream | null = null;
let cachedFacingMode: FacingMode | null = null;
let cameraRequest: Promise<MediaStream> | null = null;
let cameraRequestFacingMode: FacingMode | null = null;

function stopMediaStream(mediaStream: MediaStream | null) {
	mediaStream?.getTracks().forEach((track) => {
		track.stop();
	});
}

function stopCachedCameraStream() {
	stopMediaStream(cachedCameraStream);
	cachedCameraStream = null;
	cachedFacingMode = null;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Unable to capture photo"));
					return;
				}
				resolve(blob);
			},
			"image/jpeg",
			0.9,
		);
	});
}

async function preparePhotoFile(
	file: File,
	id: string,
): Promise<CapturedPhoto> {
	const resized = await resizeMealPhoto(file);
	const blobKey = `capture-${id}`;
	await saveCapturePhotoBlob(blobKey, resized.file);

	return {
		id,
		blobKey,
		previewObjectUrl: await createPreviewUrl(blobKey, resized.file),
		width: resized.width,
		height: resized.height,
		size: resized.resizedBytes,
		mimeType: resized.mimeType,
	};
}

function requestCameraStream(facingMode: FacingMode) {
	if (cachedCameraStream?.active && cachedFacingMode === facingMode) {
		return Promise.resolve(cachedCameraStream);
	}

	if (cachedCameraStream) {
		stopCachedCameraStream();
	}

	if (!cameraRequest || cameraRequestFacingMode !== facingMode) {
		cameraRequestFacingMode = facingMode;
		cameraRequest = navigator.mediaDevices
			.getUserMedia({
				video: { facingMode },
				audio: false,
			})
			.then((mediaStream) => {
				cachedCameraStream = mediaStream;
				cachedFacingMode = facingMode;
				return mediaStream;
			})
			.finally(() => {
				cameraRequest = null;
				cameraRequestFacingMode = null;

				if (activeCameraLeaseCount === 0) {
					stopCachedCameraStream();
				}
			});
	}

	return cameraRequest;
}

function createCameraLease(facingMode: FacingMode) {
	let released = false;
	activeCameraLeaseCount += 1;

	return {
		stream: requestCameraStream(facingMode),
		release() {
			if (released) return;
			released = true;
			activeCameraLeaseCount = Math.max(0, activeCameraLeaseCount - 1);

			if (activeCameraLeaseCount === 0) {
				stopCachedCameraStream();
			}
		},
	};
}

export default function CapturePage() {
	const navigate = useNavigate();
	const videoRef = useRef<HTMLVideoElement>(null);
	const libraryInputRef = useRef<HTMLInputElement>(null);
	const cameraLeaseRef = useRef<ReturnType<typeof createCameraLease> | null>(
		null,
	);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [facingMode, setFacingMode] = useState<FacingMode>("environment");
	const [cameraError, setCameraError] = useState<string | null>(null);
	const [capturing, setCapturing] = useState(false);
	const photoCount = useCaptureStore((state) => state.photos.length);
	const addPhotos = useCaptureStore((state) => state.addPhotos);
	const clearPhotos = useCaptureStore((state) => state.clearPhotos);

	const clearVideo = useCallback(() => {
		if (!videoRef.current) return;
		videoRef.current.pause();
		videoRef.current.srcObject = null;
	}, []);

	const releaseCamera = useCallback(
		(resetPreview = true) => {
			cameraLeaseRef.current?.release();
			cameraLeaseRef.current = null;
			clearVideo();
			if (resetPreview) {
				setStream(null);
			}
		},
		[clearVideo],
	);

	useEffect(() => {
		let active = true;

		async function startCamera() {
			releaseCamera();
			setCameraError(null);
			if (!navigator.mediaDevices?.getUserMedia) {
				setCameraError(
					window.isSecureContext
						? "Live camera preview is not available in this browser."
						: "Live camera preview requires HTTPS on iOS",
				);
				return;
			}

			const lease = createCameraLease(facingMode);
			cameraLeaseRef.current = lease;

			try {
				const mediaStream = await lease.stream;
				if (!active) return;
				setStream(mediaStream);
			} catch (err) {
				if (!active) return;
				setCameraError(
					err instanceof Error ? err.message : "Unable to start live camera",
				);
			}
		}

		startCamera();

		return () => {
			active = false;
			releaseCamera(false);
		};
	}, [facingMode, releaseCamera]);

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	async function capturePhoto() {
		if (capturing) return;
		const video = videoRef.current;
		if (!video?.videoWidth) return;
		setCapturing(true);
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			setCapturing(false);
			return;
		}
		try {
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			const blob = await canvasToBlob(canvas);
			const file = new File([blob], `capture-${Date.now()}.jpg`, {
				type: "image/jpeg",
				lastModified: Date.now(),
			});
			const photo = await preparePhotoFile(
				file,
				`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			);
			addPhotos([photo]);
		} catch (err) {
			setCameraError(
				err instanceof Error ? err.message : "Unable to capture photo",
			);
		} finally {
			setCapturing(false);
		}
	}

	function closeCapture() {
		releaseCamera();
		clearPhotos();
		navigate("/");
	}

	function flipCamera() {
		setFacingMode((current) =>
			current === "environment" ? "user" : "environment",
		);
	}

	function openLibrary() {
		libraryInputRef.current?.click();
	}

	async function handleLibraryChange(event: ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		if (!files || files.length === 0) return;
		const selected = Array.from(files);
		try {
			const photos: CapturedPhoto[] = await Promise.all(
				selected.map((file) =>
					preparePhotoFile(
						file,
						`lib-${file.name}-${file.lastModified}-${file.size}`,
					),
				),
			);
			addPhotos(photos);
			event.target.value = "";
			navigate("/preview");
		} catch (err) {
			setCameraError(
				err instanceof Error ? err.message : "Unable to read selected image",
			);
		}
	}

	function goToPreview() {
		releaseCamera();
		navigate("/preview");
	}

	return (
		<main className="fixed inset-0 z-30 flex flex-col bg-black text-white">
			<CaptureCameraPreview
				videoRef={videoRef}
				hasStream={Boolean(stream)}
				cameraError={cameraError}
			/>

			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />

			<CaptureHeader
				photoCount={photoCount}
				onClose={closeCapture}
				onClearPhotos={clearPhotos}
				onGoToPreview={goToPreview}
			/>

			<div className="flex-1" />

			<CaptureControls
				onOpenLibrary={openLibrary}
				onCapturePhoto={capturePhoto}
				onFlipCamera={flipCamera}
			/>

			<input
				ref={libraryInputRef}
				type="file"
				accept="image/*"
				multiple
				onChange={handleLibraryChange}
				className="fixed top-0 left-[-9999px] size-px opacity-0"
				tabIndex={-1}
				aria-hidden="true"
			/>
		</main>
	);
}
