import { useLayoutEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import { BottomNav } from "@/components/BottomNav";
import { CaloriesLeftCard } from "@/components/CaloriesLeftCard";
import { HomeHeader } from "@/components/HomeHeader";
import { RecentlyUploadedList } from "@/components/RecentlyUploadedList";
import { WeekCalendarScroller } from "@/components/WeekCalendarScroller";
import { DAYS_IN_WEEK, FALLBACK_TARGET } from "@/constants/home";
import { useBMIStore, useHomeStore } from "@/store";
import type {
	HomePageLocationState,
	WeekTransitionDirection,
} from "@/types/home";
import { computeDailyCalories } from "@/utils/bmi";
import {
	addDays,
	buildWeek,
	getMonthLabel,
	startOfWeek,
	toIsoDate,
} from "@/utils/homeCalendar";

export default function HomePage() {
	const location = useLocation();
	const streak = useHomeStore((state) => state.streak);
	const consumed = useHomeStore((state) => state.consumed);
	const meals = useHomeStore((state) => state.meals);
	const setSelectedDate = useHomeStore((state) => state.setSelectedDate);

	const height = useBMIStore((state) => state.height);
	const weight = useBMIStore((state) => state.weight);
	const age = useBMIStore((state) => state.age);
	const gender = useBMIStore((state) => state.gender);
	const goal = useBMIStore((state) => state.goal);

	const target = useMemo(() => {
		const heightNum = parseFloat(height);
		const weightNum = parseFloat(weight);
		const ageNum = parseInt(age, 10);
		if (!gender || !goal) return FALLBACK_TARGET;
		const computed = computeDailyCalories({
			height: heightNum,
			weight: weightNum,
			age: ageNum,
			gender,
			goal,
		});
		return computed ?? FALLBACK_TARGET;
	}, [age, gender, goal, height, weight]);

	const today = useMemo(() => new Date(), []);
	const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
	const [weekTransitionDirection, setWeekTransitionDirection] =
		useState<WeekTransitionDirection>("next");
	const loggedDates = useMemo(
		() => new Set(meals.map((meal) => toIsoDate(new Date(meal.uploadedAt)))),
		[meals],
	);
	const monthLabel = useMemo(() => getMonthLabel(weekStart), [weekStart]);

	const days = useMemo(
		() => buildWeek(today, weekStart, loggedDates),
		[loggedDates, today, weekStart],
	);
	const routeState = location.state as HomePageLocationState | null;
	const shouldAnimateEntry = routeState?.fromBmi === true;
	const caloriesLeft = Math.max(0, target - consumed);

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	function showPreviousWeek() {
		setWeekTransitionDirection("previous");
		setWeekStart((current) => addDays(current, -DAYS_IN_WEEK));
	}

	function showNextWeek() {
		setWeekTransitionDirection("next");
		setWeekStart((current) => addDays(current, DAYS_IN_WEEK));
	}

	return (
		<main
			className={`flex min-h-dvh flex-col bg-neutral-950 pb-28 text-white ${
				shouldAnimateEntry ? "home-route-enter" : ""
			}`}
		>
			<HomeHeader streak={streak} monthLabel={monthLabel} />
			<WeekCalendarScroller
				days={days}
				transitionDirection={weekTransitionDirection}
				onSelect={setSelectedDate}
				onPreviousWeek={showPreviousWeek}
				onNextWeek={showNextWeek}
			/>
			<div className="flex flex-col gap-4 pt-2">
				<CaloriesLeftCard
					left={caloriesLeft}
					target={target}
					consumed={consumed}
				/>
				<RecentlyUploadedList meals={meals} />
			</div>
			<BottomNav onTakePhoto={() => window.alert("Take a photo")} />
		</main>
	);
}
