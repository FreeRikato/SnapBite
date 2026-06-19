import { FoodItemsEditor } from "@/components/FoodItemsEditor";
import { MealCaloriesCard } from "@/components/MealCaloriesCard";
import { MealDateTimeCard } from "@/components/MealDateTimeCard";
import type { FoodItem } from "@/types/analysis";

type MealDetailsEditorProps = {
	calories: string;
	dateValue: string;
	foodItems: FoodItem[];
	idPrefix: string;
	timeValue: string;
	onAddItem: () => void;
	onDateChange: (value: string) => void;
	onEditCalories: () => void;
	onEditItem: (id: string) => void;
	onTimeChange: (value: string) => void;
};

export function MealDetailsEditor({
	calories,
	dateValue,
	foodItems,
	idPrefix,
	timeValue,
	onAddItem,
	onDateChange,
	onEditCalories,
	onEditItem,
	onTimeChange,
}: MealDetailsEditorProps) {
	return (
		<section className="relative z-10 -mt-6 flex-1 rounded-t-3xl border-t border-white/10 bg-neutral-950 px-4 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))]">
			<MealCaloriesCard calories={calories} onEdit={onEditCalories} />
			<MealDateTimeCard
				idPrefix={idPrefix}
				dateValue={dateValue}
				timeValue={timeValue}
				onDateChange={onDateChange}
				onTimeChange={onTimeChange}
			/>
			<FoodItemsEditor
				foodItems={foodItems}
				onEditItem={onEditItem}
				onAddItem={onAddItem}
			/>
		</section>
	);
}
