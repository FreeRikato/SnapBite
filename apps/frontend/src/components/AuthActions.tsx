import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2, LogIn, LogOut } from "lucide-react";

type AuthActionsProps = {
	onSignIn: () => void;
	onSignOut: () => void;
	onDashboard: () => void;
};

export function AuthActions({
	onSignIn,
	onSignOut,
	onDashboard,
}: AuthActionsProps) {
	return (
		<>
			<AuthLoading>
				<div className="flex h-14 items-center justify-center rounded-lg bg-white text-[#6b6056] shadow-sm">
					<Loader2 className="mr-2 animate-spin" size={18} />
					Checking session
				</div>
			</AuthLoading>

			<Unauthenticated>
				<button
					type="button"
					onClick={onSignIn}
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
						onClick={onDashboard}
						className="h-14 w-full rounded-lg bg-[#2f6f4e] px-4 font-semibold text-white shadow-sm"
					>
						Go to dashboard
					</button>
					<button
						type="button"
						onClick={onSignOut}
						className="flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-[#d8d0c4] bg-white px-4 font-semibold text-[#3c332c] shadow-sm"
					>
						<LogOut size={20} />
						Sign out
					</button>
				</div>
			</Authenticated>
		</>
	);
}
