import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { BMIAvatarPreview } from "@/components/BMIAvatarPreview";
import { BMIFormCard } from "@/components/BMIFormCard";
import { BMIPageHeader } from "@/components/BMIPageHeader";
import { BMIResultsCard } from "@/components/BMIResultsCard";
import { BMISubmitButton } from "@/components/BMISubmitButton";
import { AVATAR_MAP } from "@/constants/bmi";
import { useBMIStore } from "@/store";
import { getBmiCategory, getCalorieModeInfo } from "@/utils/bmi";

type BMIPageLocationState = {
	showBackButton?: boolean;
};

export default function BMIPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const [isCalorieModeTooltipOpen, setIsCalorieModeTooltipOpen] =
		useState(false);
	const height = useBMIStore((state) => state.height);
	const weight = useBMIStore((state) => state.weight);
	const age = useBMIStore((state) => state.age);
	const gender = useBMIStore((state) => state.gender);
	const goal = useBMIStore((state) => state.goal);
	const setHeight = useBMIStore((state) => state.setHeight);
	const setWeight = useBMIStore((state) => state.setWeight);
	const setAge = useBMIStore((state) => state.setAge);
	const setGender = useBMIStore((state) => state.setGender);
	const setGoal = useBMIStore((state) => state.setGoal);

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
	const routeState = location.state as BMIPageLocationState | null;
	const isBackButtonVisible =
		routeState?.showBackButton === true || searchParams.get("mode") === "edit";

	const handleSubmit = () => {
		// hook up to your submit logic
		navigate("/");
	};

	return (
		<div className="flex min-h-dvh w-full justify-center bg-neutral-950 px-4 py-6 text-white sm:px-6 sm:py-10">
			<div className="flex w-full max-w-md flex-col gap-5 sm:max-w-2xl sm:gap-6">
				<BMIPageHeader
					isBackButtonVisible={isBackButtonVisible}
					onBack={() => navigate("/")}
				/>

				<BMIFormCard
					height={height}
					weight={weight}
					age={age}
					gender={gender}
					goal={goal}
					onHeightChange={setHeight}
					onWeightChange={setWeight}
					onAgeChange={setAge}
					onGenderChange={setGender}
					onGoalChange={setGoal}
				/>

				{(bmi !== null || dailyCalories !== null) && (
					<BMIResultsCard
						bmi={bmi}
						bmiInfo={bmiInfo}
						dailyCalories={dailyCalories}
						calorieModeInfo={calorieModeInfo}
						isCalorieModeTooltipOpen={isCalorieModeTooltipOpen}
						onCalorieModeTooltipOpenChange={setIsCalorieModeTooltipOpen}
					/>
				)}

				{allFilled && selectedAvatar && gender && goal && (
					<BMIAvatarPreview
						avatar={selectedAvatar}
						gender={gender}
						goal={goal}
					/>
				)}

				<BMISubmitButton isEnabled={allFilled} onSubmit={handleSubmit} />
			</div>
		</div>
	);
}
