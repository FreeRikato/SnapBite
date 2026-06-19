import type { ClarifyQuestion } from "@/types/analysis";

type ClarifyProgressBarProps = {
	questions: ClarifyQuestion[];
	currentIndex: number;
};

export function ClarifyProgressBar({
	questions,
	currentIndex,
}: ClarifyProgressBarProps) {
	return (
		<div className="flex gap-1.5 px-4 pt-1">
			{questions.map((question, questionIndex) => (
				<span
					key={question.id}
					className={`h-1 flex-1 rounded-full transition ${
						questionIndex <= currentIndex ? "bg-white" : "bg-white/15"
					}`}
				/>
			))}
		</div>
	);
}
