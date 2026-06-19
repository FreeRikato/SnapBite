import { Camera } from "lucide-react";
import type { RefObject } from "react";

type CaptureCameraPreviewProps = {
	videoRef: RefObject<HTMLVideoElement | null>;
	hasStream: boolean;
	cameraError: string | null;
};

export function CaptureCameraPreview({
	videoRef,
	hasStream,
	cameraError,
}: CaptureCameraPreviewProps) {
	if (hasStream) {
		return (
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className="absolute inset-0 h-full w-full object-cover"
			/>
		);
	}

	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-950 px-8 text-center">
			<Camera size={56} className="mb-5 text-white/20" />
			{cameraError && (
				<p className="max-w-sm text-sm leading-6 text-white/70">
					{cameraError}
				</p>
			)}
		</div>
	);
}
