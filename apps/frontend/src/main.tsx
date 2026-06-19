import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import AuthPage from "@/screens/Auth.Page";
import BMIPage from "@/screens/BMI.Page";
import CapturePage from "@/screens/Capture.Page";
import ClarifyPage from "@/screens/Clarify.Page";
import ClarifyLoadingPage from "@/screens/ClarifyLoading.Page";
import HomePage from "@/screens/Home.Page";
import MealPreviewPage from "@/screens/MealPreview.Page";
import PhotoPreviewPage from "@/screens/PhotoPreview.Page";
import ResultPage from "@/screens/Result.Page";

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
					<Route path="capture" element={<CapturePage />} />
					<Route path="preview" element={<PhotoPreviewPage />} />
					<Route path="clarify-loading" element={<ClarifyLoadingPage />} />
					<Route path="clarify" element={<ClarifyPage />} />
					<Route path="result" element={<ResultPage />} />
					<Route path="meals/:mealId" element={<MealPreviewPage />} />
				</Routes>
			</BrowserRouter>
		</ConvexAuthProvider>
	</StrictMode>,
);
