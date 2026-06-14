import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

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

Object.defineProperty(globalThis, "localStorage", {
	configurable: true,
	value: testLocalStorage,
});

Object.defineProperty(window, "localStorage", {
	configurable: true,
	value: testLocalStorage,
});

afterEach(() => {
	cleanup();
});
