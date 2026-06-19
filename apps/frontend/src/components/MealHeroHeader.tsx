import { ArrowLeft, Share2, Trash2 } from "lucide-react";

type MealHeroAction =
	| {
			type: "share";
			onShare?: () => void;
	  }
	| {
			type: "status";
			status: "draft" | "saved";
			label: string;
	  }
	| {
			type: "delete";
			onDelete: () => void;
			disabled?: boolean;
			label?: string;
	  };

type MealHeroHeaderProps = {
	action: MealHeroAction;
	onBack: () => void;
	backLabel?: string;
};

export function MealHeroHeader({
	action,
	onBack,
	backLabel = "Back",
}: MealHeroHeaderProps) {
	return (
		<header className="relative z-10 flex items-start justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
			<button
				type="button"
				onClick={onBack}
				aria-label={backLabel}
				className="flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-95"
			>
				<ArrowLeft size={22} strokeWidth={2.4} />
			</button>

			{action.type === "share" ? (
				<button
					type="button"
					onClick={action.onShare}
					aria-label="Share"
					className="flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition active:scale-95"
				>
					<Share2 size={20} strokeWidth={2.2} />
				</button>
			) : action.type === "delete" ? (
				<button
					type="button"
					onClick={action.onDelete}
					disabled={action.disabled}
					aria-label={action.label ?? "Delete meal"}
					className="flex size-11 items-center justify-center rounded-full bg-red-500/20 text-red-100 backdrop-blur-md transition active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-700/60 disabled:text-neutral-400"
				>
					<Trash2 size={20} strokeWidth={2.2} />
				</button>
			) : (
				<span
					className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide backdrop-blur-md ${
						action.status === "saved"
							? "bg-emerald-500/20 text-emerald-200"
							: "bg-amber-500/20 text-amber-200"
					}`}
				>
					{action.label}
				</span>
			)}
		</header>
	);
}
