import { context, RuntimeContext } from "./context";
import { effect } from "./effect";
import { event } from "./event";
import { launch } from "./launch";
import { link } from "./link";

const setup = () => {
	let resolve: () => void = () => {
		throw new Error("`resolve` is not initialized.");
	};

	let reject: (error: Error) => void = () => {
		throw new Error("`reject` is not initialized.");
	};

	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	const fx = effect(() => promise);

	return {
		fx,
		resolve,
		reject,
	};
};

describe("launch", () => {
	it("safely invokes an effect", async () => {
		expect.hasAssertions();

		const handler = jest.fn();
		const fx = effect(handler);
		const error = new Error();
		handler.mockRejectedValue(error);

		await expect(launch(fx)).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [error],
		});
	});

	it("waits for all effects are settled", async () => {
		expect.hasAssertions();

		const { fx: first, resolve: resolveFirst } = setup();

		const firstInvokeListener = jest.fn();
		first.listen(firstInvokeListener);

		const firstSettledListener = jest.fn();
		first.settled.listen(firstSettledListener);

		const { fx: second, resolve: resolveSecond } = setup();

		const secondInvokeListener = jest.fn();
		second.listen(secondInvokeListener);

		const secondSettledListener = jest.fn();
		second.settled.listen(secondSettledListener);

		const payload = 0;
		const tirgger = event<number>();

		link({
			clock: { subject: tirgger },
			target: first,
		});
		link({
			clock: { subject: tirgger },
			target: second,
		});

		const launching = launch(tirgger, payload);

		resolveSecond();
		resolveFirst();

		await expect(launching).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [],
		});

		expect(firstInvokeListener).toHaveBeenCalledWith(payload);
		expect(secondInvokeListener).toHaveBeenCalledWith(payload);

		expect(firstSettledListener).toHaveBeenCalledTimes(1);
		expect(secondSettledListener).toHaveBeenCalledTimes(1);
	});

	it("continues running even if an effect is rejected", async () => {
		expect.hasAssertions();

		const { fx: rejecting, reject } = setup();

		const rejectingSettledListener = jest.fn();
		rejecting.settled.listen(rejectingSettledListener);

		const { fx: resolving, resolve } = setup();

		const resolvingSettledListener = jest.fn();
		resolving.settled.listen(resolvingSettledListener);

		const tirgger = event();

		link({
			clock: { subject: tirgger },
			target: rejecting,
		});
		link({
			clock: { subject: tirgger },
			target: resolving,
		});

		const launching = launch(tirgger);

		const error = new Error();
		reject(error);
		resolve();

		await expect(launching).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [error],
		});

		expect(rejectingSettledListener).toHaveBeenCalledTimes(1);
		expect(resolvingSettledListener).toHaveBeenCalledTimes(1);
	});

	it("restores runtime context", async () => {
		const first = effect(() => Promise.resolve());
		const second = effect(() => Promise.resolve());

		await Promise.all([launch(first), launch(second)]);

		expect(context.current).toBe(RuntimeContext);
	});

	it("launches multiple contexts in parallel", async () => {
		/**
		 * Resolution sequence:
		 *
		 *           CTX-2 — FX-1 — RES
		 *                           ↓
		 * CTX-1 — FX-1 — REJ        ↓
		 *  ↓                        ↓
		 * CTX-1 — FX-2 — RES        ↓
		 *  ↓                        ↓
		 *  ↓        CTX-2 — FX-2 — RES
		 *  ↓                        ↓
		 * CTX-1 — FX-3 — REJ        ↓
		 *                           ↓
		 *           CTX-2 — FX-3 — REJ
		 */

		const firstContextFirstEffectError = new Error();
		const { fx: firstContextFirstEffect, reject: rejectFirstContextFirstEffect } =
			setup();

		const {
			fx: firstContextSecondEffect,
			resolve: resolveFirstContextSecondEffect,
		} = setup();

		const firstContextThirdEffectError = new Error();
		const { fx: firstContextThirdEffect, reject: rejectFirstContextThirdEffect } =
			setup();

		const {
			fx: secondContextFirstEffect,
			resolve: resolveSecondContextFirstEffect,
		} = setup();

		const {
			fx: secondContextSecondEffect,
			resolve: resolveSecondContextSecondEffect,
		} = setup();

		const secondContextThirdEffectError = new Error();
		const {
			fx: secondContextThirdEffect,
			reject: rejectSecondContextThirdEffect,
		} = setup();

		link({
			clock: { subject: firstContextFirstEffect.settled },
			target: firstContextSecondEffect,
		});
		link({
			clock: { subject: firstContextSecondEffect.settled },
			target: firstContextThirdEffect,
		});

		link({
			clock: { subject: secondContextFirstEffect.settled },
			target: secondContextSecondEffect,
		});
		link({
			clock: { subject: secondContextSecondEffect.settled },
			target: secondContextThirdEffect,
		});

		const firstLaunching = launch(firstContextFirstEffect);
		const secondLaunching = launch(secondContextFirstEffect);

		resolveSecondContextFirstEffect();
		rejectFirstContextFirstEffect(firstContextFirstEffectError);
		resolveFirstContextSecondEffect();
		resolveSecondContextSecondEffect();
		rejectFirstContextThirdEffect(firstContextThirdEffectError);
		rejectSecondContextThirdEffect(secondContextThirdEffectError);

		await expect(firstLaunching).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [firstContextFirstEffectError, firstContextThirdEffectError],
		});

		await expect(secondLaunching).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [secondContextThirdEffectError],
		});
	});
});
