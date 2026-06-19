import { api } from "@repo/convex/convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import { BottomNav } from "@/components/BottomNav";
import { CaloriesLeftCard } from "@/components/CaloriesLeftCard";
import { HomeHeader } from "@/components/HomeHeader";
import { RecentlyUploadedList } from "@/components/RecentlyUploadedList";
import { WeekCalendarScroller } from "@/components/WeekCalendarScroller";
import { DAYS_IN_WEEK, FALLBACK_TARGET } from "@/constants/home";
import { hydrateMealLocalPhotoUrls, mealRecordToMeal } from "@/lib/mealRecords";
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
	const selectedDate = useHomeStore((state) => state.selectedDate);
	const setSelectedDate = useHomeStore((state) => state.setSelectedDate);
	const recentMealRecords = useQuery(api.meals.listRecent, { limit: 40 });
	const pendingMeals = useHomeStore((state) => state.pendingMeals);
	const cachedRecentMeals = useHomeStore((state) => state.recentMeals);
	const setRecentMeals = useHomeStore((state) => state.setRecentMeals);

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
	const freshMeals = useMemo(
		() => recentMealRecords?.map(mealRecordToMeal) ?? [],
		[recentMealRecords],
	);
	const meals =
		recentMealRecords === undefined ? cachedRecentMeals : freshMeals;
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
	const consumed = useMemo(
		() =>
			meals
				.filter(
					(meal) =>
						meal.status === "saved" &&
						toIsoDate(new Date(meal.uploadedAt)) === selectedDate,
				)
				.reduce((total, meal) => total + meal.kcal, 0),
		[meals, selectedDate],
	);
	const caloriesLeft = Math.max(0, target - consumed);

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	useEffect(() => {
		if (!recentMealRecords) return;
		setRecentMeals(freshMeals);
	}, [freshMeals, recentMealRecords, setRecentMeals]);

	useEffect(() => {
		if (cachedRecentMeals.length === 0) return;

		let active = true;
		hydrateMealLocalPhotoUrls(cachedRecentMeals).then((hydratedMeals) => {
			const changed = hydratedMeals.some((meal, index) => {
				const current = cachedRecentMeals[index];
				return (
					current &&
					(meal.thumbnail !== current.thumbnail ||
						meal.photos.some(
							(photo, photoIndex) => photo !== current.photos[photoIndex],
						))
				);
			});

			if (active && changed) {
				setRecentMeals(hydratedMeals);
			}
		});

		return () => {
			active = false;
		};
	}, [cachedRecentMeals, setRecentMeals]);

	function showPreviousWeek() {
		setWeekTransitionDirection("previous");
		setWeekStart((current) => addDays(current, -DAYS_IN_WEEK));
	}

	function showNextWeek() {
		setWeekTransitionDirection("next");
		setWeekStart((current) => addDays(current, DAYS_IN_WEEK));
	}

	return (
		<>
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
					<RecentlyUploadedList meals={meals} pendingMeals={pendingMeals} />
				</div>
			</main>
			<BottomNav />
		</>
	);
}
