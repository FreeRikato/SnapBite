import { ArrowLeft } from "lucide-react";

type AuthBackButtonProps = {
	onBack: () => void;
};

export function AuthBackButton({ onBack }: AuthBackButtonProps) {
	return (
		<button
			type="button"
			onClick={onBack}
			className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8d0c4] bg-white text-[#3c332c] shadow-sm"
			aria-label="Go back"
		>
			<ArrowLeft size={20} />
		</button>
	);
}
