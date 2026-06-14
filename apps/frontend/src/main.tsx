import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthPage from "@/screens/Auth.Page";
import BMIPage from "@/screens/BMI.Page";
import HomePage from "@/screens/Home.Page";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route index element={<HomePage />} />
				<Route path="login" element={<AuthPage />} />
				<Route path="bmi-calculate" element={<BMIPage />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
