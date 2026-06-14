import type { Gender, Goal } from "@/types/bmi";
import { capitalize } from "@/utils/bmi";

type BMIAvatarPreviewProps = {
	avatar: string;
	gender: Gender;
	goal: Goal;
};

export function BMIAvatarPreview({
	avatar,
	gender,
	goal,
}: BMIAvatarPreviewProps) {
	return (
		<section className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-neutral-900/90 p-4 shadow-2xl shadow-black/30 sm:p-7">
			<span className="text-sm font-medium text-neutral-400">Your coach</span>
			<div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-white sm:h-56 sm:w-56">
				<img
					src={avatar}
					alt={`${gender} ${goal} avatar`}
					className="h-full w-full object-contain"
				/>
			</div>
			<p className="text-center text-sm text-neutral-400">
				{capitalize(gender)} · {capitalize(goal)} goal
			</p>
		</section>
	);
}
