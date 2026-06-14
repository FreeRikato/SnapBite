import type { BmiCategory, CalorieModeInfo } from "@/types/bmi";

type BMIResultsCardProps = {
	bmi: number | null;
	bmiInfo: BmiCategory | null;
	dailyCalories: number | null;
	calorieModeInfo: CalorieModeInfo;
	isCalorieModeTooltipOpen: boolean;
	onCalorieModeTooltipOpenChange: (isOpen: boolean) => void;
};

export function BMIResultsCard({
	bmi,
	bmiInfo,
	dailyCalories,
	calorieModeInfo,
	isCalorieModeTooltipOpen,
	onCalorieModeTooltipOpenChange,
}: BMIResultsCardProps) {
	return (
		<section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-neutral-900/90 p-4 shadow-2xl shadow-black/30 sm:p-7">
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-neutral-400">Your BMI</span>
				{bmiInfo && (
					<span className={`text-sm font-semibold ${bmiInfo.color}`}>
						{bmiInfo.label}
					</span>
				)}
			</div>
			<div className="flex items-baseline gap-2">
				<span className="text-5xl font-bold text-white">
					{bmi !== null ? bmi.toFixed(1) : "--"}
				</span>
				<span className="text-sm text-neutral-500">kg/m²</span>
			</div>
			<div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-800">
				<div className="absolute inset-y-0 left-0 w-1/4 bg-sky-400" />
				<div className="absolute inset-y-0 left-1/4 w-1/4 bg-emerald-400" />
				<div className="absolute inset-y-0 left-2/4 w-1/4 bg-amber-400" />
				<div className="absolute inset-y-0 left-3/4 w-1/4 bg-rose-400" />
				{bmi !== null && (
					<div
						className="absolute -top-1 h-4 w-1 rounded-full bg-white transition-all"
						style={{
							left: `${Math.min(100, Math.max(0, (bmi / 40) * 100))}%`,
						}}
					/>
				)}
			</div>
			<div className="flex justify-between text-[10px] uppercase text-neutral-500">
				<span>18.5</span>
				<span>25</span>
				<span>30</span>
				<span>40</span>
			</div>

			{dailyCalories !== null && (
				<div className="mt-2 flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-neutral-950/70 px-4 py-3">
					<div className="flex flex-col">
						<span className="text-xs font-medium uppercase text-neutral-500">
							Daily calorie target
						</span>
						<span className="text-2xl font-bold text-white">
							{dailyCalories.toLocaleString()} kcal
						</span>
					</div>
					<div className="relative flex shrink-0 items-center">
						<button
							type="button"
							aria-describedby="calorie-mode-tooltip"
							aria-expanded={isCalorieModeTooltipOpen}
							className="rounded-md bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-200 ring-1 ring-white/10 transition hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
							onClick={() => onCalorieModeTooltipOpenChange(true)}
							onMouseEnter={() => onCalorieModeTooltipOpenChange(true)}
							onMouseLeave={() => onCalorieModeTooltipOpenChange(false)}
							onFocus={() => onCalorieModeTooltipOpenChange(true)}
							onBlur={() => onCalorieModeTooltipOpenChange(false)}
							onKeyDown={(event) => {
								if (event.key === "Escape") {
									onCalorieModeTooltipOpenChange(false);
									event.currentTarget.blur();
								}
							}}
						>
							{calorieModeInfo.label}
						</button>
						{isCalorieModeTooltipOpen && (
							<div
								id="calorie-mode-tooltip"
								role="tooltip"
								className="absolute right-0 bottom-full z-10 mb-2 w-56 max-w-[calc(100vw-3rem)] rounded-lg bg-white px-3 py-2 text-left text-xs leading-relaxed font-medium text-neutral-950 shadow-lg before:absolute before:top-full before:right-5 before:h-2 before:w-2 before:-translate-y-1/2 before:rotate-45 before:bg-white"
							>
								{calorieModeInfo.description}
							</div>
						)}
					</div>
				</div>
			)}
		</section>
	);
}
