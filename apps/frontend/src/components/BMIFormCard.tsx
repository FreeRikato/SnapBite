import { NumberField } from "@/components/NumberField";
import { GENDER_OPTIONS, GOAL_OPTIONS } from "@/constants/bmi";
import type { Gender, Goal } from "@/types/bmi";

type BMIFormCardProps = {
	height: string;
	weight: string;
	age: string;
	gender: Gender | null;
	goal: Goal | null;
	onHeightChange: (value: string) => void;
	onWeightChange: (value: string) => void;
	onAgeChange: (value: string) => void;
	onGenderChange: (value: Gender) => void;
	onGoalChange: (value: Goal) => void;
};

export function BMIFormCard({
	height,
	weight,
	age,
	gender,
	goal,
	onHeightChange,
	onWeightChange,
	onAgeChange,
	onGenderChange,
	onGoalChange,
}: BMIFormCardProps) {
	return (
		<section className="flex flex-col gap-5 rounded-lg border border-white/10 bg-neutral-900/90 p-4 shadow-2xl shadow-black/30 sm:p-7">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<NumberField
					label="Height"
					unit="cm"
					value={height}
					onChange={onHeightChange}
					placeholder="175"
				/>
				<NumberField
					label="Weight"
					unit="kg"
					value={weight}
					onChange={onWeightChange}
					placeholder="70"
				/>
				<NumberField
					label="Age"
					unit="yrs"
					value={age}
					onChange={onAgeChange}
					placeholder="25"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-neutral-200">Gender</span>
				<div className="flex w-full gap-2 rounded-lg bg-neutral-950 p-1">
					{GENDER_OPTIONS.map((option) => {
						const active = gender === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => onGenderChange(option.value)}
								className={`flex-1 rounded-md px-4 py-3 text-sm font-medium transition ${
									active
										? "bg-white text-neutral-950 shadow-sm"
										: "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
								}`}
							>
								{option.label}
							</button>
						);
					})}
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<span className="text-sm font-medium text-neutral-200">Goal</span>
				<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
					{GOAL_OPTIONS.map((option) => {
						const active = goal === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => onGoalChange(option.value)}
								className={`flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition ${
									active
										? "border-white bg-white text-neutral-950"
										: "border-white/10 bg-neutral-950/60 text-neutral-200 hover:border-white/20 hover:bg-white/5"
								}`}
							>
								<span className="text-sm font-semibold">{option.label}</span>
								<span
									className={`text-xs ${active ? "text-neutral-700" : "text-neutral-500"}`}
								>
									{option.sub}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
