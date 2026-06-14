import type { Meal } from "@/store/useHomeStore";

type MealCardProps = {
	meal: Meal;
};

function formatTime(iso: string) {
	const date = new Date(iso);
	return date.toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit",
	});
}

export function MealCard({ meal }: MealCardProps) {
	return (
		<article className="flex items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/90 p-3">
			<img
				src={meal.thumbnail}
				alt=""
				className="size-14 shrink-0 rounded-md object-cover"
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<p className="truncate text-sm font-semibold text-white">{meal.name}</p>
				<p className="text-xs text-neutral-500">
					{formatTime(meal.uploadedAt)}
				</p>
			</div>
			<div className="flex flex-col items-end">
				<span className="text-sm font-semibold text-white">
					{meal.kcal} kcal
				</span>
			</div>
		</article>
	);
}
