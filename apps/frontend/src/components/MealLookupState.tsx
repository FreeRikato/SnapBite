import { ArrowLeft } from "lucide-react";

type MealLookupStateProps = {
	title: string;
	description?: string;
	onBack: () => void;
};

export function MealLookupState({
	title,
	description,
	onBack,
}: MealLookupStateProps) {
	return (
		<main className="flex min-h-dvh flex-col bg-neutral-950 px-4 py-6 text-white">
			<button
				type="button"
				onClick={onBack}
				className="flex size-11 items-center justify-center rounded-full bg-neutral-900 text-white transition active:scale-95"
				aria-label="Back to home"
			>
				<ArrowLeft size={22} strokeWidth={2.4} />
			</button>
			<div className="flex flex-1 flex-col items-center justify-center text-center">
				<h1 className="text-lg font-semibold">{title}</h1>
				{description && (
					<p className="mt-2 max-w-xs text-sm text-neutral-500">
						{description}
					</p>
				)}
			</div>
		</main>
	);
}
