import { api } from "@repo/convex/convex/_generated/api";
import type { Id } from "@repo/convex/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import analyzedFallback from "@/assets/examples/analyzed.png";
import { CalorieEditSheet } from "@/components/CalorieEditSheet";
import type { FoodItemDraft } from "@/components/FoodItemEditModal";
import { FoodItemEditModal } from "@/components/FoodItemEditModal";
import { MealDetailsEditor } from "@/components/MealDetailsEditor";
import { MealDoneFooter } from "@/components/MealDoneFooter";
import { MealHeroHeader } from "@/components/MealHeroHeader";
import { MealLookupState } from "@/components/MealLookupState";
import { MealPhotoHero } from "@/components/MealPhotoHero";
import { NEW_FOOD_ITEM_EMOJI } from "@/constants/analysis";
import { deleteMealPhotos } from "@/lib/mealPhotoUpload";
import { mealRecordToMeal } from "@/lib/mealRecords";
import { useHomeStore } from "@/store";
import type { FoodItem } from "@/types/analysis";

type ModalState = { mode: "edit"; id: string } | { mode: "add" } | null;

const NEW_ITEM_DRAFT: FoodItemDraft = {
	emoji: NEW_FOOD_ITEM_EMOJI,
	name: "",
	quantity: 1,
	unit: "Pieces",
};

function toDateInputValue(iso: string) {
	const date = new Date(iso);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function toTimeInputValue(iso: string) {
	const date = new Date(iso);
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

function createFoodItemId() {
	return `preview-food-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function MealPreviewPage() {
	const navigate = useNavigate();
	const { mealId } = useParams();
	const mealRecord = useQuery(
		api.meals.getById,
		mealId ? { id: mealId as Id<"meals"> } : "skip",
	);
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
	const cachedMeal = useHomeStore((state) =>
		mealId ? (state.mealsById[mealId] ?? null) : null,
	);
	const upsertCachedMeals = useHomeStore((state) => state.upsertCachedMeals);
	const removeCachedMeal = useHomeStore((state) => state.removeCachedMeal);
	const freshMeal = useMemo(
		() => (mealRecord ? mealRecordToMeal(mealRecord) : null),
		[mealRecord],
	);
	const meal = mealRecord === null ? null : (freshMeal ?? cachedMeal);
	const calorieInputRef = useRef<HTMLInputElement>(null);
	const hydratedMealIdRef = useRef<string | null>(null);

	const mealPhotos = meal?.photos ?? [];
	const photos = mealPhotos.length
		? mealPhotos
		: [meal?.thumbnail ?? analyzedFallback];
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
	const [calories, setCalories] = useState("0");
	const [calorieDraft, setCalorieDraft] = useState("0");
	const [calorieModalOpen, setCalorieModalOpen] = useState(false);
	const [mealDate, setMealDate] = useState("");
	const [mealTime, setMealTime] = useState("");
	const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
	const [modal, setModal] = useState<ModalState>(null);
	const [deleting, setDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const photoCount = photos.length;
	const hasCarousel = photoCount > 1;
	const heroImage = photos[currentPhotoIndex] ?? analyzedFallback;
	const editingItem =
		modal?.mode === "edit"
			? (foodItems.find((item) => item.id === modal.id) ?? null)
			: null;

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	useEffect(() => {
		setCurrentPhotoIndex((current) => {
			if (photoCount === 0) return 0;
			return Math.min(current, photoCount - 1);
		});
	}, [photoCount]);

	useEffect(() => {
		if (calorieModalOpen) {
			calorieInputRef.current?.focus();
			calorieInputRef.current?.select();
		}
	}, [calorieModalOpen]);

	useEffect(() => {
		if (!meal || hydratedMealIdRef.current === meal.id) return;

		hydratedMealIdRef.current = meal.id;
		setCalories(String(meal.kcal));
		setCalorieDraft(String(meal.kcal));
		setMealDate(toDateInputValue(meal.uploadedAt));
		setMealTime(toTimeInputValue(meal.uploadedAt));
		setFoodItems(meal.foodItems);
	}, [meal]);

	useEffect(() => {
		if (freshMeal) {
			upsertCachedMeals([freshMeal]);
		}
	}, [freshMeal, upsertCachedMeals]);

	useEffect(() => {
		if (mealRecord === null && mealId) {
			removeCachedMeal(mealId);
		}
	}, [mealId, mealRecord, removeCachedMeal]);

	function showPreviousPhoto() {
		if (!hasCarousel) return;
		setCurrentPhotoIndex((current) =>
			current === 0 ? photoCount - 1 : current - 1,
		);
	}

	function showNextPhoto() {
		if (!hasCarousel) return;
		setCurrentPhotoIndex((current) =>
			current === photoCount - 1 ? 0 : current + 1,
		);
	}

	function openCalorieModal() {
		setCalorieDraft(calories);
		setCalorieModalOpen(true);
	}

	function saveCalories() {
		const trimmed = calorieDraft.trim();
		if (!trimmed) {
			setCalories("0");
		} else {
			const nextCalories = Number(trimmed);
			setCalories(
				Number.isFinite(nextCalories)
					? String(Math.max(0, Math.round(nextCalories)))
					: "0",
			);
		}
		setCalorieModalOpen(false);
	}

	function saveFoodItem(draft: FoodItemDraft) {
		if (modal?.mode === "edit") {
			setFoodItems((current) =>
				current.map((item) =>
					item.id === modal.id ? { ...item, ...draft } : item,
				),
			);
		} else if (modal?.mode === "add") {
			setFoodItems((current) => [
				...current,
				{ ...draft, id: createFoodItemId() },
			]);
		}
		setModal(null);
	}

	function deleteEditing() {
		if (modal?.mode === "edit") {
			setFoodItems((current) => current.filter((item) => item.id !== modal.id));
		}
		setModal(null);
	}

	async function deleteMeal() {
		if (!meal || deleting) return;

		const confirmed = window.confirm(
			"Delete this meal from recently uploaded?",
		);

		if (!confirmed) return;

		const photoKeys = Array.from(
			new Set([
				...(mealRecord?.photos.map((photo) => photo.key) ??
					meal.photoKeys ??
					[]),
				mealRecord?.thumbnailKey ?? meal.thumbnailKey,
			]),
		).filter((key): key is string => Boolean(key));
		const debugId = `delete-meal-${meal.id}`;

		console.info("[SnapBite delete]", "meal preview delete confirmed", {
			debugId,
			mealId: meal.id,
			photoKeyCount: photoKeys.length,
			photoKeys,
		});
		setDeleting(true);
		setDeleteError(null);
		removeCachedMeal(meal.id);

		try {
			console.info("[SnapBite delete]", "meal preview deleting R2 photos", {
				debugId,
				mealId: meal.id,
				photoKeyCount: photoKeys.length,
			});
			await deleteMealPhotos({ keys: photoKeys, debugId });
			console.info("[SnapBite delete]", "meal preview removing Convex meal", {
				debugId,
				mealId: meal.id,
			});
			const result = await removeMeal({ id: meal.id as Id<"meals"> });
			console.info("[SnapBite delete]", "meal preview Convex remove result", {
				debugId,
				mealId: meal.id,
				deleted: result.deleted,
				photoKeyCount: result.photoKeys.length,
				photoKeys: result.photoKeys,
			});

			if (!result.deleted) {
				throw new Error("Unable to delete this meal");
			}

			navigate("/");
		} catch (err) {
			console.error("[SnapBite delete]", "meal preview delete failed", {
				debugId,
				mealId: meal.id,
				err,
			});
			upsertCachedMeals([meal]);
			setDeleteError(
				err instanceof Error ? err.message : "Unable to delete this meal",
			);
		} finally {
			setDeleting(false);
		}
	}

	if (mealRecord === undefined && !cachedMeal) {
		return (
			<MealLookupState title="Loading meal" onBack={() => navigate("/")} />
		);
	}

	if (!meal) {
		return (
			<MealLookupState
				title="Meal not found"
				description="This meal is no longer available."
				onBack={() => navigate("/")}
			/>
		);
	}

	return (
		<main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
			<MealPhotoHero
				imageSrc={heroImage}
				imageAlt={meal.name}
				hasCarousel={hasCarousel}
				currentPhotoIndex={currentPhotoIndex}
				photoCount={photoCount}
				onPreviousPhoto={showPreviousPhoto}
				onNextPhoto={showNextPhoto}
			>
				<MealHeroHeader
					action={{
						type: "delete",
						onDelete: deleteMeal,
						disabled: deleting,
					}}
					onBack={() => navigate(-1)}
				/>
			</MealPhotoHero>

			<MealDetailsEditor
				calories={calories}
				dateValue={mealDate}
				foodItems={foodItems}
				idPrefix="preview-meal"
				timeValue={mealTime}
				onAddItem={() => setModal({ mode: "add" })}
				onDateChange={setMealDate}
				onEditCalories={openCalorieModal}
				onEditItem={(id) => setModal({ mode: "edit", id })}
				onTimeChange={setMealTime}
			/>

			<MealDoneFooter
				onDone={() => navigate("/")}
				disabled={deleting}
				error={deleteError}
				loadingLabel="Deleting..."
			/>

			<FoodItemEditModal
				open={modal !== null}
				title={modal?.mode === "add" ? "Add item" : "Edit item"}
				initial={modal?.mode === "edit" ? editingItem : NEW_ITEM_DRAFT}
				onClose={() => setModal(null)}
				onSave={saveFoodItem}
				onDelete={modal?.mode === "edit" ? deleteEditing : undefined}
			/>

			<CalorieEditSheet
				open={calorieModalOpen}
				value={calorieDraft}
				inputRef={calorieInputRef}
				onChange={setCalorieDraft}
				onClose={() => setCalorieModalOpen(false)}
				onConfirm={saveCalories}
			/>
		</main>
	);
}
