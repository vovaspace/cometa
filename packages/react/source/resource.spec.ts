import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

import { createResource, Resource, ResourceStatus } from "./resource";

describe("resource", () => {
	const instance = {};
	const builder = mock.fn(() => instance);
	const cleanup = mock.fn(() => {});
	const resource = createResource(builder, cleanup);

	describe("sync", () => {
		it("skips cleanup when initial", () => {
			resource.cleanup();
			assert.equal(cleanup.mock.calls.length, 0);
		});

		it("resolves", () => {
			const resolved = resource.resolve();

			assert.equal(resolved.status, ResourceStatus.Resolved);
			assert.equal(resolved.instance, instance);
		});

		it("cleans up", () => {
			resource.cleanup();

			assert.equal(cleanup.mock.calls.length, 1);
			assert.deepEqual(cleanup.mock.calls[0]?.arguments, [instance]);
		});
	});
});

// const ResourceSync = suite<{
// 	instance: unknown;
// 	builder: Snoop<() => unknown>;
// 	cleanup: Snoop<() => void>;
// 	resource: Resource<unknown>;
// }>("resource/sync");

// ResourceSync.before((context) => {
// 	context.instance = {};
// 	context.builder = snoop(() => context.instance);
// 	context.cleanup = snoop(() => {});
// 	context.resource = createResource(context.builder.fn, context.cleanup.fn);
// });

// const ResourceAsync = suite("resource/async", {
// 	setup<T>() {
// 		const promise: {
// 			resolve: (instance: T) => void;
// 			reject: (error: unknown) => void;
// 		} = {
// 			resolve: () => {
// 				throw new Error("Not initialized.");
// 			},
// 			reject: () => {
// 				throw new Error("Not initialized.");
// 			},
// 		};

// 		const builder = snoop(
// 			() =>
// 				new Promise<T>((resolve, reject) => {
// 					promise.resolve = resolve;
// 					promise.reject = reject;
// 				}),
// 		);

// 		const cleanup = snoop(() => {});

// 		return {
// 			builder,
// 			cleanup,
// 			promise,
// 			resource: createResource(builder.fn, cleanup.fn),
// 		};
// 	},
// });

// ResourceAsync("resolves", async (context) => {
// 	const { promise, resource } = context.setup<{}>();

// 	let resolved = resource.resolve();

// 	assert.ok(resolved.status === ResourceStatus.Pending);

// 	const instance = {};

// 	promise.resolve(instance);
// 	await resolved.promise;

// 	resolved = resource.resolve();

// 	assert.ok(resolved.status === ResourceStatus.Resolved);
// 	assert.is(resolved.instance, instance);
// });

// ResourceAsync("rejects", async (context) => {
// 	const { promise, resource } = context.setup<{}>();

// 	let resolved = resource.resolve();
// 	assert.ok(resolved.status === ResourceStatus.Pending);

// 	const error = new Error();
// 	promise.reject(error);
// 	await resolved.promise;

// 	resolved = resource.resolve();

// 	assert.ok(resolved.status === ResourceStatus.Rejected);
// 	assert.is(resolved.error, error);
// });

// ResourceAsync("cleans up when resolved", async (context) => {
// 	const { cleanup, promise, resource } = context.setup<{}>();

// 	let resolved = resource.resolve();
// 	assert.ok(resolved.status === ResourceStatus.Pending);

// 	const instance = {};

// 	promise.resolve(instance);
// 	await resolved.promise;

// 	resource.cleanup();
// 	assert.ok(cleanup.calledOnce);
// 	assert.equal(cleanup.lastCall.arguments, [instance]);
// });

// ResourceAsync("cleans up after resolution", async (context) => {
// 	const { cleanup, promise, resource } = context.setup<{}>();

// 	let resolved = resource.resolve();
// 	assert.ok(resolved.status === ResourceStatus.Pending);

// 	resource.cleanup();

// 	assert.ok(cleanup.notCalled);

// 	const instance = {};
// 	promise.resolve(instance);
// 	await resolved.promise;

// 	assert.equal(cleanup.lastCall.arguments, [instance]);
// });

// ResourceAsync(
// 	"skips cleanup when resolution requested again",
// 	async (context) => {
// 		const { cleanup, promise, resource } = context.setup<{}>();

// 		let resolved = resource.resolve();
// 		assert.ok(resolved.status === ResourceStatus.Pending);

// 		resource.cleanup();
// 		assert.ok(cleanup.notCalled);

// 		resolved = resource.resolve();
// 		assert.ok(resolved.status === ResourceStatus.Pending);

// 		promise.resolve({});
// 		await resolved.promise;

// 		assert.ok(cleanup.notCalled);
// 	},
// );

// ResourceAsync("does not build when not initial", async (context) => {
// 	const { builder, promise, resource } = context.setup<{}>();

// 	let resolved = resource.resolve();
// 	assert.ok(builder.calledOnce);

// 	resolved = resource.resolve();
// 	assert.ok(builder.calledOnce);

// 	assert.ok(resolved.status === ResourceStatus.Pending);
// 	promise.resolve({});
// 	await resolved.promise;

// 	resource.resolve();
// 	assert.ok(builder.calledOnce);
// });

// ResourceSync.run();
// ResourceAsync.run();
