import { createScope } from "./scope.client";
import { createStore, defineModel, Store } from "@cometa/core";

describe("scope", () => {
	describe("client", () => {
		it("hydrates bound model instances", () => {
			const createInternal = defineModel(() => ({
				store: createStore("initial"),
			}));

			let internalInstance: { store: Store<string> } | null = null;
			const createPublic = defineModel(() => ({
				internal: (internalInstance = createInternal()),
				store: createStore("initial"),
			}));

			const createExtra = defineModel(() => ({
				store: createStore("initial"),
			}));

			const createReady = defineModel(() => ({
				store: createStore("initial"),
			}));

			const publicInstance = createPublic();
			const extraInstance = createExtra();
			const readyInstance = createReady();

			const scope = createScope();

			scope.hydrate({
				public: ["public", "internal"],
				extra: ["extra"],
			});

			scope
				.bind("public", publicInstance)
				.bind("extra", extraInstance)
				.bind("ready", readyInstance);

			expect(internalInstance!.store.read()).toBe("internal");
			expect(publicInstance.store.read()).toBe("public");
			expect(extraInstance.store.read()).toBe("extra");
			expect(readyInstance.store.read()).toBe("initial");
		});
	});
});
