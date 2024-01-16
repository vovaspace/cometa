import assert from "node:assert/strict";
import { BindingScope, createContainer } from "./container";
import { ResourceStatus } from "./resource";
import { createToken } from "./token";
describe("container", () => {
    describe("singleton scope", () => {
        it("resolves", () => {
            const container = createContainer();
            const key = "singleton";
            const singleton = {};
            container.bind(key, {
                scope: BindingScope.Singleton,
                instance: singleton,
            });
            const resolution = container.resolve(key);
            const resolved = resolution.resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Resolved);
            expect(resolved.instance).toBe(singleton);
        });
    });
    describe("resolution scope", () => {
        const container = createContainer();
        const Singleton = createToken("singleton");
        const SyncPureInstance = createToken("sync-pure-instance");
        const AsyncPureInstance = createToken("async-pure-instance");
        const AsyncSecondPureInstance = createToken("async-second-pure-instance");
        const AsyncThirdPureInstance = createToken("async-third-pure-instance");
        const SyncNonPureInstance = createToken("sync-non-pure-instance");
        const AsyncNonPureInstance = createToken("async-non-pure-instance");
        const instances = new Map([
            [Singleton, {}],
            [SyncPureInstance, {}],
            [AsyncPureInstance, {}],
            [AsyncSecondPureInstance, {}],
            [AsyncThirdPureInstance, {}],
            [SyncNonPureInstance, {}],
            [AsyncNonPureInstance, {}],
        ]);
        container.bind(Singleton.key, {
            scope: BindingScope.Singleton,
            instance: instances.get(Singleton),
        });
        container.bind(SyncPureInstance.key, {
            scope: BindingScope.Resolution,
            factory: () => instances.get(SyncPureInstance),
            cleanup: () => { },
            pure: true,
        });
        container.bind(AsyncPureInstance.key, {
            scope: BindingScope.Resolution,
            factory: () => Promise.resolve(instances.get(AsyncPureInstance)),
            cleanup: () => { },
            pure: true,
        });
        container.bind(AsyncSecondPureInstance.key, {
            scope: BindingScope.Resolution,
            factory: () => Promise.resolve(instances.get(AsyncSecondPureInstance)),
            cleanup: () => { },
            pure: true,
        });
        container.bind(AsyncThirdPureInstance.key, {
            scope: BindingScope.Resolution,
            factory: () => Promise.resolve(instances.get(AsyncThirdPureInstance)),
            cleanup: () => { },
            pure: true,
        });
        container.bind(SyncNonPureInstance.key, {
            scope: BindingScope.Resolution,
            factory: () => instances.get(SyncNonPureInstance),
            cleanup: () => { },
            pure: false,
        });
        container.bind(AsyncNonPureInstance.key, {
            scope: BindingScope.Resolution,
            factory: () => Promise.resolve(instances.get(AsyncNonPureInstance)),
            cleanup: () => { },
            pure: false,
        });
        beforeAll(() => {
            jest.useFakeTimers();
        });
        afterAll(() => {
            jest.useRealTimers();
        });
        it.each([
            {
                name: "a synchronous instance without dependencies",
                sync: true,
                dependencies: [],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "an asynchronous instance without dependencies",
                sync: false,
                dependencies: [],
                factory: (i) => Promise.resolve(i),
                pure: true,
            },
            {
                name: "a synchronous non-pure instance without dependencies",
                sync: false,
                dependencies: [],
                factory: (i) => i,
                pure: false,
            },
            {
                name: "an asynchronous non-pure instance without dependencies",
                sync: false,
                dependencies: [],
                factory: (i) => Promise.resolve(i),
                pure: false,
            },
            {
                name: "a synchronous instance with a synchronous dependency",
                sync: true,
                dependencies: [SyncPureInstance],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "a synchronous instance with an asynchronous dependency",
                sync: false,
                dependencies: [AsyncPureInstance],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "an asynchronous instance with an asynchronous dependency",
                sync: false,
                dependencies: [AsyncPureInstance],
                factory: (i) => Promise.resolve(i),
                pure: true,
            },
            {
                name: "a synchronous instance with a synchronous non-pure dependency",
                sync: false,
                dependencies: [SyncNonPureInstance],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "a synchronous instance with an asynchronous non-pure dependency",
                sync: false,
                dependencies: [AsyncNonPureInstance],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "an asynchronous instance with a synchronous non-pure dependency",
                sync: false,
                dependencies: [SyncNonPureInstance],
                factory: (i) => Promise.resolve(i),
                pure: true,
            },
            {
                name: "an asynchronous instance with an asynchronous non-pure dependency",
                sync: false,
                dependencies: [AsyncNonPureInstance],
                factory: (i) => Promise.resolve(i),
                pure: true,
            },
            {
                name: "a synchronous instance with already resolved asynchronous dependencies",
                sync: true,
                dependencies: [AsyncPureInstance, AsyncNonPureInstance],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "a synchronous instance with mixed dependencies",
                sync: false,
                dependencies: [
                    Singleton,
                    AsyncPureInstance,
                    AsyncSecondPureInstance,
                    AsyncNonPureInstance,
                    SyncPureInstance,
                    SyncNonPureInstance,
                ],
                factory: (i) => i,
                pure: true,
            },
            {
                name: "an asynchronous instance with mixed dependencies",
                sync: false,
                dependencies: [
                    Singleton,
                    AsyncPureInstance,
                    AsyncThirdPureInstance,
                    AsyncNonPureInstance,
                    SyncPureInstance,
                    SyncNonPureInstance,
                ],
                factory: (i) => Promise.resolve(i),
                pure: true,
            },
            {
                name: "a synchronous non-pure instance",
                sync: false,
                dependencies: [SyncPureInstance],
                factory: (i) => i,
                pure: false,
            },
            {
                name: "an asynchronous non-pure instance",
                sync: false,
                dependencies: [SyncPureInstance],
                factory: (i) => Promise.resolve(i),
                pure: false,
            },
        ])("resolves $name", async (c) => {
            const hasDependencies = c.dependencies.length > 0;
            if (hasDependencies)
                container.bind(c.name, {
                    scope: BindingScope.Resolution,
                    factory: (dependencies) => c.factory({ dependencies }),
                    dependencies: () => Object.fromEntries(c.dependencies.map((d) => [d.key, d])),
                    cleanup: () => { },
                    pure: c.pure,
                });
            else
                container.bind(c.name, {
                    scope: BindingScope.Resolution,
                    factory: () => c.factory({ empty: true }),
                    cleanup: () => { },
                    pure: c.pure,
                });
            const resolution = container.resolve(c.name);
            let resolved = resolution.resource.resolve();
            if (!c.sync) {
                assert.equal(resolved.status, ResourceStatus.Pending);
                await resolved.promise;
            }
            resolved = resolution.resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Resolved);
            if (hasDependencies)
                expect(resolved.instance).toStrictEqual({
                    dependencies: Object.fromEntries(c.dependencies.map((d) => [d.key, instances.get(d)])),
                });
            else
                expect(resolved.instance).toStrictEqual({ empty: true });
        });
        describe("cleanup", () => {
            const cleanup = jest.fn();
            const key = "instance-for-cleanup";
            container.bind(key, {
                scope: BindingScope.Resolution,
                factory: () => ({}),
                cleanup,
                pure: true,
            });
            const resolution = container.resolve(key);
            beforeEach(() => {
                cleanup.mockReset();
            });
            it("asynchronously cleans up an instance on untaken", () => {
                jest.runAllTimers();
                expect(cleanup).not.toHaveBeenCalled();
                let resolved = resolution.resource.resolve();
                assert.equal(resolved.status, ResourceStatus.Resolved);
                const { instance } = resolved;
                const firstUntake = resolution.take();
                const secondUntake = resolution.take();
                const thirdUntake = resolution.take();
                jest.runAllTimers();
                expect(cleanup).not.toHaveBeenCalled();
                thirdUntake();
                jest.runAllTimers();
                expect(cleanup).not.toHaveBeenCalled();
                firstUntake();
                jest.runAllTimers();
                expect(cleanup).not.toHaveBeenCalled();
                secondUntake();
                jest.runAllTimers();
                expect(cleanup).toHaveBeenCalledWith(instance);
                resolved = resolution.resource.resolve();
                assert.equal(resolved.status, ResourceStatus.Resolved);
                expect(resolved.instance).not.toBe(instance);
            });
            it("skips instance cleanup if it was taken again", () => {
                let untake = resolution.take();
                untake();
                untake = resolution.take();
                jest.runAllTimers();
                expect(cleanup).not.toHaveBeenCalled();
                untake();
            });
            it("cleans up once if was taken-and-untaken during asynchronous cleanup", () => {
                let resolved = resolution.resource.resolve();
                assert.equal(resolved.status, ResourceStatus.Resolved);
                const { instance } = resolved;
                let untake = resolution.take();
                untake();
                untake = resolution.take();
                untake();
                untake = resolution.take();
                untake();
                jest.runAllTimers();
                expect(cleanup).toHaveBeenCalledWith(instance);
                resolved = resolution.resource.resolve();
                assert.equal(resolved.status, ResourceStatus.Resolved);
                expect(resolved.instance).not.toBe(instance);
            });
        });
    });
});
