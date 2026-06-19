import { Pencil, PencilLine } from "lucide-react";

type PhotoPreviewNoteButtonProps = {
	hasNote: boolean;
	onOpen: () => void;
};

export function PhotoPreviewNoteButton({
	hasNote,
	onOpen,
}: PhotoPreviewNoteButtonProps) {
	return (
		<button
			type="button"
			onClick={onOpen}
			aria-label={hasNote ? "Edit note" : "Add a note"}
			className={`fixed right-4 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-20 flex size-12 items-center justify-center rounded-full shadow-lg shadow-black/40 transition active:scale-95 ${
				hasNote ? "bg-white text-neutral-950" : "bg-neutral-800 text-white"
			}`}
		>
			{hasNote ? (
				<PencilLine size={20} strokeWidth={2.2} />
			) : (
				<Pencil size={20} strokeWidth={2.2} />
			)}
		</button>
	);
}
