import { createScope } from "./scope.server";
import { createStore, defineModel } from "@cometa/core";

describe("scope", () => {
	describe("server", () => {
		it("dehydrates bound model instances", () => {
			const createInternal = defineModel(() => ({
				store: createStore("internal"),
			}));

			const createPublic = defineModel(() => ({
				internal: createInternal(),
				store: createStore("public"),
			}));

			const createExtra = defineModel(() => ({
				store: createStore("extra"),
			}));

			const publicInstance = createPublic();
			const extraInstance = createExtra();

			const scope = createScope();
			scope.bind("public", publicInstance).bind("extra", extraInstance);

			expect(scope.dehydrate()).toBe(
				JSON.stringify({
					public: ["public", "internal"],
					extra: ["extra"],
				}),
			);
		});
	});
});
