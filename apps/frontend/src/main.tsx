import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import AuthPage from "./screens/Auth.Page.tsx";
import BMIPage from "./screens/BMI.Page.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route index element={<App />} />
				<Route path="login" element={<AuthPage />} />
				<Route path="bmi-calculate" element={<BMIPage />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
