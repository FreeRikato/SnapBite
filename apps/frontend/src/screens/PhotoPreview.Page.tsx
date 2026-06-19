import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";

import { PhotoPreviewActions } from "@/components/PhotoPreviewActions";
import { PhotoPreviewGallery } from "@/components/PhotoPreviewGallery";
import { PhotoPreviewNoteButton } from "@/components/PhotoPreviewNoteButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextInputModal } from "@/components/TextInputModal";
import { startMealPhotoUploadSession } from "@/lib/mealPhotoUploadSession";
import { useCaptureStore } from "@/store";

export default function PhotoPreviewPage() {
	const navigate = useNavigate();
	const photos = useCaptureStore((state) => state.photos);
	const removePhoto = useCaptureStore((state) => state.removePhoto);
	const clearPhotos = useCaptureStore((state) => state.clearPhotos);
	const note = useCaptureStore((state) => state.note);
	const setNote = useCaptureStore((state) => state.setNote);

	const [noteOpen, setNoteOpen] = useState(false);

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	function submitNote(value: string) {
		setNote(value);
		setNoteOpen(false);
	}

	function goBack() {
		navigate(-1);
	}

	function handleSubmit() {
		const submittedPhotos = photos.map((photo) => ({ ...photo }));
		navigate("/clarify-loading");

		window.setTimeout(() => {
			if (submittedPhotos.length === 0) return;
			const uploadSession = startMealPhotoUploadSession(submittedPhotos);
			void uploadSession.promise.catch(() => undefined);
		}, 0);
	}

	return (
		<main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
			<ScreenHeader
				title="Review photos"
				subtitle={`${photos.length} ${photos.length === 1 ? "photo" : "photos"}`}
				onBack={goBack}
			/>

			<PhotoPreviewGallery photos={photos} onRemovePhoto={removePhoto} />

			{photos.length > 0 && (
				<PhotoPreviewNoteButton
					hasNote={Boolean(note)}
					onOpen={() => setNoteOpen(true)}
				/>
			)}

			<PhotoPreviewActions
				photoCount={photos.length}
				onClearPhotos={clearPhotos}
				onSubmit={handleSubmit}
			/>

			<TextInputModal
				open={noteOpen}
				title="Add a note"
				value={note}
				placeholder="Add details about your meal…"
				onClose={() => setNoteOpen(false)}
				onSubmit={submitNote}
			/>
		</main>
	);
}
