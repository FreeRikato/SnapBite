type MealDoneFooterProps = {
	onDone: () => void;
	disabled?: boolean;
	error?: string | null;
	label?: string;
	loadingLabel?: string;
};

export function MealDoneFooter({
	onDone,
	disabled = false,
	error,
	label = "Done",
	loadingLabel = "Saving...",
}: MealDoneFooterProps) {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-neutral-950/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
			{error && (
				<p className="mb-2 text-center text-sm font-medium text-red-300">
					{error}
				</p>
			)}
			<button
				type="button"
				onClick={onDone}
				disabled={disabled}
				className="flex h-14 w-full items-center justify-center rounded-full bg-white text-base font-semibold text-neutral-950 shadow-2xl shadow-black/40 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
			>
				{disabled ? loadingLabel : label}
			</button>
		</footer>
	);
}
