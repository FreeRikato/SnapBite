import { ArrowLeft, Check, X } from "lucide-react";

type CaptureHeaderProps = {
	photoCount: number;
	onClose: () => void;
	onClearPhotos: () => void;
	onGoToPreview: () => void;
};

export function CaptureHeader({
	photoCount,
	onClose,
	onClearPhotos,
	onGoToPreview,
}: CaptureHeaderProps) {
	return (
		<header className="relative z-10 flex items-start justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
			<button
				type="button"
				onClick={onClose}
				aria-label="Back"
				className="flex size-11 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition active:scale-95"
			>
				<ArrowLeft size={24} strokeWidth={2.4} />
			</button>

			{photoCount > 0 && (
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onClearPhotos}
						aria-label="Clear all photos"
						className="flex size-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-black/30 backdrop-blur-md transition active:scale-95"
					>
						<X size={20} strokeWidth={2.6} />
					</button>
					<button
						type="button"
						onClick={onGoToPreview}
						aria-label={`Review ${photoCount} ${photoCount === 1 ? "photo" : "photos"}`}
						className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 shadow-lg shadow-black/30 backdrop-blur-md transition active:scale-95"
					>
						<span className="flex size-5 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-bold text-white">
							{photoCount}
						</span>
						<Check size={16} strokeWidth={2.6} />
					</button>
				</div>
			)}
		</header>
	);
}
