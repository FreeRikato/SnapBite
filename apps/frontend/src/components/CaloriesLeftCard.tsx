import { CalorieDonut } from "@/components/CalorieDonut";

type CaloriesLeftCardProps = {
	left: number;
	target: number;
	consumed: number;
};

export function CaloriesLeftCard({
	left,
	target,
	consumed,
}: CaloriesLeftCardProps) {
	return (
		<section className="mx-4 flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-neutral-900/90 p-5 shadow-2xl shadow-black/30">
			<div className="flex flex-col gap-1">
				<span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
					Calories left
				</span>
				<span className="text-5xl font-bold text-white">{left}</span>
			</div>
			<CalorieDonut consumed={consumed} target={target} />
		</section>
	);
}
