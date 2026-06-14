type NumberFieldProps = {
	label: string;
	unit: string;
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
};

export function NumberField({
	label,
	unit,
	value,
	onChange,
	placeholder,
}: NumberFieldProps) {
	return (
		<label className="flex flex-col gap-2">
			<span className="text-sm font-medium text-neutral-200">{label}</span>
			<div className="flex items-center rounded-lg border border-white/10 bg-neutral-950/70 px-4 py-3 transition focus-within:border-white focus-within:ring-2 focus-within:ring-white/20">
				<input
					type="number"
					inputMode="decimal"
					min="0"
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					className="w-full bg-transparent text-base font-semibold text-white placeholder:text-neutral-600 focus:outline-none"
				/>
				<span className="ml-2 text-xs font-medium text-neutral-500">
					{unit}
				</span>
			</div>
		</label>
	);
}
