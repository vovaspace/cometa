import assert from "node:assert/strict";
import { createResource, ResourceStatus } from "./resource";
describe("resource", () => {
    describe("sync", () => {
        const instance = {};
        const builder = jest.fn(() => instance);
        const cleanup = jest.fn();
        const resource = createResource(builder, cleanup);
        it("skips cleanup when initial", () => {
            resource.cleanup();
            expect(cleanup).not.toHaveBeenCalled();
        });
        it("resolves", () => {
            const resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Resolved);
            expect(resolved.instance).toBe(instance);
        });
        it("cleans up", () => {
            resource.cleanup();
            expect(cleanup).toHaveBeenCalledWith(instance);
        });
    });
    describe("async", () => {
        const setup = () => {
            const promise = {
                resolve: () => {
                    throw new Error("Not initialized.");
                },
                reject: () => {
                    throw new Error("Not initialized.");
                },
            };
            const builder = jest.fn(() => new Promise((resolve, reject) => {
                promise.resolve = resolve;
                promise.reject = reject;
            }));
            const cleanup = jest.fn();
            return {
                builder,
                cleanup,
                promise,
                resource: createResource(builder, cleanup),
            };
        };
        it("resolves", async () => {
            const { promise, resource } = setup();
            let resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Pending);
            const instance = {};
            promise.resolve(instance);
            await resolved.promise;
            resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Resolved);
            expect(resolved.instance).toBe(instance);
        });
        it("rejects", async () => {
            const { promise, resource } = setup();
            let resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Pending);
            const error = new Error();
            promise.reject(error);
            await resolved.promise;
            resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Rejected);
            expect(resolved.error).toBe(error);
        });
        it("cleans up when resolved", async () => {
            const { cleanup, promise, resource } = setup();
            let resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Pending);
            const instance = {};
            promise.resolve(instance);
            await resolved.promise;
            resource.cleanup();
            expect(cleanup).toHaveBeenCalledWith(instance);
        });
        it("cleans up after resolution", async () => {
            const { cleanup, promise, resource } = setup();
            let resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Pending);
            resource.cleanup();
            expect(cleanup).not.toHaveBeenCalled();
            const instance = {};
            promise.resolve(instance);
            await resolved.promise;
            expect(cleanup).toHaveBeenCalledWith(instance);
        });
        it("skips cleanup when resolution requested again", async () => {
            const { cleanup, promise, resource } = setup();
            let resolved = resource.resolve();
            assert.strictEqual(resolved.status, ResourceStatus.Pending);
            resource.cleanup();
            expect(cleanup).not.toHaveBeenCalled();
            resolved = resource.resolve();
            assert.equal(resolved.status, ResourceStatus.Pending);
            promise.resolve({});
            await resolved.promise;
            expect(cleanup).not.toHaveBeenCalled();
        });
        it("does not build when not initial", async () => {
            const { builder, promise, resource } = setup();
            let resolved = resource.resolve();
            expect(builder).toHaveBeenCalledTimes(1);
            resolved = resource.resolve();
            expect(builder).toHaveBeenCalledTimes(1);
            assert.equal(resolved.status, ResourceStatus.Pending);
            promise.resolve({});
            await resolved.promise;
            resource.resolve();
            expect(builder).toHaveBeenCalledTimes(1);
        });
    });
});
