import { Check } from "lucide-react";
import { type ReactNode, useId } from "react";

type BottomSheetProps = {
	open: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
	onConfirm?: () => void;
	panelClassName?: string;
};

/**
 * Dark dismissible bottom-sheet shell. Tap the dimmed backdrop to close.
 * Pass `onConfirm` to render the white check action in the header.
 */
export function BottomSheet({
	open,
	title,
	onClose,
	children,
	onConfirm,
	panelClassName = "",
}: BottomSheetProps) {
	const titleId = useId();

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-30 flex flex-col">
			<button
				type="button"
				aria-label="Close"
				onClick={onClose}
				className="flex-1 cursor-default bg-black/60"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onMouseDown={(event) => {
					const target = event.target as HTMLElement;
					if (!target.closest("input, textarea, button, select")) {
						event.preventDefault();
					}
				}}
				className={`flex flex-col rounded-t-3xl border-t border-white/10 bg-neutral-900 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${panelClassName}`}
			>
				<div className="flex items-center justify-between">
					<h2
						id={titleId}
						className="text-base font-semibold tracking-tight text-white"
					>
						{title}
					</h2>
					{onConfirm && (
						<button
							type="button"
							onClick={onConfirm}
							aria-label="Save"
							className="flex size-11 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg shadow-black/30 transition active:scale-95"
						>
							<Check size={20} strokeWidth={2.6} />
						</button>
					)}
				</div>
				{children}
			</div>
		</div>
	);
}
