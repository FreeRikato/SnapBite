import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "react-router";

import { AuthActions } from "@/components/AuthActions";
import { AuthBackButton } from "@/components/AuthBackButton";
import { AuthIntro } from "@/components/AuthIntro";

export default function AuthPage() {
	const navigate = useNavigate();
	const { signIn, signOut } = useAuthActions();

	return (
		<main className="min-h-screen bg-[#f7f4ef] px-5 py-6 text-[#1f1a17]">
			<div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between">
				<AuthBackButton onBack={() => navigate("/")} />

				<section className="space-y-8">
					<AuthIntro />
					<AuthActions
						onSignIn={() => void signIn("google")}
						onSignOut={() => void signOut()}
						onDashboard={() => navigate("/")}
					/>
				</section>
			</div>
		</main>
	);
}
