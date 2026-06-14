type BMIPageHeaderProps = {
	onBack: () => void;
	isBackButtonVisible?: boolean;
};

export function BMIPageHeader({
	onBack,
	isBackButtonVisible = false,
}: BMIPageHeaderProps) {
	return (
		<header className="flex flex-col gap-2">
			{isBackButtonVisible && (
				<button
					type="button"
					onClick={onBack}
					className="self-start rounded-md px-3 py-1 text-sm text-neutral-400 transition hover:bg-white/10 hover:text-white"
				>
					← Back
				</button>
			)}
			<h1 className="text-2xl font-bold text-white sm:text-3xl">
				Plan details
			</h1>
			<p className="text-sm text-neutral-400 sm:text-base">
				Update your measurements, goal, and daily calorie target anytime.
			</p>
		</header>
	);
}
