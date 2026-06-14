export type DayCellStatus = "completed" | "today" | "future" | "missed";

export type DayCell = {
	iso: string;
	weekday: string;
	dayOfMonth: number;
	status: DayCellStatus;
};

export type HomePageLocationState = {
	fromBmi?: boolean;
};

export type WeekTransitionDirection = "previous" | "next";
