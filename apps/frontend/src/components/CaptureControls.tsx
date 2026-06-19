import { Images, RefreshCcw } from "lucide-react";

type CaptureControlsProps = {
	onOpenLibrary: () => void;
	onCapturePhoto: () => void;
	onFlipCamera: () => void;
};

export function CaptureControls({
	onOpenLibrary,
	onCapturePhoto,
	onFlipCamera,
}: CaptureControlsProps) {
	return (
		<footer className="relative z-10 px-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
			<div className="flex items-center justify-center gap-10">
				<button
					type="button"
					onClick={onOpenLibrary}
					aria-label="Upload from photo library"
					className="flex size-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-95"
				>
					<Images size={25} strokeWidth={2.2} />
				</button>

				<button
					type="button"
					onClick={onCapturePhoto}
					aria-label="Capture photo"
					className="flex size-20 items-center justify-center rounded-full border-4 border-white bg-white/20 transition active:scale-95"
				>
					<span className="size-14 rounded-full bg-white" />
				</button>

				<button
					type="button"
					onClick={onFlipCamera}
					aria-label="Change camera"
					className="flex size-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-95"
				>
					<RefreshCcw size={25} strokeWidth={2.2} />
				</button>
			</div>
		</footer>
	);
}
