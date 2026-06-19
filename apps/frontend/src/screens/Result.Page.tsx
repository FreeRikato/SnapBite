import { api } from "@repo/convex/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

import analyzedFallback from "@/assets/examples/analyzed.png";
import { CalorieEditSheet } from "@/components/CalorieEditSheet";
import type { FoodItemDraft } from "@/components/FoodItemEditModal";
import { FoodItemEditModal } from "@/components/FoodItemEditModal";
import { MealDetailsEditor } from "@/components/MealDetailsEditor";
import { MealDoneFooter } from "@/components/MealDoneFooter";
import { MealHeroHeader } from "@/components/MealHeroHeader";
import { MealPhotoHero } from "@/components/MealPhotoHero";
import { ANALYZED_CALORIES, NEW_FOOD_ITEM_EMOJI } from "@/constants/analysis";
import { getMealPhotoUrl } from "@/lib/mealPhotoUpload";
import {
	clearActiveMealPhotoUploadSession,
	getActiveMealPhotoUploadSession,
	type MealPhotoUploadSession,
} from "@/lib/mealPhotoUploadSession";
import type { MealPhotoRecord } from "@/lib/mealRecords";
import type { CapturedPhoto } from "@/store";
import { useAnalysisStore, useCaptureStore, useHomeStore } from "@/store";
import type { FoodItem } from "@/types/analysis";

type ModalState = { mode: "edit"; id: string } | { mode: "add" } | null;

const CONVEX_SAVE_TIMEOUT_MS = 30_000;

const NEW_ITEM_DRAFT: FoodItemDraft = {
	emoji: NEW_FOOD_ITEM_EMOJI,
	name: "",
	quantity: 1,
	unit: "Pieces",
};

function getCurrentTimeValue(date = new Date()) {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

function getCurrentDateValue(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getMealTimestamp(dateValue: string, timeValue: string) {
	const timestamp = new Date(`${dateValue}T${timeValue || "00:00"}`);
	if (Number.isNaN(timestamp.getTime())) return new Date().toISOString();
	return timestamp.toISOString();
}

function createDebugId(status: "saved" | "draft") {
	return `result-${status}-${Date.now().toString(36)}`;
}

function logResult(debugId: string, message: string, data = {}) {
	console.info("[SnapBite result]", message, { debugId, ...data });
}

function logResultError(debugId: string, message: string, err: unknown) {
	console.error("[SnapBite result]", message, { debugId, err });
}

function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	message: string,
	debugId: string,
) {
	let timeout: number | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timeout = window.setTimeout(() => {
			logResult(debugId, "operation timed out", { message, timeoutMs });
			reject(new Error(`${message} timed out after ${timeoutMs}ms`));
		}, timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]).finally(() => {
		if (timeout !== undefined) {
			window.clearTimeout(timeout);
		}
	});
}

type CreateMealFn = (args: {
	status: "saved" | "draft";
	photos: MealPhotoRecord[];
	name: string;
	kcal: number;
	uploadedAt: string;
	foodItems: FoodItem[];
}) => Promise<unknown>;

async function runBackgroundUpload({
	pendingId,
	status,
	capturedPhotos,
	uploadSession,
	foodItems,
	kcal,
	mealDate,
	mealTime,
	createMeal,
}: {
	pendingId: string;
	status: "saved" | "draft";
	capturedPhotos: CapturedPhoto[];
	uploadSession: MealPhotoUploadSession | null;
	foodItems: FoodItem[];
	kcal: number;
	mealDate: string;
	mealTime: string;
	createMeal: CreateMealFn;
}) {
	const debugId = createDebugId(status);
	logResult(debugId, "background upload started", {
		pendingId,
		status,
		photoCount: capturedPhotos.length,
		uploadSessionId: uploadSession?.id ?? null,
	});

	try {
		const { removePendingMeal } = useHomeStore.getState();
		const uploadedPhotos = uploadSession ? await uploadSession.promise : [];

		useHomeStore.getState().setPendingMealProgress(pendingId, 0.92);

		const mealId = await withTimeout(
			createMeal({
				status,
				photos: uploadedPhotos,
				name: foodItems[0]?.name ?? "Analyzed meal",
				kcal,
				uploadedAt: getMealTimestamp(mealDate, mealTime),
				foodItems,
			}),
			CONVEX_SAVE_TIMEOUT_MS,
			"Convex createMeal",
			debugId,
		);

		if (typeof mealId === "string") {
			const photos = uploadedPhotos.map((photo) => getMealPhotoUrl(photo.key));
			useHomeStore.getState().upsertCachedMeals([
				{
					id: mealId,
					thumbnail: uploadedPhotos[0]
						? getMealPhotoUrl(uploadedPhotos[0].key)
						: analyzedFallback,
					photos,
					thumbnailKey: uploadedPhotos[0]?.key ?? null,
					photoKeys: uploadedPhotos.map((photo) => photo.key),
					name: foodItems[0]?.name ?? "Analyzed meal",
					status,
					kcal,
					protein: 0,
					carbs: 0,
					fat: 0,
					uploadedAt: getMealTimestamp(mealDate, mealTime),
					foodItems,
				},
			]);
		}

		logResult(debugId, "background upload complete", { pendingId });
		removePendingMeal(pendingId);

		const currentPhotos = useCaptureStore.getState().photos;
		const currentPhotoSignature = currentPhotos
			.map((photo) => photo.blobKey)
			.join("|");
		const uploadedPhotoSignature = capturedPhotos
			.map((photo) => photo.blobKey)
			.join("|");

		if (currentPhotoSignature === uploadedPhotoSignature) {
			await useCaptureStore.getState().clearPhotos();
			if (status === "saved") {
				useAnalysisStore.getState().resetAnalysis();
			}
		}

		if (uploadSession) {
			clearActiveMealPhotoUploadSession(uploadSession.id);
		}
	} catch (err) {
		logResultError(debugId, "background upload failed", err);
		const message = err instanceof Error ? err.message : "Upload failed";
		useHomeStore.getState().setPendingMealError(pendingId, message);
		if (uploadSession) {
			clearActiveMealPhotoUploadSession(uploadSession.id);
		}
		return message;
	}

	return null;
}

export default function ResultPage() {
	const navigate = useNavigate();
	const photos = useCaptureStore((state) => state.photos);
	const foodItems = useAnalysisStore((state) => state.foodItems);
	const addFoodItem = useAnalysisStore((state) => state.addFoodItem);
	const updateFoodItem = useAnalysisStore((state) => state.updateFoodItem);
	const removeFoodItem = useAnalysisStore((state) => state.removeFoodItem);
	const createMeal = useMutation(api.meals.create);
	const calorieInputRef = useRef<HTMLInputElement>(null);

	const addPendingMeal = useHomeStore((state) => state.addPendingMeal);
	const firedRef = useRef(false);

	const [modal, setModal] = useState<ModalState>(null);
	const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
	const [calories, setCalories] = useState(String(ANALYZED_CALORIES));
	const [calorieDraft, setCalorieDraft] = useState(String(ANALYZED_CALORIES));
	const [calorieModalOpen, setCalorieModalOpen] = useState(false);
	const [mealDate, setMealDate] = useState(getCurrentDateValue);
	const [mealTime, setMealTime] = useState(getCurrentTimeValue);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const photoCount = photos.length;
	const hasCarousel = photoCount > 1;
	const visiblePhoto = photos[currentPhotoIndex] ?? photos[0];
	const heroImage = visiblePhoto?.previewObjectUrl ?? analyzedFallback;
	const heroImageAlt =
		photoCount > 0
			? `Analyzed meal photo ${currentPhotoIndex + 1} of ${photoCount}`
			: "Analyzed meal";
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

	function dispatchAndNavigate(status: "saved" | "draft") {
		if (firedRef.current) return;
		firedRef.current = true;
		setIsSaving(true);
		setUploadError(null);

		const nextCalories = Number(calories);
		const kcal = Number.isFinite(nextCalories)
			? Math.max(0, Math.round(nextCalories))
			: 0;

		const pendingId = `pending-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
		const pendingMeal = {
			id: pendingId,
			thumbnail: photos[0]?.previewObjectUrl ?? analyzedFallback,
			photos: photos.map((p) => p.previewObjectUrl),
			name: foodItems[0]?.name ?? "Analyzed meal",
			status,
			kcal,
			protein: 0,
			carbs: 0,
			fat: 0,
			uploadedAt: getMealTimestamp(mealDate, mealTime),
			foodItems,
			pending: true as const,
			error: null,
		};

		addPendingMeal(pendingMeal);

		const snapshotPhotos = [...photos];
		const snapshotFoodItems = [...foodItems];
		const uploadSession =
			snapshotPhotos.length > 0 ? getActiveMealPhotoUploadSession() : null;

		if (snapshotPhotos.length > 0 && !uploadSession) {
			useHomeStore.getState().removePendingMeal(pendingId);
			setUploadError("Photo upload was not started. Please submit again.");
			setIsSaving(false);
			firedRef.current = false;
			return;
		}

		const unsubscribeProgress = uploadSession
			? uploadSession.subscribeProgress((progress) => {
					useHomeStore
						.getState()
						.setPendingMealProgress(pendingId, Math.min(0.9, progress * 0.9));
				})
			: undefined;

		void runBackgroundUpload({
			pendingId,
			status,
			capturedPhotos: snapshotPhotos,
			uploadSession,
			foodItems: snapshotFoodItems,
			kcal,
			mealDate,
			mealTime,
			createMeal,
		}).finally(() => unsubscribeProgress?.());

		navigate("/");
	}

	function goHome() {
		dispatchAndNavigate("draft");
	}

	function finish() {
		dispatchAndNavigate("saved");
	}

	function saveModal(draft: FoodItemDraft) {
		if (modal?.mode === "edit") {
			updateFoodItem(modal.id, draft);
		} else if (modal?.mode === "add") {
			addFoodItem(draft);
		}
		setModal(null);
	}

	function deleteEditing() {
		if (modal?.mode === "edit") {
			removeFoodItem(modal.id);
		}
		setModal(null);
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

	return (
		<main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
			<MealPhotoHero
				imageSrc={heroImage}
				imageAlt={heroImageAlt}
				hasCarousel={hasCarousel}
				currentPhotoIndex={currentPhotoIndex}
				photoCount={photoCount}
				onPreviousPhoto={showPreviousPhoto}
				onNextPhoto={showNextPhoto}
			>
				<MealHeroHeader
					action={{ type: "share" }}
					onBack={goHome}
					backLabel="Back to home"
				/>
			</MealPhotoHero>

			<MealDetailsEditor
				calories={calories}
				dateValue={mealDate}
				foodItems={foodItems}
				idPrefix="meal"
				timeValue={mealTime}
				onAddItem={() => setModal({ mode: "add" })}
				onDateChange={setMealDate}
				onEditCalories={openCalorieModal}
				onEditItem={(id) => setModal({ mode: "edit", id })}
				onTimeChange={setMealTime}
			/>

			<MealDoneFooter onDone={finish} disabled={isSaving} error={uploadError} />

			<FoodItemEditModal
				open={modal !== null}
				title={modal?.mode === "add" ? "Add item" : "Edit item"}
				initial={modal?.mode === "edit" ? editingItem : NEW_ITEM_DRAFT}
				onClose={() => setModal(null)}
				onSave={saveModal}
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
