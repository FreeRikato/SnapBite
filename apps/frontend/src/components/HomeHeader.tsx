import { Flame } from "lucide-react";

type HomeHeaderProps = {
	streak: number;
	monthLabel: string;
};

export function HomeHeader({ streak, monthLabel }: HomeHeaderProps) {
	return (
		<div className="flex flex-col gap-4 px-4 pt-6 pb-2">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-bold tracking-tight text-white">
					SnapBite
				</h1>
				<div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-neutral-900/90 px-3 py-1.5 text-sm font-semibold text-white">
					<Flame size={14} className="text-orange-400" />
					<span>{streak}</span>
				</div>
			</header>
			<p
				key={monthLabel}
				className="month-label-transition text-sm font-medium text-neutral-400"
			>
				{monthLabel}
			</p>
		</div>
	);
}
