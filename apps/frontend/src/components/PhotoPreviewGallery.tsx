import { Camera, X } from "lucide-react";

import type { CapturedPhoto } from "@/store";

type PhotoPreviewGalleryProps = {
	photos: CapturedPhoto[];
	onRemovePhoto: (id: string) => void;
};

export function PhotoPreviewGallery({
	photos,
	onRemovePhoto,
}: PhotoPreviewGalleryProps) {
	return (
		<section className="flex-1 px-4 pt-4 pb-[calc(7rem+env(safe-area-inset-bottom))]">
			{photos.length === 0 ? (
				<div className="flex h-full flex-col items-center justify-center gap-3 pt-24 text-center">
					<div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-neutral-900">
						<Camera size={26} className="text-neutral-500" strokeWidth={1.8} />
					</div>
					<p className="text-sm font-medium text-neutral-400">No photos yet</p>
					<p className="max-w-xs text-xs leading-5 text-neutral-500">
						Tap the shutter or pick images from your library to add them here.
					</p>
				</div>
			) : (
				<ul className="grid grid-cols-3 gap-2">
					{photos.map((photo) => (
						<li
							key={photo.id}
							className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-neutral-900"
						>
							<img
								src={photo.previewObjectUrl}
								alt="Selected meal"
								className="absolute inset-0 h-full w-full object-cover"
							/>
							<button
								type="button"
								onClick={() => onRemovePhoto(photo.id)}
								aria-label="Remove photo"
								className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-black/65 text-white shadow-md backdrop-blur-md transition active:scale-95"
							>
								<X size={14} strokeWidth={2.6} />
							</button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
