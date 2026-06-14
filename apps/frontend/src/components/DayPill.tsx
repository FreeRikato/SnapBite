import type { DayCellStatus } from "@/types/home";

type DayPillProps = {
	weekday: string;
	dayOfMonth: number;
	status: DayCellStatus;
	onClick: () => void;
};

const RING_CLASSES: Record<DayCellStatus, string> = {
	today: "bg-white text-neutral-950 ring-2 ring-white",
	completed: "ring-2 ring-emerald-500 text-emerald-400",
	future: "ring-2 ring-neutral-600 text-neutral-400",
	missed: "ring-2 ring-red-500 text-red-400",
};

const NUMBER_CLASSES: Record<DayCellStatus, string> = {
	today: "text-white",
	completed: "text-emerald-400",
	future: "text-neutral-500",
	missed: "text-red-400",
};

export function DayPill({
	weekday,
	dayOfMonth,
	status,
	onClick,
}: DayPillProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex shrink-0 flex-col items-center gap-1.5 outline-none"
			aria-label={`${weekday} ${dayOfMonth}`}
		>
			<div
				className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold transition ${RING_CLASSES[status]}`}
			>
				{weekday}
			</div>
			<span className={`text-sm font-medium ${NUMBER_CLASSES[status]}`}>
				{dayOfMonth}
			</span>
		</button>
	);
}
