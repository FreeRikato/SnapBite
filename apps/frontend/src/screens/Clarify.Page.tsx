import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";

import { ClarifyFooter } from "@/components/ClarifyFooter";
import { ClarifyProgressBar } from "@/components/ClarifyProgressBar";
import { ClarifyQuestionPanel } from "@/components/ClarifyQuestionPanel";
import { ClarifyReviewFooter } from "@/components/ClarifyReviewFooter";
import { ClarifyReviewList } from "@/components/ClarifyReviewList";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextInputModal } from "@/components/TextInputModal";
import { CLARIFY_QUESTIONS } from "@/constants/analysis";
import { useAnalysisStore } from "@/store";
import type { ClarifyAnswer } from "@/types/analysis";

const EMPTY_ANSWER: ClarifyAnswer = { selectedOptionIds: [], customText: "" };

function isAnswered(answer: ClarifyAnswer) {
	return answer.selectedOptionIds.length > 0 || answer.customText.trim() !== "";
}

export default function ClarifyPage() {
	const navigate = useNavigate();
	const answers = useAnalysisStore((state) => state.answers);
	const toggleOption = useAnalysisStore((state) => state.toggleOption);
	const setCustomText = useAnalysisStore((state) => state.setCustomText);

	const [index, setIndex] = useState(0);
	const [reviewing, setReviewing] = useState(false);
	const [customOpen, setCustomOpen] = useState(false);

	const total = CLARIFY_QUESTIONS.length;
	const question = CLARIFY_QUESTIONS[index];
	const answer = answers[question.id] ?? EMPTY_ANSWER;
	const isLast = index === total - 1;
	const canAdvance = isAnswered(answer);

	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
	}, []);

	function goBack() {
		if (reviewing) {
			setReviewing(false);
			return;
		}
		if (index > 0) {
			setIndex((current) => current - 1);
			return;
		}
		navigate(-1);
	}

	function goNext() {
		if (!canAdvance) return;
		if (isLast) {
			setReviewing(true);
			return;
		}
		setIndex((current) => current + 1);
	}

	function jumpTo(target: number) {
		setIndex(target);
		setReviewing(false);
	}

	function rejectReview() {
		setReviewing(false);
		setIndex(0);
	}

	function acceptReview() {
		navigate("/result");
	}

	if (reviewing) {
		return (
			<main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
				<ScreenHeader
					title="Review your answers"
					subtitle="Tap any answer to edit"
					onBack={goBack}
				/>

				<ClarifyReviewList
					questions={CLARIFY_QUESTIONS}
					answers={answers}
					emptyAnswer={EMPTY_ANSWER}
					onEditAnswer={jumpTo}
				/>

				<ClarifyReviewFooter onAccept={acceptReview} onReject={rejectReview} />
			</main>
		);
	}

	return (
		<main className="flex min-h-dvh flex-col bg-neutral-950 text-white">
			<ScreenHeader
				title={`Question ${index + 1} of ${total}`}
				subtitle="Pick all that apply"
				onBack={goBack}
			/>

			<ClarifyProgressBar questions={CLARIFY_QUESTIONS} currentIndex={index} />

			<ClarifyQuestionPanel
				question={question}
				answer={answer}
				onToggleOption={(optionId) => toggleOption(question.id, optionId)}
				onOpenCustomText={() => setCustomOpen(true)}
			/>

			<ClarifyFooter
				canAdvance={canAdvance}
				isLast={isLast}
				onBack={goBack}
				onNext={goNext}
			/>

			<TextInputModal
				open={customOpen}
				title={question.prompt}
				value={answer.customText}
				placeholder="Type your answer…"
				onClose={() => setCustomOpen(false)}
				onSubmit={(value) => {
					setCustomText(question.id, value);
					setCustomOpen(false);
				}}
			/>
		</main>
	);
}
