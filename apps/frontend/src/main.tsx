import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthPage from "@/screens/Auth.Page";
import BMIPage from "@/screens/BMI.Page";
import HomePage from "@/screens/Home.Page";

const rootElement = document.getElementById("root");
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!convexUrl) {
	throw new Error("Missing VITE_CONVEX_URL");
}

const convex = new ConvexReactClient(convexUrl);

createRoot(rootElement).render(
	<StrictMode>
		<ConvexAuthProvider client={convex}>
			<BrowserRouter>
				<Routes>
					<Route index element={<HomePage />} />
					<Route path="login" element={<AuthPage />} />
					<Route path="bmi-calculate" element={<BMIPage />} />
				</Routes>
			</BrowserRouter>
		</ConvexAuthProvider>
	</StrictMode>,
);
