import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const isProduction = mode === "production";
	const env = loadEnv(mode, process.cwd(), "");

	return {
		base: isProduction ? "/react-building-planner/" : "/",
		plugins: [
			react(),
			createHtmlPlugin({
				inject: {
					data: {
						GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY,
					},
				},
			}),
		],
	};
});
