import { DAYS_IN_WEEK, WEEKDAY_LETTERS } from "@/constants/home";
import type { DayCell } from "@/types/home";

export function toIsoDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

export function startOfWeek(date: Date) {
	const start = startOfDay(date);
	const mondayOffset = (start.getDay() + 6) % DAYS_IN_WEEK;
	start.setDate(start.getDate() - mondayOffset);
	return start;
}

export function addDays(date: Date, days: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}

export function getMonthLabel(weekStart: Date) {
	const labelDate = addDays(weekStart, 3);

	return labelDate.toLocaleString(undefined, {
		month: "long",
		year: "numeric",
	});
}

export function buildWeek(
	today: Date,
	weekStart: Date,
	loggedDates: Set<string>,
): DayCell[] {
	const start = startOfDay(weekStart);
	const todayMidnight = startOfDay(today);

	return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
		const cell = addDays(start, i);
		const iso = toIsoDate(cell);
		const dayOfMonth = cell.getDate();
		const weekday = WEEKDAY_LETTERS[cell.getDay()] ?? "S";
		const isToday = cell.getTime() === todayMidnight.getTime();
		const hasMeal = loggedDates.has(iso);

		let status: DayCell["status"];
		if (isToday) {
			status = "today";
		} else if (hasMeal) {
			status = "completed";
		} else if (cell.getTime() < todayMidnight.getTime()) {
			status = "missed";
		} else {
			status = "future";
		}

		return { iso, weekday, dayOfMonth, status };
	});
}
