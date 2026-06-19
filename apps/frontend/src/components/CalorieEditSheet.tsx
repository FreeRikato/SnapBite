import type { RefObject } from "react";

import { BottomSheet } from "@/components/BottomSheet";

type CalorieEditSheetProps = {
	open: boolean;
	value: string;
	inputRef: RefObject<HTMLInputElement | null>;
	onChange: (value: string) => void;
	onClose: () => void;
	onConfirm: () => void;
};

export function CalorieEditSheet({
	open,
	value,
	inputRef,
	onChange,
	onClose,
	onConfirm,
}: CalorieEditSheetProps) {
	return (
		<BottomSheet
			open={open}
			title="Edit calories"
			onClose={onClose}
			onConfirm={onConfirm}
		>
			<label className="mt-4 flex flex-col gap-2">
				<span className="text-sm font-medium text-neutral-200">Calories</span>
				<div className="flex items-center rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 transition focus-within:border-white/30">
					<input
						ref={inputRef}
						type="number"
						inputMode="numeric"
						min="0"
						step="1"
						value={value}
						onChange={(event) => onChange(event.target.value)}
						placeholder="0"
						className="w-full bg-transparent text-2xl font-semibold text-white tabular-nums placeholder:text-neutral-600 focus:outline-none"
					/>
					<span className="ml-2 text-sm font-medium text-neutral-500">
						kcal
					</span>
				</div>
			</label>
		</BottomSheet>
	);
}
