import { api } from "@repo/convex/convex/_generated/api";
import type { Id } from "@repo/convex/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import { deleteMealPhotos } from "@/lib/mealPhotoUpload";
import type { Meal } from "@/store";
import { useHomeStore } from "@/store";

type MealCardProps = {
	meal: Meal;
	showStatusLabel?: boolean;
};

const DELETE_BUTTON_WIDTH = 76;
const SWIPE_THRESHOLD = 40;

function formatTime(iso: string) {
	const date = new Date(iso);
	return date.toLocaleTimeString(undefined, {
		hour: "numeric",
		minute: "2-digit",
	});
}

function MealCardSkeleton({
	meal,
	showStatusLabel,
}: {
	meal: Meal;
	showStatusLabel: boolean;
}) {
	const hasError = !!meal.error;
	const progress = meal.progress ?? 0;
	const pct = `${Math.round(progress * 100)}%`;

	return (
		<div
			className={`relative flex w-full items-center gap-3 overflow-hidden rounded-lg border p-3 text-left ${
				hasError
					? "border-red-500/30 bg-neutral-900/90"
					: "border-white/10 bg-neutral-900/90"
			}`}
		>
			<div className="relative size-14 shrink-0 overflow-hidden rounded-md">
				<img
					src={meal.thumbnail}
					alt=""
					className="size-14 rounded-md object-cover opacity-40"
				/>
				{!hasError && (
					<div className="absolute inset-0 animate-pulse rounded-md bg-white/5" />
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-2">
				<div className="h-3 w-28 animate-pulse rounded-full bg-white/15" />
				<div className="h-2.5 w-16 animate-pulse rounded-full bg-white/8" />
			</div>
			<div className="flex flex-col items-end gap-1.5">
				{showStatusLabel && (
					<span
						className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
							hasError
								? "bg-red-500/15 text-red-300"
								: "bg-white/10 text-white/40"
						}`}
					>
						{hasError ? "Failed" : "Uploading"}
					</span>
				)}
				<span className="text-sm font-semibold text-white">
					{meal.kcal} kcal
				</span>
			</div>

			{!hasError && (
				<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/8">
					<div
						className="h-full bg-white/50 transition-[width] duration-300 ease-out"
						style={{ width: pct }}
					/>
				</div>
			)}
		</div>
	);
}

export function MealCard({ meal, showStatusLabel = true }: MealCardProps) {
	const navigate = useNavigate();
	const baseRemoveMeal = useMutation(api.meals.remove);
	const removeMeal =
		typeof baseRemoveMeal.withOptimisticUpdate === "function"
			? baseRemoveMeal.withOptimisticUpdate((localStore, args) => {
					const recent = localStore.getQuery(api.meals.listRecent, {
						limit: 40,
					});
					if (recent) {
						localStore.setQuery(
							api.meals.listRecent,
							{ limit: 40 },
							recent.filter((record) => record._id !== args.id),
						);
					}
					localStore.setQuery(api.meals.getById, { id: args.id }, null);
				})
			: baseRemoveMeal;
	const removeCachedMeal = useHomeStore((state) => state.removeCachedMeal);
	const upsertCachedMeals = useHomeStore((state) => state.upsertCachedMeals);

	const [offset, setOffset] = useState(0);
	const [isRevealed, setIsRevealed] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const touchStartX = useRef(0);
	const touchStartY = useRef(0);
	const swipeDirection = useRef<"horizontal" | "vertical" | null>(null);

	if (meal.pending) {
		return <MealCardSkeleton meal={meal} showStatusLabel={showStatusLabel} />;
	}

	function handleTouchStart(e: React.TouchEvent) {
		touchStartX.current = e.touches[0].clientX;
		touchStartY.current = e.touches[0].clientY;
		swipeDirection.current = null;
	}

	function handleTouchMove(e: React.TouchEvent) {
		const dx = e.touches[0].clientX - touchStartX.current;
		const dy = e.touches[0].clientY - touchStartY.current;

		if (swipeDirection.current === null) {
			if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
			swipeDirection.current =
				Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
			if (swipeDirection.current === "horizontal") setIsDragging(true);
		}

		if (swipeDirection.current !== "horizontal") return;

		e.preventDefault();
		const base = isRevealed ? -DELETE_BUTTON_WIDTH : 0;
		setOffset(Math.min(0, Math.max(base + dx, -DELETE_BUTTON_WIDTH)));
	}

	function handleTouchEnd() {
		setIsDragging(false);
		if (swipeDirection.current !== "horizontal") return;

		if (offset <= -SWIPE_THRESHOLD) {
			setIsRevealed(true);
			setOffset(-DELETE_BUTTON_WIDTH);
		} else {
			setIsRevealed(false);
			setOffset(0);
		}
	}

	function handleCardClick() {
		if (isRevealed) {
			setIsRevealed(false);
			setOffset(0);
			return;
		}
		navigate(`/meals/${meal.id}`);
	}

	async function handleDelete() {
		if (isDeleting) return;
		setIsDeleting(true);
		const debugId = `delete-meal-card-${meal.id}`;

		const photoKeys = Array.from(
			new Set([...(meal.photoKeys ?? []), meal.thumbnailKey]),
		).filter((key): key is string => Boolean(key));

		console.info("[SnapBite delete]", "meal card delete started", {
			debugId,
			mealId: meal.id,
			photoKeyCount: photoKeys.length,
			photoKeys,
		});
		removeCachedMeal(meal.id);

		try {
			if (photoKeys.length > 0) {
				await deleteMealPhotos({ keys: photoKeys, debugId });
			}
			console.info("[SnapBite delete]", "meal card removing Convex meal", {
				debugId,
				mealId: meal.id,
			});
			const result = await removeMeal({ id: meal.id as Id<"meals"> });
			console.info("[SnapBite delete]", "meal card Convex remove result", {
				debugId,
				mealId: meal.id,
				deleted: result.deleted,
				photoKeyCount: result.photoKeys.length,
				photoKeys: result.photoKeys,
			});
		} catch (err) {
			console.error("[SnapBite delete]", "meal card delete failed", {
				debugId,
				mealId: meal.id,
				err,
			});
			upsertCachedMeals([meal]);
			setIsDeleting(false);
			setIsRevealed(false);
			setOffset(0);
		}
	}

	const statusLabel = meal.status === "saved" ? "Saved" : "Draft";

	return (
		<div
			className="relative overflow-hidden rounded-lg"
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			<div className="absolute inset-y-0 right-0 flex w-[76px] items-center justify-center bg-red-600">
				{isDeleting ? (
					<div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
				) : (
					<button
						type="button"
						onClick={handleDelete}
						aria-label="Delete meal"
						className="flex h-full w-full items-center justify-center"
					>
						<Trash2 size={20} className="text-white" />
					</button>
				)}
			</div>

			<button
				type="button"
				onClick={handleCardClick}
				style={{
					transform: `translateX(${offset}px)`,
					transition: isDragging ? "none" : "transform 200ms ease-out",
				}}
				className="relative z-10 flex w-full items-center gap-3 rounded-lg border border-white/10 bg-neutral-950 p-3 text-left active:scale-[0.99]"
			>
				<img
					src={meal.thumbnail}
					alt=""
					className="size-14 shrink-0 rounded-md object-cover"
				/>
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<p className="truncate text-sm font-semibold text-white">
						{meal.name}
					</p>
					<p className="text-xs text-neutral-500">
						{formatTime(meal.uploadedAt)}
					</p>
				</div>
				<div className="flex flex-col items-end gap-1.5">
					{showStatusLabel && (
						<span
							className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
								meal.status === "saved"
									? "bg-emerald-500/15 text-emerald-300"
									: "bg-amber-500/15 text-amber-300"
							}`}
						>
							{statusLabel}
						</span>
					)}
					<span className="text-sm font-semibold text-white">
						{meal.kcal} kcal
					</span>
				</div>
			</button>
		</div>
	);
}
