import { Pencil, Plus } from "lucide-react";

import type { FoodItem } from "@/types/analysis";

type FoodItemsEditorProps = {
	foodItems: FoodItem[];
	onEditItem: (id: string) => void;
	onAddItem: () => void;
};

export function FoodItemsEditor({
	foodItems,
	onEditItem,
	onAddItem,
}: FoodItemsEditorProps) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<h2 className="text-base font-semibold tracking-tight text-white">
					Items identified
				</h2>
				<span className="text-sm font-medium text-neutral-500">
					{foodItems.length} {foodItems.length === 1 ? "item" : "items"}
				</span>
			</div>

			<ul className="flex flex-col gap-2.5">
				{foodItems.map((item, itemIndex) => (
					<li key={item.id}>
						<button
							type="button"
							onClick={() => onEditItem(item.id)}
							className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-3.5 text-left transition active:scale-[0.99]"
						>
							<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-neutral-400">
								{itemIndex + 1}
							</span>
							<span className="text-2xl" aria-hidden="true">
								{item.emoji}
							</span>
							<span className="flex flex-1 flex-col">
								<span className="text-base font-medium text-white">
									{item.name}
								</span>
								<span className="text-sm text-neutral-500 tabular-nums">
									{item.quantity} {item.unit}
								</span>
							</span>
							<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-neutral-400">
								<Pencil size={16} strokeWidth={2.2} />
							</span>
						</button>
					</li>
				))}
			</ul>

			<button
				type="button"
				onClick={onAddItem}
				className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-neutral-900/50 p-3.5 text-sm font-semibold text-neutral-300 transition active:scale-[0.99]"
			>
				<Plus size={18} strokeWidth={2.4} />
				Add item
			</button>
		</>
	);
}
