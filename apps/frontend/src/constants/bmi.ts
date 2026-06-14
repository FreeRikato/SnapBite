import gainFemale from "@/assets/BMI_avatars/gain-female.png";
import gainMale from "@/assets/BMI_avatars/gain-male.png";
import leanFemale from "@/assets/BMI_avatars/lean-female.png";
import leanMale from "@/assets/BMI_avatars/lean-male.png";
import maintainFemale from "@/assets/BMI_avatars/maintain-female.png";
import maintainMale from "@/assets/BMI_avatars/maintain-male.png";
import type { Gender, Goal } from "@/types/bmi";

export const AVATAR_MAP: Record<Gender, Record<Goal, string>> = {
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

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
	{ value: "male", label: "Male" },
	{ value: "female", label: "Female" },
];

export const GOAL_OPTIONS: { value: Goal; label: string; sub: string }[] = [
	{ value: "lean", label: "Lean", sub: "Lose weight" },
	{ value: "maintain", label: "Maintain", sub: "Stay balanced" },
	{ value: "gain", label: "Gain", sub: "Build mass" },
];
