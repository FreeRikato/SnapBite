import { useMemo, useState } from "react";

import { MealCard } from "@/components/MealCard";
import type { Meal } from "@/store";

type RecentlyUploadedListProps = {
	meals: Meal[];
	pendingMeals?: Meal[];
};

type UploadFilter = "all" | Meal["status"];

const FILTERS: { label: string; value: UploadFilter }[] = [
	{ label: "All", value: "all" },
	{ label: "Saved", value: "saved" },
	{ label: "Draft", value: "draft" },
];

export function RecentlyUploadedList({
	meals,
	pendingMeals = [],
}: RecentlyUploadedListProps) {
	const [activeFilter, setActiveFilter] = useState<UploadFilter>("all");

	const filteredPending = useMemo(() => {
		if (activeFilter === "all") return pendingMeals;
		return pendingMeals.filter((meal) => meal.status === activeFilter);
	}, [activeFilter, pendingMeals]);

	const filteredMeals = useMemo(() => {
		if (activeFilter === "all") return meals;
		return meals.filter((meal) => meal.status === activeFilter);
	}, [activeFilter, meals]);

	const allVisible = [...filteredPending, ...filteredMeals];

	return (
		<section className="flex flex-col gap-3 px-4 pt-2">
			<h2 className="text-lg font-semibold text-white">Recently uploaded</h2>
			<div className="flex justify-start">
				<div className="flex items-center gap-2 rounded-full bg-white/5 p-1">
					{FILTERS.map((filter) => {
						const isSelected = filter.value === activeFilter;

						return (
							<button
								key={filter.value}
								type="button"
								onClick={() => setActiveFilter(filter.value)}
								aria-pressed={isSelected}
								className={`min-w-16 rounded-full px-4 py-2 text-sm font-semibold transition ${
									isSelected
										? "bg-white text-neutral-950 shadow-sm shadow-black/20"
										: "text-white/65 hover:bg-white/10 hover:text-white"
								}`}
							>
								{filter.label}
							</button>
						);
					})}
				</div>
			</div>
			<div className="flex flex-col gap-2">
				{allVisible.map((meal) => (
					<MealCard
						key={meal.id}
						meal={meal}
						showStatusLabel={activeFilter === "all"}
					/>
				))}
			</div>
		</section>
	);
}
