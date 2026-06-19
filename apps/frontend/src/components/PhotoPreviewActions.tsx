type PhotoPreviewActionsProps = {
	photoCount: number;
	onClearPhotos: () => void;
	onSubmit: () => void;
};

export function PhotoPreviewActions({
	photoCount,
	onClearPhotos,
	onSubmit,
}: PhotoPreviewActionsProps) {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-2 border-t border-white/10 bg-neutral-950/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
			{photoCount > 0 && (
				<button
					type="button"
					onClick={onClearPhotos}
					className="flex h-12 w-full items-center justify-center rounded-full bg-red-600 text-base font-semibold text-white transition active:scale-[0.98]"
				>
					Clear
				</button>
			)}
			<button
				type="button"
				disabled={photoCount === 0}
				onClick={onSubmit}
				className="flex h-14 w-full items-center justify-center rounded-full bg-white text-base font-semibold text-neutral-950 shadow-2xl shadow-black/40 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
			>
				{photoCount === 0
					? "Add a photo to continue"
					: photoCount === 1
						? "Submit 1 photo"
						: `Submit ${photoCount} photos`}
			</button>
		</footer>
	);
}
