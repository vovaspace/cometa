import { CouplingRegistry } from "./coupling";
import { Link, link } from "./link";
import { Model, model } from "./model";
import { Store, store } from "./store";

describe("model", () => {
	describe("synchrony", () => {
		it("creates a factory", () => {
			const state = 0;
			const create = model(() => ({
				store: store(state),
			}));

			const instance = create();

			expect(instance.store.read()).toBe(state);
		});

		it("delivers dependencies", () => {
			const create = model((dependencies: { initial: number }) => ({
				store: store(dependencies.initial),
			}));

			const initial = 1;
			const instance = create({ initial: initial });

			expect(instance.store.read()).toBe(initial);
		});

		it("registers an instance", () => {
			let internalStore: Store<number> | null = null;
			let internalLink: Link<any, any, any> | null = null;
			const createInternal = model(() => {
				internalStore = store(0);

				internalLink = link({
					clock: { subject: internalStore },
					target: () => {},
				});

				return {
					store: internalStore,
				};
			});

			let publicStore: Store<number> | null = null;
			let internalModel: Model<{ store: Store<number> }> | null = null;
			let publicLink: Link<any, any, any> | null = null;
			const createPublic = model(() => {
				publicStore = store(0);
				internalModel = createInternal();

				publicLink = link({
					clock: { subject: publicStore },
					target: internalModel.store,
				});

				return {
					store: publicStore,
					internal: internalModel,
				};
			});

			const publicInstance = createPublic();
			const publicCoupling = CouplingRegistry.get(publicInstance)!;

			expect(publicCoupling).toBeDefined();
			expect(publicCoupling.subjects).toStrictEqual([publicStore]);
			expect(publicCoupling.links).toStrictEqual([publicLink]);
			expect(publicCoupling.models).toStrictEqual([internalModel]);

			const internalCoupling = CouplingRegistry.get(internalModel!)!;

			expect(internalCoupling).toBeDefined();
			expect(internalCoupling.subjects).toStrictEqual([internalStore]);
			expect(internalCoupling.links).toStrictEqual([internalLink]);
			expect(internalCoupling.models).toStrictEqual([]);
		});
	});

	describe("asynchrony", () => {
		it("creates a factory", async () => {
			const state = 0;
			const create = model(async () => ({
				store: await Promise.resolve(store(state)),
			}));

			const instance = await create();

			expect(instance.store.read()).toBe(state);
		});

		it("delivers dependencies", async () => {
			const create = model(async (dependencies: { initial: Promise<number> }) => ({
				store: store(await dependencies.initial),
			}));

			const initial = 1;
			const instance = await create({ initial: Promise.resolve(initial) });

			expect(instance.store.read()).toBe(initial);
		});

		it("registers an instance", async () => {
			let internalStore: Store<number> | null = null;
			let internalLink: Link<any, any, any> | null = null;
			const createInternal = model(() => {
				internalStore = store(0);

				internalLink = link({
					clock: { subject: internalStore },
					target: () => {},
				});

				return Promise.resolve({
					store: internalStore,
				});
			});

			let publicStore: Store<number> | null = null;
			let internalModel: Model<{ store: Store<number> }> | null = null;
			let publicLink: Link<any, any, any> | null = null;
			const createPublic = model(async () => {
				publicStore = store(0);
				internalModel = await createInternal();

				publicLink = link({
					clock: { subject: publicStore },
					target: internalModel.store,
				});

				return {
					store: publicStore,
					internal: internalModel,
				};
			});

			const publicInstance = await createPublic();
			const publicCoupling = CouplingRegistry.get(publicInstance)!;

			expect(publicCoupling).toBeDefined();
			expect(publicCoupling.subjects).toStrictEqual([publicStore]);
			expect(publicCoupling.links).toStrictEqual([publicLink]);
			expect(publicCoupling.models).toStrictEqual([internalModel]);

			const internalCoupling = CouplingRegistry.get(internalModel!)!;

			expect(internalCoupling).toBeDefined();
			expect(internalCoupling.subjects).toStrictEqual([internalStore]);
			expect(internalCoupling.links).toStrictEqual([internalLink]);
			expect(internalCoupling.models).toStrictEqual([]);
		});
	});
});
