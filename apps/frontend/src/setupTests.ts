import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom has no IndexedDB, so back idb-keyval with an in-memory map for tests.
vi.mock("idb-keyval", () => {
	const store = new Map<string, unknown>();
	return {
		get: async (key: string) => store.get(key),
		set: async (key: string, value: unknown) => {
			store.set(key, value);
		},
		del: async (key: string) => {
			store.delete(key);
		},
		clear: async () => {
			store.clear();
		},
	};
});

function createMemoryStorage(): Storage {
	let store: Record<string, string> = {};

	return {
		get length() {
			return Object.keys(store).length;
		},
		clear() {
			store = {};
		},
		getItem(key) {
			return store[key] ?? null;
		},
		key(index) {
			return Object.keys(store)[index] ?? null;
		},
		removeItem(key) {
			delete store[key];
		},
		setItem(key, value) {
			store[key] = value;
		},
	};
}

const testLocalStorage = createMemoryStorage();
const testSessionStorage = createMemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
	configurable: true,
	value: testLocalStorage,
});

Object.defineProperty(window, "localStorage", {
	configurable: true,
	value: testLocalStorage,
});

Object.defineProperty(globalThis, "sessionStorage", {
	configurable: true,
	value: testSessionStorage,
});

Object.defineProperty(window, "sessionStorage", {
	configurable: true,
	value: testSessionStorage,
});

Object.defineProperty(window, "scrollTo", {
	configurable: true,
	value: vi.fn(),
});

afterEach(() => {
	cleanup();
});
