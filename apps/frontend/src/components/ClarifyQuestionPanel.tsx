import { Check, PencilLine, Plus } from "lucide-react";

import type { ClarifyAnswer, ClarifyQuestion } from "@/types/analysis";

type ClarifyQuestionPanelProps = {
	question: ClarifyQuestion;
	answer: ClarifyAnswer;
	onToggleOption: (optionId: string) => void;
	onOpenCustomText: () => void;
};

export function ClarifyQuestionPanel({
	question,
	answer,
	onToggleOption,
	onOpenCustomText,
}: ClarifyQuestionPanelProps) {
	const QuestionIcon = question.icon;
	const customText = answer.customText.trim();

	return (
		<section className="flex-1 px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))]">
			<div className="flex items-center gap-3">
				<span className="flex size-12 items-center justify-center rounded-2xl bg-neutral-900">
					<QuestionIcon
						size={24}
						className={question.color}
						strokeWidth={2.2}
					/>
				</span>
				<h1 className="text-2xl font-semibold tracking-tight text-white">
					{question.prompt}
				</h1>
			</div>

			<ul className="mt-6 flex flex-col gap-3">
				{question.options.map((option) => {
					const active = answer.selectedOptionIds.includes(option.id);
					const Icon = option.icon;
					return (
						<li key={option.id}>
							<button
								type="button"
								onClick={() => onToggleOption(option.id)}
								className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
									active
										? "border-white bg-white text-neutral-950"
										: "border-white/10 bg-neutral-900 text-white hover:border-white/20"
								}`}
							>
								<span
									className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
										active ? "bg-neutral-950/5" : "bg-neutral-950"
									}`}
								>
									<Icon size={20} className={option.color} strokeWidth={2.2} />
								</span>
								<span className="flex-1 text-base font-medium">
									{option.label}
								</span>
								<span
									className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
										active
											? "border-neutral-950 bg-neutral-950"
											: "border-white/25"
									}`}
								>
									{active && (
										<Check size={14} className="text-white" strokeWidth={3} />
									)}
								</span>
							</button>
						</li>
					);
				})}

				<li>
					<button
						type="button"
						onClick={onOpenCustomText}
						className={`flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left transition active:scale-[0.99] ${
							customText
								? "border-white bg-white text-neutral-950"
								: "border-white/20 bg-neutral-900 text-white hover:border-white/30"
						}`}
					>
						<span
							className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
								customText ? "bg-neutral-950/5" : "bg-neutral-950"
							}`}
						>
							<Plus size={20} className="text-fuchsia-400" strokeWidth={2.4} />
						</span>
						<span className="flex-1 text-base font-medium">
							{customText || "Type your answer..."}
						</span>
						{customText && (
							<PencilLine size={18} className="shrink-0 text-neutral-500" />
						)}
					</button>
				</li>
			</ul>
		</section>
	);
}
