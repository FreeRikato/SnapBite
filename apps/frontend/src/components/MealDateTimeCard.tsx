import { Clock3 } from "lucide-react";

type MealDateTimeCardProps = {
	idPrefix: string;
	dateValue: string;
	timeValue: string;
	onDateChange: (value: string) => void;
	onTimeChange: (value: string) => void;
};

export function MealDateTimeCard({
	idPrefix,
	dateValue,
	timeValue,
	onDateChange,
	onTimeChange,
}: MealDateTimeCardProps) {
	const dateId = `${idPrefix}-date`;
	const timeId = `${idPrefix}-time`;

	return (
		<div className="mb-5 grid grid-cols-[2.75rem_minmax(0,1fr)_minmax(0,0.78fr)] items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900 p-3.5">
			<span className="flex size-11 items-center justify-center rounded-full bg-sky-500/15">
				<Clock3 size={23} className="text-sky-300" strokeWidth={2.2} />
			</span>
			<label htmlFor={dateId} className="sr-only">
				Meal date
			</label>
			<input
				id={dateId}
				type="date"
				value={dateValue}
				onChange={(event) => onDateChange(event.target.value)}
				className="h-11 min-w-0 rounded-full border border-white/10 bg-neutral-950 px-3 text-center text-sm font-semibold text-white tabular-nums outline-none transition [color-scheme:dark] focus:border-white/40 focus:ring-2 focus:ring-white/10"
			/>
			<label htmlFor={timeId} className="sr-only">
				Meal time
			</label>
			<input
				id={timeId}
				type="time"
				value={timeValue}
				onChange={(event) => onTimeChange(event.target.value)}
				className="h-11 min-w-0 rounded-full border border-white/10 bg-neutral-950 px-3 text-center text-sm font-semibold text-white tabular-nums outline-none transition [color-scheme:dark] focus:border-white/40 focus:ring-2 focus:ring-white/10"
			/>
		</div>
	);
}
