import { ArrowLeft, Camera, Images, RefreshCcw } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

type FacingMode = "environment" | "user";

export default function CapturePage() {
	const navigate = useNavigate();
	const videoRef = useRef<HTMLVideoElement>(null);
	const libraryInputRef = useRef<HTMLInputElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [facingMode, setFacingMode] = useState<FacingMode>("environment");
	const [cameraError, setCameraError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		async function startCamera() {
			setStream(null);
			setCameraError(null);
			if (!navigator.mediaDevices?.getUserMedia) {
				setCameraError(
					window.isSecureContext
						? "Live camera preview is not available in this browser."
						: "Live camera preview requires HTTPS on iOS",
				);
				return;
			}
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode },
					audio: false,
				});
				if (!active) {
					mediaStream.getTracks().forEach((track) => {
						track.stop();
					});
					return;
				}
				setStream(mediaStream);
			} catch (err) {
				setCameraError(
					err instanceof Error ? err.message : "Unable to start live camera",
				);
			}
		}

		startCamera();

		return () => {
			active = false;
			setStream((current) => {
				if (current) {
					current.getTracks().forEach((track) => {
						track.stop();
					});
				}
				return null;
			});
		};
	}, [facingMode]);

	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [stream]);

	async function capturePhoto() {
		const video = videoRef.current;
		if (!video?.videoWidth) return;
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, "image/jpeg", 0.9),
		);
		if (blob) {
			console.log("Captured photo:", blob);
		}
	}

	function closeCapture() {
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

	function handleLibraryChange(event: ChangeEvent<HTMLInputElement>) {
		const files = event.target.files;
		if (!files || files.length === 0) return;
		const selected = Array.from(files);
		console.log("Selected from library:", selected);
		event.target.value = "";
	}

	return (
		<main className="fixed inset-0 z-30 flex flex-col bg-black text-white">
			{stream ? (
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className="absolute inset-0 h-full w-full object-cover"
				/>
			) : (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 px-8 text-center">
					<Camera size={56} className="mb-5 text-white/20" />
					{cameraError && (
						<p className="max-w-sm text-sm leading-6 text-white/70">
							{cameraError}
						</p>
					)}
				</div>
			)}

			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />

			<header className="relative z-10 flex items-start justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
				<button
					type="button"
					onClick={closeCapture}
					aria-label="Back"
					className="flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition active:scale-95"
				>
					<ArrowLeft size={24} strokeWidth={2.4} />
				</button>
			</header>

			<div className="flex-1" />

			<footer className="relative z-10 px-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
				<div className="flex items-center justify-center gap-10">
					<button
						type="button"
						onClick={openLibrary}
						aria-label="Upload from photo library"
						className="flex size-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-95"
					>
						<Images size={25} strokeWidth={2.2} />
					</button>

					<button
						type="button"
						onClick={capturePhoto}
						aria-label="Capture photo"
						className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-white/20 transition active:scale-95"
					>
						<span className="size-14 rounded-full bg-white" />
					</button>

					<button
						type="button"
						onClick={flipCamera}
						aria-label="Change camera"
						className="flex size-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-95"
					>
						<RefreshCcw size={25} strokeWidth={2.2} />
					</button>
				</div>
			</footer>

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
