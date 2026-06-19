import { Check } from "lucide-react";

type ClarifyReviewFooterProps = {
	onAccept: () => void;
	onReject: () => void;
};

export function ClarifyReviewFooter({
	onAccept,
	onReject,
}: ClarifyReviewFooterProps) {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-10 flex flex-col gap-2 border-t border-white/10 bg-neutral-950/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
			<button
				type="button"
				onClick={onAccept}
				className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-semibold text-neutral-950 shadow-2xl shadow-black/40 transition active:scale-[0.98]"
			>
				<Check size={20} strokeWidth={2.6} />
				Looks good, analyze
			</button>
			<button
				type="button"
				onClick={onReject}
				className="flex h-12 w-full items-center justify-center rounded-full bg-neutral-900 text-base font-semibold text-neutral-300 transition active:scale-[0.98]"
			>
				Edit my answers
			</button>
		</footer>
	);
}
