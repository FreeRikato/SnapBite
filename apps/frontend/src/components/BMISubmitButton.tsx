type BMISubmitButtonProps = {
	isEnabled: boolean;
	onSubmit: () => void;
};

export function BMISubmitButton({ isEnabled, onSubmit }: BMISubmitButtonProps) {
	return (
		<button
			type="button"
			disabled={!isEnabled}
			onClick={onSubmit}
			className="flex w-full items-center justify-center rounded-lg bg-white px-6 py-4 text-base font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
		>
			{isEnabled ? "Continue with my plan" : "Fill in all fields to continue"}
		</button>
	);
}
