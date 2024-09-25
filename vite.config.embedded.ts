import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";
import { getDefaultConfig, getDefaultPlugins } from "./vite.config";

// https://vitejs.dev/config/
export default defineConfig((config) => {
	const defaultConfig = getDefaultConfig(config);

	return {
		...defaultConfig,
		plugins: [
			...getDefaultPlugins(),
			compression({
				threshold: 100,
				deleteOriginalAssets: true,
				include: /assets\/.+\.(html|xml|css|json|js|mjs|svg|wasm)$/,
			}),
		],
		define: {
			...defaultConfig.define,
			"import.meta.env.IS_EMBEDDED": true,
		},
	};
});
