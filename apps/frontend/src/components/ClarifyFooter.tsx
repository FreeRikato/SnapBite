import { ArrowLeft, ArrowRight } from "lucide-react";

type ClarifyFooterProps = {
	canAdvance: boolean;
	isLast: boolean;
	onBack: () => void;
	onNext: () => void;
};

export function ClarifyFooter({
	canAdvance,
	isLast,
	onBack,
	onNext,
}: ClarifyFooterProps) {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-3 border-t border-white/10 bg-neutral-950/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
			<button
				type="button"
				onClick={onBack}
				className="flex h-14 items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 text-base font-semibold text-neutral-200 transition active:scale-[0.98]"
			>
				<ArrowLeft size={20} strokeWidth={2.4} />
				Back
			</button>
			<button
				type="button"
				disabled={!canAdvance}
				onClick={onNext}
				className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-white text-base font-semibold text-neutral-950 shadow-2xl shadow-black/40 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
			>
				{isLast ? "Review answers" : "Next"}
				<ArrowRight size={20} strokeWidth={2.4} />
			</button>
		</footer>
	);
}
