import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BottomSheet } from "@/components/BottomSheet";
import { QUANTITY_UNITS } from "@/constants/analysis";
import type { QuantityUnit } from "@/types/analysis";

export type FoodItemDraft = {
	emoji: string;
	name: string;
	quantity: number;
	unit: QuantityUnit;
};

type FoodItemEditModalProps = {
	open: boolean;
	title: string;
	initial: FoodItemDraft | null;
	onClose: () => void;
	onSave: (draft: FoodItemDraft) => void;
	onDelete?: () => void;
};

function stepFor(unit: QuantityUnit) {
	if (unit === "Grams" || unit === "ml") return 10;
	if (unit === "l") return 0.5;
	return 1;
}

function roundQuantity(value: number) {
	return Math.round(value * 100) / 100;
}

export function FoodItemEditModal({
	open,
	title,
	initial,
	onClose,
	onSave,
	onDelete,
}: FoodItemEditModalProps) {
	const [name, setName] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [unit, setUnit] = useState<QuantityUnit>("Plates");

	useEffect(() => {
		if (open && initial) {
			setName(initial.name);
			setQuantity(initial.quantity);
			setUnit(initial.unit);
		}
	}, [open, initial]);

	function changeQuantity(direction: 1 | -1) {
		setQuantity((current) =>
			roundQuantity(Math.max(0, current + direction * stepFor(unit))),
		);
	}

	function submit() {
		const trimmed = name.trim();
		if (!trimmed) return;
		onSave({
			emoji: initial?.emoji ?? "🍽️",
			name: trimmed,
			quantity: roundQuantity(quantity),
			unit,
		});
	}

	return (
		<BottomSheet open={open} title={title} onClose={onClose} onConfirm={submit}>
			<div className="mt-4 flex flex-col gap-5">
				<label className="flex flex-col gap-2">
					<span className="text-sm font-medium text-neutral-200">Item</span>
					<input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="Food name"
						className="w-full rounded-2xl border border-white/10 bg-neutral-950 p-4 text-base text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
					/>
				</label>

				<div className="flex flex-col gap-2">
					<span className="text-sm font-medium text-neutral-200">Quantity</span>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => changeQuantity(-1)}
							aria-label="Decrease quantity"
							className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-neutral-950 text-white transition active:scale-95"
						>
							<Minus size={20} strokeWidth={2.4} />
						</button>
						<div className="flex-1 rounded-2xl border border-white/10 bg-neutral-950 py-3 text-center text-2xl font-semibold tabular-nums text-white">
							{quantity}
						</div>
						<button
							type="button"
							onClick={() => changeQuantity(1)}
							aria-label="Increase quantity"
							className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-neutral-950 text-white transition active:scale-95"
						>
							<Plus size={20} strokeWidth={2.4} />
						</button>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<span className="text-sm font-medium text-neutral-200">Unit</span>
					<div className="flex gap-2 overflow-x-auto pb-1">
						{QUANTITY_UNITS.map((option) => {
							const active = unit === option;
							return (
								<button
									key={option}
									type="button"
									onClick={() => setUnit(option)}
									className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
										active
											? "border-white bg-white text-neutral-950"
											: "border-white/10 bg-neutral-950 text-neutral-300 hover:border-white/20"
									}`}
								>
									{option}
								</button>
							);
						})}
					</div>
				</div>

				{onDelete && (
					<button
						type="button"
						onClick={onDelete}
						className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-400 transition active:scale-[0.98]"
					>
						<Trash2 size={18} strokeWidth={2.2} />
						Remove item
					</button>
				)}
			</div>
		</BottomSheet>
	);
}
