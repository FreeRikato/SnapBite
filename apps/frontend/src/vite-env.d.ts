/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_CONVEX_URL: string;
	readonly VITE_R2_WORKER_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
