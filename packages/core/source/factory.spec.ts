import { CouplingRegistry } from "./coupling";
import { factory, Instance } from "./factory";
import { Link, link } from "./link";
import { store, Store } from "./store";

describe("factory", () => {
	describe("synchrony", () => {
		it("creates a factory", () => {
			const state = 0;
			const create = factory(() => ({
				store: store(state),
			}));

			const instance = create();

			expect(instance.store.read()).toBe(state);
		});

		it("delivers input", () => {
			const create = factory((input: { initial: number }) => ({
				store: store(input.initial),
			}));

			const initial = 1;
			const instance = create({ initial: initial });

			expect(instance.store.read()).toBe(initial);
		});

		it("registers an instance", () => {
			let internalStore: Store<number> | null = null;
			let internalLink: Link<any, any, any> | null = null;
			const createInternal = factory(() => {
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
			let internalInstance: Instance<{ store: Store<number> }> | null = null;
			let publicLink: Link<any, any, any> | null = null;
			const createPublic = factory(() => {
				publicStore = store(0);
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
			const publicCoupling = CouplingRegistry.get(publicInstance)!;

			expect(publicCoupling).not.toBeUndefined();
			expect(publicCoupling.subjects).toStrictEqual([publicStore]);
			expect(publicCoupling.links).toStrictEqual([publicLink]);
			expect(publicCoupling.instances).toStrictEqual([internalInstance]);

			const internalCoupling = CouplingRegistry.get(internalInstance!)!;

			expect(internalCoupling).not.toBeUndefined();
			expect(internalCoupling.subjects).toStrictEqual([internalStore]);
			expect(internalCoupling.links).toStrictEqual([internalLink]);
			expect(internalCoupling.instances).toHaveLength(0);
		});
	});

	describe("asynchrony", () => {
		it("creates a factory", async () => {
			expect.hasAssertions();

			const state = 0;
			const create = factory(async () => ({
				store: await Promise.resolve(store(state)),
			}));

			const instance = await create();

			expect(instance.store.read()).toBe(state);
		});

		it("delivers input", async () => {
			expect.hasAssertions();

			const create = factory(async (input: { initial: Promise<number> }) => ({
				store: store(await input.initial),
			}));

			const initial = 1;
			const instance = await create({ initial: Promise.resolve(initial) });

			expect(instance.store.read()).toBe(initial);
		});

		it("registers an instance", async () => {
			expect.hasAssertions();

			let internalStore: Store<number> | null = null;
			let internalLink: Link<any, any, any> | null = null;
			const createInternal = factory(() => {
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
			let internalInstance: Instance<{ store: Store<number> }> | null = null;
			let publicLink: Link<any, any, any> | null = null;
			const createPublic = factory(async () => {
				publicStore = store(0);
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
			const publicCoupling = CouplingRegistry.get(publicInstance)!;

			expect(publicCoupling).not.toBeUndefined();
			expect(publicCoupling.subjects).toStrictEqual([publicStore]);
			expect(publicCoupling.links).toStrictEqual([publicLink]);
			expect(publicCoupling.instances).toStrictEqual([internalInstance]);

			const internalCoupling = CouplingRegistry.get(internalInstance!)!;

			expect(internalCoupling).not.toBeUndefined();
			expect(internalCoupling.subjects).toStrictEqual([internalStore]);
			expect(internalCoupling.links).toStrictEqual([internalLink]);
			expect(internalCoupling.instances).toHaveLength(0);
		});
	});
});
