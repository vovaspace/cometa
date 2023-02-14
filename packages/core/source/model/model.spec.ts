import { registry } from "../registry";
import { Link, link } from "../scheduler";
import { createStore, Store } from "../store";
import { defineModel } from "./model";

describe("model", () => {
	describe("synchrony", () => {
		it("creates a factory", () => {
			const state = 0;
			const factory = defineModel(() => ({
				store: createStore(state),
			}));

			const model = factory();

			expect(model.store.read()).toBe(state);
		});

		it("delivers dependencies", () => {
			const factory = defineModel((dependencies: { initial: number }) => ({
				store: createStore(dependencies.initial),
			}));

			const initial = 1;
			const model = factory({ initial: initial });

			expect(model.store.read()).toBe(initial);
		});

		it("registers an instance", () => {
			let internalStore: Store<number> | null = null;
			let internalLink: Link<any, any, any> | null = null;
			const createInternal = defineModel(() => {
				internalStore = createStore(0);

				internalLink = link({
					clock: { subject: internalStore },
					target: () => {},
				});

				return {
					store: internalStore,
				};
			});

			let publicStore: Store<number> | null = null;
			let internalInstance: { store: Store<number> } | null = null;
			let publicLink: Link<any, any, any> | null = null;
			const createPublic = defineModel(() => {
				publicStore = createStore(0);
				internalInstance = createInternal();

				publicLink = link({
					clock: { subject: publicStore },
					target: internalInstance.store,
				});

				return {
					store: publicStore,
					internal: internalInstance,
				};
			});

			const publicInstance = createPublic();
			const publicRecord = registry.get(publicInstance)!;

			expect(publicRecord).not.toBeUndefined();
			expect(publicRecord.subjects).toStrictEqual([publicStore]);
			expect(publicRecord.links).toStrictEqual([publicLink]);
			expect(publicRecord.models).toStrictEqual([internalInstance]);

			const internalRecord = registry.get(internalInstance!)!;

			expect(internalRecord).not.toBeUndefined();
			expect(internalRecord.subjects).toStrictEqual([internalStore]);
			expect(internalRecord.links).toStrictEqual([internalLink]);
			expect(internalRecord.models).toHaveLength(0);
		});
	});

	describe("asynchrony", () => {
		it("creates a factory", async () => {
			expect.hasAssertions();

			const state = 0;
			const factory = defineModel(async () => ({
				store: await Promise.resolve(createStore(state)),
			}));

			const model = await factory();

			expect(model.store.read()).toBe(state);
		});

		it("delivers dependencies", async () => {
			expect.hasAssertions();

			const factory = defineModel(
				async (dependencies: { initial: Promise<number> }) => ({
					store: createStore(await dependencies.initial),
				}),
			);

			const initial = 1;
			const model = await factory({ initial: Promise.resolve(initial) });

			expect(model.store.read()).toBe(initial);
		});

		it("registers an instance", async () => {
			expect.hasAssertions();

			let internalStore: Store<number> | null = null;
			let internalLink: Link<any, any, any> | null = null;
			const createInternal = defineModel(() => {
				internalStore = createStore(0);

				internalLink = link({
					clock: { subject: internalStore },
					target: () => {},
				});

				return Promise.resolve({
					store: internalStore,
				});
			});

			let publicStore: Store<number> | null = null;
			let internalInstance: { store: Store<number> } | null = null;
			let publicLink: Link<any, any, any> | null = null;
			const createPublic = defineModel(async () => {
				publicStore = createStore(0);
				internalInstance = await createInternal();

				publicLink = link({
					clock: { subject: publicStore },
					target: internalInstance.store,
				});

				return {
					store: publicStore,
					internal: internalInstance,
				};
			});

			const publicInstance = await createPublic();
			const publicRecord = registry.get(publicInstance)!;

			expect(publicRecord).not.toBeUndefined();
			expect(publicRecord.subjects).toStrictEqual([publicStore]);
			expect(publicRecord.links).toStrictEqual([publicLink]);
			expect(publicRecord.models).toStrictEqual([internalInstance]);

			const internalRecord = registry.get(internalInstance!)!;

			expect(internalRecord).not.toBeUndefined();
			expect(internalRecord.subjects).toStrictEqual([internalStore]);
			expect(internalRecord.links).toStrictEqual([internalLink]);
			expect(internalRecord.models).toHaveLength(0);
		});
	});
});
