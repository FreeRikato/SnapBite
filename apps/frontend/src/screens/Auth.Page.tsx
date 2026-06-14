import { useNavigate } from "react-router";
export default function AuthPage() {
	const navigate = useNavigate();
	return (
		<>
			<div className="text-2xl">Home Page</div>
			<button
				type="button"
				onClick={() => navigate("/")}
				className="bg-blue rounded-full"
			>
				Go to Home
			</button>
		</>
	);
}
