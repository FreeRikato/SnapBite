import { PencilLine } from "lucide-react";

import type { ClarifyAnswer, ClarifyQuestion } from "@/types/analysis";

type ClarifyReviewListProps = {
	questions: ClarifyQuestion[];
	answers: Record<string, ClarifyAnswer>;
	emptyAnswer: ClarifyAnswer;
	onEditAnswer: (index: number) => void;
};

export function ClarifyReviewList({
	questions,
	answers,
	emptyAnswer,
	onEditAnswer,
}: ClarifyReviewListProps) {
	return (
		<section className="flex-1 px-4 pt-4 pb-[calc(9rem+env(safe-area-inset-bottom))]">
			<ul className="flex flex-col gap-3">
				{questions.map((question, questionIndex) => {
					const answer = answers[question.id] ?? emptyAnswer;
					const chosen = question.options
						.filter((option) => answer.selectedOptionIds.includes(option.id))
						.map((option) => option.label);
					if (answer.customText.trim()) {
						chosen.push(answer.customText.trim());
					}
					const Icon = question.icon;
					return (
						<li key={question.id}>
							<button
								type="button"
								onClick={() => onEditAnswer(questionIndex)}
								className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-4 text-left transition active:scale-[0.99]"
							>
								<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950">
									<Icon
										size={20}
										className={question.color}
										strokeWidth={2.2}
									/>
								</span>
								<span className="flex flex-1 flex-col gap-1">
									<span className="text-sm font-medium text-neutral-400">
										{question.prompt}
									</span>
									{chosen.length > 0 ? (
										<span className="flex flex-wrap gap-1.5">
											{chosen.map((label) => (
												<span
													key={label}
													className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-950"
												>
													{label}
												</span>
											))}
										</span>
									) : (
										<span className="text-sm text-neutral-600">
											No answer yet
										</span>
									)}
								</span>
								<PencilLine
									size={18}
									className="mt-1 shrink-0 text-neutral-500"
								/>
							</button>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
