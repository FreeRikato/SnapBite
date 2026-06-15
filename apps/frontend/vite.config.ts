import { fileURLToPath, URL } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		process.env.VITE_DEV_HTTPS === "true" ? basicSsl() : null,
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	].filter(Boolean),
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@repo/convex": fileURLToPath(
				new URL("../../packages/convex", import.meta.url),
			),
		},
	},
	test: {
		environment: "jsdom",
		environmentOptions: {
			jsdom: {
				url: "http://localhost",
			},
		},
		setupFiles: ["./src/setupTests.ts"],
	},
	server: {
		allowedHosts: ["omarikato.tail613164.ts.net", ".ts.net"],
	},
});
