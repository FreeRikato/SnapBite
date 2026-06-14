import { MealCard } from "@/components/MealCard";
import type { Meal } from "@/store/useHomeStore";

type RecentlyUploadedListProps = {
	meals: Meal[];
};

export function RecentlyUploadedList({ meals }: RecentlyUploadedListProps) {
	return (
		<section className="flex flex-col gap-3 px-4 pt-2">
			<h2 className="text-lg font-semibold text-white">Recently uploaded</h2>
			<div className="flex flex-col gap-2">
				{meals.map((meal) => (
					<MealCard key={meal.id} meal={meal} />
				))}
			</div>
		</section>
	);
}
