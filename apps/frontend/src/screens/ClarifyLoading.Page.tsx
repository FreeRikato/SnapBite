import { useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router";

import { ScreenHeader } from "@/components/ScreenHeader";

const CLARIFY_LOADING_MS = 3000;
const PROGRESS_SEGMENTS = [
	"question-step-1",
	"question-step-2",
	"question-step-3",
	"question-step-4",
	"question-step-5",
];

function SkeletonLine({ className }: { className: string }) {
	return (
		<div className={`animate-pulse rounded-full bg-white/10 ${className}`} />
	);
}

function SkeletonOption({ widthClass }: { widthClass: string }) {
	return (
		<li>
			<div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4">
				<div className="size-10 shrink-0 animate-pulse rounded-full bg-neutral-950" />
				<SkeletonLine className={`h-5 ${widthClass}`} />
				<div className="ml-auto size-6 shrink-0 animate-pulse rounded-full border border-white/15 bg-white/5" />
			</div>
		</li>
	);
}

export default function ClarifyLoadingPage() {
	const navigate = useNavigate();

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			navigate("/clarify", { replace: true });
		}, CLARIFY_LOADING_MS);

		return () => window.clearTimeout(timeoutId);
	}, [navigate]);

	return (
		<main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
			<ScreenHeader
				title="Question 1 of 5"
				subtitle="Preparing questions"
				onBack={() => navigate("/preview")}
			/>

			<div className="flex gap-2 px-4 pt-4" aria-hidden="true">
				{PROGRESS_SEGMENTS.map((segment, index) => (
					<div
						key={segment}
						className={`h-1 flex-1 rounded-full ${
							index === 0 ? "bg-white" : "bg-white/15"
						}`}
					/>
				))}
			</div>

			<section className="flex-1 px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))]">
				<div className="flex items-center gap-3">
					<div className="size-12 shrink-0 animate-pulse rounded-2xl bg-neutral-900" />
					<div className="flex flex-1 flex-col gap-3">
						<SkeletonLine className="h-7 w-4/5" />
						<SkeletonLine className="h-7 w-3/5" />
					</div>
				</div>

				<ul className="mt-6 flex flex-col gap-3" aria-label="Loading questions">
					<SkeletonOption widthClass="w-2/3" />
					<SkeletonOption widthClass="w-3/4" />
					<SkeletonOption widthClass="w-1/2" />
					<SkeletonOption widthClass="w-4/5" />
					<SkeletonOption widthClass="w-3/5" />
				</ul>
			</section>

			<footer className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-3 border-t border-white/10 bg-neutral-950/90 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
				<div className="h-14 w-28 animate-pulse rounded-full bg-neutral-900" />
				<div className="h-14 flex-1 animate-pulse rounded-full bg-white/10" />
			</footer>
		</main>
	);
}
