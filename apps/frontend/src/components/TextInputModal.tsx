import { useEffect, useRef, useState } from "react";

import { BottomSheet } from "@/components/BottomSheet";

type TextInputModalProps = {
	open: boolean;
	title: string;
	value: string;
	placeholder?: string;
	onClose: () => void;
	onSubmit: (value: string) => void;
};

/** Reusable bottom-sheet text editor used for notes and custom answers. */
export function TextInputModal({
	open,
	title,
	value,
	placeholder = "Type your answer…",
	onClose,
	onSubmit,
}: TextInputModalProps) {
	const [draft, setDraft] = useState(value);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (open) {
			setDraft(value);
		}
	}, [open, value]);

	useEffect(() => {
		if (open) {
			textareaRef.current?.focus();
		}
	}, [open]);

	function submit() {
		onSubmit(draft.trim());
	}

	return (
		<BottomSheet
			open={open}
			title={title}
			onClose={onClose}
			onConfirm={submit}
			panelClassName="h-1/2"
		>
			<textarea
				ref={textareaRef}
				value={draft}
				onChange={(event) => setDraft(event.target.value)}
				placeholder={placeholder}
				className="mt-3 w-full flex-1 resize-none rounded-2xl border border-white/10 bg-neutral-950 p-4 text-base text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-none"
			/>
		</BottomSheet>
	);
}
