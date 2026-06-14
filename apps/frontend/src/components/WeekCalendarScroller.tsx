import { type PointerEvent, useRef } from "react";

import { DayPill } from "@/components/DayPill";
import type { DayCell, WeekTransitionDirection } from "@/types/home";

type WeekCalendarScrollerProps = {
	days: DayCell[];
	transitionDirection: WeekTransitionDirection;
	onSelect: (iso: string) => void;
	onPreviousWeek: () => void;
	onNextWeek: () => void;
};

export function WeekCalendarScroller({
	days,
	transitionDirection,
	onSelect,
	onPreviousWeek,
	onNextWeek,
}: WeekCalendarScrollerProps) {
	const dragStartX = useRef<number | null>(null);
	const ignoreNextClick = useRef(false);

	function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
		dragStartX.current = event.clientX;
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
		if (dragStartX.current === null) return;

		const dragDistance = event.clientX - dragStartX.current;
		dragStartX.current = null;

		if (Math.abs(dragDistance) < 44) return;

		ignoreNextClick.current = true;
		window.setTimeout(() => {
			ignoreNextClick.current = false;
		}, 0);

		if (dragDistance < 0) onNextWeek();
		else onPreviousWeek();
	}

	function handlePointerCancel() {
		dragStartX.current = null;
	}

	function handleSelect(iso: string) {
		if (ignoreNextClick.current) return;
		onSelect(iso);
	}

	const weekKey = days.map((day) => day.iso).join("-");

	return (
		<div
			className="w-full touch-pan-y select-none overflow-hidden px-4 py-2"
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerCancel}
		>
			<div
				key={weekKey}
				className="week-strip flex justify-between gap-2"
				data-direction={transitionDirection}
			>
				{days.map((day) => (
					<DayPill
						key={day.iso}
						weekday={day.weekday}
						dayOfMonth={day.dayOfMonth}
						status={day.status}
						onClick={() => handleSelect(day.iso)}
					/>
				))}
			</div>
		</div>
	);
}
