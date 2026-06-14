import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { ArrowLeft, Loader2, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export default function AuthPage() {
	const navigate = useNavigate();
	const { signIn, signOut } = useAuthActions();

	return (
		<main className="min-h-screen bg-[#f7f4ef] px-5 py-6 text-[#1f1a17]">
			<div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-between">
				<button
					type="button"
					onClick={() => navigate("/")}
					className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8d0c4] bg-white text-[#3c332c] shadow-sm"
					aria-label="Go back"
				>
					<ArrowLeft size={20} />
				</button>

				<section className="space-y-8">
					<div className="space-y-3">
						<p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#7c6d5f]">
							SnapBite account
						</p>
						<h1 className="text-4xl font-semibold leading-tight">
							Sign in to keep your meals and progress synced.
						</h1>
					</div>

					<AuthLoading>
						<div className="flex h-14 items-center justify-center rounded-lg bg-white text-[#6b6056] shadow-sm">
							<Loader2 className="mr-2 animate-spin" size={18} />
							Checking session
						</div>
					</AuthLoading>

					<Unauthenticated>
						<button
							type="button"
							onClick={() => void signIn("google")}
							className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#24211e] px-4 font-semibold text-white shadow-sm"
						>
							<LogIn size={20} />
							Continue with Google
						</button>
					</Unauthenticated>

					<Authenticated>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => navigate("/")}
								className="h-14 w-full rounded-lg bg-[#2f6f4e] px-4 font-semibold text-white shadow-sm"
							>
								Go to dashboard
							</button>
							<button
								type="button"
								onClick={() => void signOut()}
								className="flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#d8d0c4] bg-white px-4 font-semibold text-[#3c332c] shadow-sm"
							>
								<LogOut size={20} />
								Sign out
							</button>
						</div>
					</Authenticated>
				</section>
			</div>
		</main>
	);
}
