import { Flame, Pencil } from "lucide-react";

type MealCaloriesCardProps = {
	calories: string;
	onEdit: () => void;
};

export function MealCaloriesCard({ calories, onEdit }: MealCaloriesCardProps) {
	return (
		<div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4">
			<div className="flex items-center gap-3">
				<span className="flex size-11 items-center justify-center rounded-full bg-orange-500/15">
					<Flame size={24} className="text-orange-400" strokeWidth={2.2} />
				</span>
				<div className="flex flex-col">
					<span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
						Calories
					</span>
					<span className="text-3xl font-semibold tracking-tight tabular-nums text-white">
						{calories}
					</span>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-neutral-500">kcal</span>
				<button
					type="button"
					onClick={onEdit}
					aria-label="Edit calories"
					className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-neutral-400 transition active:scale-95"
				>
					<Pencil size={16} strokeWidth={2.2} />
				</button>
			</div>
		</div>
	);
}
