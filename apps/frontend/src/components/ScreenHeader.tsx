import { ArrowLeft } from "lucide-react";

type ScreenHeaderProps = {
	title: string;
	subtitle: string;
	onBack: () => void;
};

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
	return (
		<header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-neutral-950/90 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
			<button
				type="button"
				onClick={onBack}
				aria-label="Back"
				className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-neutral-900 text-white transition active:scale-95"
			>
				<ArrowLeft size={22} strokeWidth={2.2} />
			</button>
			<div className="flex flex-1 flex-col items-center">
				<h1 className="text-base font-semibold tracking-tight text-white">
					{title}
				</h1>
				<span className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
					{subtitle}
				</span>
			</div>
			<div className="size-11" aria-hidden="true" />
		</header>
	);
}
