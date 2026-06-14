import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import gainFemale from "../assets/BMI_avatars/gain-female.png";
import gainMale from "../assets/BMI_avatars/gain-male.png";
import leanFemale from "../assets/BMI_avatars/lean-female.png";
import leanMale from "../assets/BMI_avatars/lean-male.png";
import maintainFemale from "../assets/BMI_avatars/maintain-female.png";
import maintainMale from "../assets/BMI_avatars/maintain-male.png";

type Gender = "male" | "female";
type Goal = "lean" | "maintain" | "gain";

const AVATAR_MAP: Record<Gender, Record<Goal, string>> = {
	male: {
		lean: leanMale,
		maintain: maintainMale,
		gain: gainMale,
	},
	female: {
		lean: leanFemale,
		maintain: maintainFemale,
		gain: gainFemale,
	},
};

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
];

const GOAL_OPTIONS: { value: Goal; label: string; sub: string }[] = [
	{ value: "lean", label: "Lean", sub: "Lose weight" },
	{ value: "maintain", label: "Maintain", sub: "Stay balanced" },
	{ value: "gain", label: "Gain", sub: "Build mass" },
];

function getBmiCategory(bmi: number): { label: string; color: string } {
	if (bmi < 18.5) return { label: "Underweight", color: "text-sky-600" };
	if (bmi < 25) return { label: "Healthy", color: "text-emerald-600" };
	if (bmi < 30) return { label: "Overweight", color: "text-amber-600" };
	return { label: "Obese", color: "text-rose-600" };
}

function getCalorieModeInfo(goal: Goal | null): {
	label: string;
	description: string;
} {
	if (goal === "lean") {
		return {
			label: "Deficit",
			description:
				"Your target is below estimated maintenance calories to support weight loss.",
		};
	}
	if (goal === "gain") {
		return {
			label: "Surplus",
			description:
				"Your target is above estimated maintenance calories to support weight gain.",
		};
	}
	return {
		label: "Maintenance",
		description:
			"Your target is near estimated maintenance calories to help keep weight stable.",
	};
}

export default function BMIPage() {
	const navigate = useNavigate();
	const [height, setHeight] = useState<string>("");
	const [weight, setWeight] = useState<string>("");
	const [age, setAge] = useState<string>("");
	const [gender, setGender] = useState<Gender | null>(null);
	const [goal, setGoal] = useState<Goal | null>(null);
	const [isCalorieModeTooltipOpen, setIsCalorieModeTooltipOpen] =
		useState(false);

	const heightNum = parseFloat(height);
	const weightNum = parseFloat(weight);
	const ageNum = parseInt(age, 10);

	const bmi = useMemo(() => {
		if (!heightNum || !weightNum || heightNum <= 0) return null;
		const meters = heightNum / 100;
		return weightNum / (meters * meters);
	}, [heightNum, weightNum]);

	const dailyCalories = useMemo(() => {
		if (!bmi || !ageNum || !gender) return null;
		// Mifflin-St Jeor BMR
		const bmr =
			10 * weightNum +
			6.25 * heightNum -
			5 * ageNum +
			(gender === "male" ? 5 : -161);
		// Lightly active multiplier
		const tdee = bmr * 1.4;
		if (goal === "lean") return Math.round(tdee - 500);
		if (goal === "gain") return Math.round(tdee + 500);
		return Math.round(tdee);
	}, [bmi, ageNum, gender, goal, heightNum, weightNum]);

	const allFilled =
		heightNum > 0 &&
		weightNum > 0 &&
		ageNum > 0 &&
		gender !== null &&
		goal !== null;

	const selectedAvatar = gender && goal ? AVATAR_MAP[gender][goal] : null;
	const bmiInfo = bmi ? getBmiCategory(bmi) : null;
	const calorieModeInfo = getCalorieModeInfo(goal);

	const handleSubmit = () => {
		// hook up to your submit logic
		navigate("/");
	};

	return (
		<div className="flex min-h-dvh w-full justify-center bg-neutral-50 px-4 py-6 sm:px-6 sm:py-10">
			<div className="flex w-full max-w-md flex-col gap-5 sm:max-w-2xl sm:gap-6">
				{/* Header */}
				<header className="flex flex-col gap-2">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="self-start rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-white"
					>
						← Back
					</button>
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
						Plan details
					</h1>
					<p className="text-sm text-neutral-500 sm:text-base">
						Update your measurements, goal, and daily calorie target anytime.
					</p>
				</header>

				{/* Inputs card */}
				<section className="flex flex-col gap-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 sm:rounded-3xl sm:p-7">
					{/* Height / Weight / Age grid */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<NumberField
							label="Height"
							unit="cm"
							value={height}
							onChange={setHeight}
							placeholder="175"
						/>
						<NumberField
							label="Weight"
							unit="kg"
							value={weight}
							onChange={setWeight}
							placeholder="70"
						/>
						<NumberField
							label="Age"
							unit="yrs"
							value={age}
							onChange={setAge}
							placeholder="25"
						/>
					</div>

					{/* Gender selector */}
					<div className="flex flex-col gap-2">
						<span className="text-sm font-medium text-neutral-700">Gender</span>
						<div className="flex w-full gap-2 rounded-2xl bg-neutral-100 p-1">
							{GENDER_OPTIONS.map((opt) => {
								const active = gender === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => setGender(opt.value)}
										className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
											active
												? "bg-white text-neutral-900 shadow-sm"
												: "text-neutral-500 hover:text-neutral-700"
										}`}
									>
										{opt.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Goal selector */}
					<div className="flex flex-col gap-2">
						<span className="text-sm font-medium text-neutral-700">Goal</span>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
							{GOAL_OPTIONS.map((opt) => {
								const active = goal === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => setGoal(opt.value)}
										className={`flex flex-col items-start gap-0.5 rounded-2xl border px-4 py-3 text-left transition ${
											active
												? "border-neutral-900 bg-neutral-900 text-white"
												: "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
										}`}
									>
										<span className="text-sm font-semibold">{opt.label}</span>
										<span
											className={`text-xs ${active ? "text-neutral-300" : "text-neutral-400"}`}
										>
											{opt.sub}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</section>

				{/* BMI + calorie result */}
				{(bmi !== null || dailyCalories !== null) && (
					<section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 sm:rounded-3xl sm:p-7">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-neutral-500">
								Your BMI
							</span>
							{bmiInfo && (
								<span className={`text-sm font-semibold ${bmiInfo.color}`}>
									{bmiInfo.label}
								</span>
							)}
						</div>
						<div className="flex items-baseline gap-2">
							<span className="text-5xl font-bold tracking-tight text-neutral-900">
								{bmi !== null ? bmi.toFixed(1) : "—"}
							</span>
							<span className="text-sm text-neutral-400">kg/m²</span>
						</div>
						{/* BMI scale bar */}
						<div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100">
							<div className="absolute inset-y-0 left-0 w-1/4 bg-sky-400" />
							<div className="absolute inset-y-0 left-1/4 w-1/4 bg-emerald-400" />
							<div className="absolute inset-y-0 left-2/4 w-1/4 bg-amber-400" />
							<div className="absolute inset-y-0 left-3/4 w-1/4 bg-rose-400" />
							{bmi !== null && (
								<div
									className="absolute -top-1 h-4 w-1 rounded-full bg-neutral-900 transition-all"
									style={{
										left: `${Math.min(100, Math.max(0, (bmi / 40) * 100))}%`,
									}}
								/>
							)}
						</div>
						<div className="flex justify-between text-[10px] uppercase tracking-wide text-neutral-400">
							<span>18.5</span>
							<span>25</span>
							<span>30</span>
							<span>40</span>
						</div>

						{/* Calorie target */}
						{dailyCalories !== null && (
							<div className="mt-2 flex items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3">
								<div className="flex flex-col">
									<span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
										Daily calorie target
									</span>
									<span className="text-2xl font-bold text-neutral-900">
										{dailyCalories.toLocaleString()} kcal
									</span>
								</div>
								<div className="relative flex shrink-0 items-center">
									<button
										type="button"
										aria-describedby="calorie-mode-tooltip"
										aria-expanded={isCalorieModeTooltipOpen}
										className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200 transition hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
										onClick={() => setIsCalorieModeTooltipOpen(true)}
										onMouseEnter={() => setIsCalorieModeTooltipOpen(true)}
										onMouseLeave={() => setIsCalorieModeTooltipOpen(false)}
										onFocus={() => setIsCalorieModeTooltipOpen(true)}
										onBlur={() => setIsCalorieModeTooltipOpen(false)}
										onKeyDown={(event) => {
											if (event.key === "Escape") {
												setIsCalorieModeTooltipOpen(false);
												event.currentTarget.blur();
											}
										}}
									>
										{calorieModeInfo.label}
									</button>
									{isCalorieModeTooltipOpen && (
										<div
											id="calorie-mode-tooltip"
											role="tooltip"
											className="absolute right-0 bottom-full z-10 mb-2 w-56 max-w-[calc(100vw-3rem)] rounded-xl bg-neutral-900 px-3 py-2 text-left text-xs leading-relaxed font-medium text-white shadow-lg ring-1 ring-neutral-800 before:absolute before:top-full before:right-5 before:h-2 before:w-2 before:-translate-y-1/2 before:rotate-45 before:bg-neutral-900"
										>
											{calorieModeInfo.description}
										</div>
									)}
								</div>
							</div>
						)}
					</section>
				)}

				{/* Avatar preview */}
				{allFilled && selectedAvatar && gender && goal && (
					<section className="flex flex-col items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 sm:rounded-3xl sm:p-7">
						<span className="text-sm font-medium text-neutral-500">
							Your coach
						</span>
						<div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-transparent sm:h-56 sm:w-56">
							<img
								src={selectedAvatar}
								alt={`${gender} ${goal} avatar`}
								className="h-full w-full object-contain"
							/>
						</div>
						<p className="text-center text-sm text-neutral-500">
							{capitalize(gender)} · {capitalize(goal)} goal
						</p>
					</section>
				)}

				{/* Submit */}
				<button
					type="button"
					disabled={!allFilled}
					onClick={handleSubmit}
					className="flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
				>
					{allFilled
						? "Continue with my plan"
						: "Fill in all fields to continue"}
				</button>
			</div>
		</div>
	);
}

function NumberField({
	label,
	unit,
	value,
	onChange,
	placeholder,
}: {
	label: string;
	unit: string;
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
}) {
	return (
		<label className="flex flex-col gap-2">
			<span className="text-sm font-medium text-neutral-700">{label}</span>
			<div className="flex items-center rounded-2xl border border-neutral-200 bg-white px-4 py-3 focus-within:border-neutral-900">
				<input
					type="number"
					inputMode="decimal"
					min="0"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className="w-full bg-transparent text-base font-semibold text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
				/>
				<span className="ml-2 text-xs font-medium text-neutral-400">
					{unit}
				</span>
			</div>
		</label>
	);
}

function capitalize(s: string) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}
