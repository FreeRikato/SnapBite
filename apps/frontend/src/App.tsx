import { useNavigate } from "react-router";
import "./App.css";

function App() {
	const navigate = useNavigate();
	return (
		<>
			<div className="text-2xl">Home Page</div>
			<button
				type="button"
				onClick={() => navigate("/login")}
				className="bg-blue rounded-full"
			>
				Go to Auth
			</button>
		</>
	);
}

export default App;
