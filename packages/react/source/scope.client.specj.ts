import { model, Store, store } from "@cometa/core";

import { createScope } from "./scope.client";

describe("scope", () => {
	describe("client", () => {
		it("hydrates bound model instances", () => {
			const createInternal = model(() => ({
				store: store("initial"),
			}));

			let internalInstance: { store: Store<string> } | null = null;
			const createPublic = model(() => ({
				internal: (internalInstance = createInternal()),
				store: store("initial"),
			}));

			const createExtra = model(() => ({
				store: store("initial"),
			}));

			const createReady = model(() => ({
				store: store("initial"),
			}));

			const publicInstance = createPublic();
			const extraInstance = createExtra();
			const readyInstance = createReady();

			const scope = createScope();

			scope.hydrate([
				{
					public: ["public", "internal"],
					extra: ["extra"],
				},
				{},
			]);

			scope.bind("public", publicInstance);
			scope.bind("extra", extraInstance);
			scope.bind("ready", readyInstance);

			expect(internalInstance!.store.read()).toBe("internal");
			expect(publicInstance.store.read()).toBe("public");
			expect(extraInstance.store.read()).toBe("extra");
			expect(readyInstance.store.read()).toBe("initial");
		});
	});
});
