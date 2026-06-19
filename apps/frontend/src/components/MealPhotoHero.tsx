import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type MealPhotoHeroProps = {
	imageSrc: string;
	imageAlt: string;
	hasCarousel: boolean;
	currentPhotoIndex: number;
	photoCount: number;
	onPreviousPhoto: () => void;
	onNextPhoto: () => void;
	children: ReactNode;
};

export function MealPhotoHero({
	imageSrc,
	imageAlt,
	hasCarousel,
	currentPhotoIndex,
	photoCount,
	onPreviousPhoto,
	onNextPhoto,
	children,
}: MealPhotoHeroProps) {
	return (
		<div className="relative h-[45vh] min-h-[18rem] w-full shrink-0">
			<img
				src={imageSrc}
				alt={imageAlt}
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-neutral-950" />

			{hasCarousel && (
				<>
					<button
						type="button"
						onClick={onPreviousPhoto}
						aria-label="Show previous photo"
						className="absolute top-1/2 left-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg shadow-black/30 backdrop-blur-md transition active:scale-95"
					>
						<ChevronLeft size={26} strokeWidth={2.4} />
					</button>
					<button
						type="button"
						onClick={onNextPhoto}
						aria-label="Show next photo"
						className="absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg shadow-black/30 backdrop-blur-md transition active:scale-95"
					>
						<ChevronRight size={26} strokeWidth={2.4} />
					</button>
					<div className="absolute right-4 bottom-8 z-10 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white tabular-nums backdrop-blur-md">
						{currentPhotoIndex + 1} / {photoCount}
					</div>
				</>
			)}

			{children}
		</div>
	);
}
