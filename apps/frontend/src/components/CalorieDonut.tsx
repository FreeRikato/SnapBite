type CalorieDonutProps = {
	consumed: number;
	target: number;
	size?: number;
	stroke?: number;
};

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CalorieDonut({
	consumed,
	target,
	size = 96,
	stroke = 10,
}: CalorieDonutProps) {
	const safeTarget = target > 0 ? target : 1;
	const ratio = Math.min(1, Math.max(0, consumed / safeTarget));
	const dashOffset = CIRCUMFERENCE * (1 - ratio);
	const percent = Math.round(ratio * 100);

	return (
		<div
			className="relative shrink-0"
			style={{ width: size, height: size }}
			role="img"
			aria-label={`${percent}% of daily calories consumed`}
		>
			<svg
				viewBox="0 0 100 100"
				className="size-full -rotate-90"
				aria-hidden="true"
			>
				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					strokeWidth={stroke}
					className="stroke-neutral-800"
				/>
				<circle
					cx="50"
					cy="50"
					r={RADIUS}
					fill="none"
					strokeWidth={stroke}
					stroke="#2F80ED"
					strokeLinecap="round"
					strokeDasharray={CIRCUMFERENCE}
					strokeDashoffset={dashOffset}
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-sm font-semibold text-white">{percent}%</span>
			</div>
		</div>
	);
}
