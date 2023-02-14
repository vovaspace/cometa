import { Context, context, RuntimeContext } from "../context";
import { lifecycle } from "../lifecycle";
import { createEffect, EffectStatus } from "./effect";

const setup = () => {
	const handler = jest.fn();

	const emitedListener = jest.fn();

	const launchedListener = jest.fn();
	const fulfilledListener = jest.fn();
	const rejectedListener = jest.fn();
	const settledListener = jest.fn();

	const payloadedListener = jest.fn();
	const resultedListener = jest.fn();
	const failedListener = jest.fn();

	const effect = createEffect<number, number>(handler);

	effect.listen(emitedListener);

	effect.launched.listen(launchedListener);
	effect.fulfilled.listen(fulfilledListener);
	effect.rejected.listen(rejectedListener);
	effect.settled.listen(settledListener);

	effect.payloaded.listen(payloadedListener);
	effect.resulted.listen(resultedListener);
	effect.failed.listen(failedListener);

	return {
		effect,
		handler,
		emitedListener,
		launchedListener,
		fulfilledListener,
		rejectedListener,
		settledListener,
		payloadedListener,
		resultedListener,
		failedListener,
	};
};

describe("effect", () => {
	it("invokes", () => {
		expect.assertions(6);

		const {
			effect,
			handler,
			emitedListener,
			launchedListener,
			payloadedListener,
		} = setup();

		const payload = 1;

		handler.mockResolvedValue(0);

		effect.listen(() => {
			expect(handler).not.toHaveBeenCalled();
		});

		effect.launched.listen(() => {
			expect(handler).toHaveBeenCalled();
		});

		effect.payloaded.listen(() => {
			expect(handler).toHaveBeenCalled();
		});

		effect(payload);

		expect(emitedListener).toHaveBeenCalledWith(payload);
		expect(launchedListener).toHaveBeenCalledWith(
			expect.objectContaining({ payload }),
		);
		expect(payloadedListener).toHaveBeenCalledWith(payload);
	});

	it("resolves", async () => {
		expect.hasAssertions();

		const {
			effect,
			handler,
			fulfilledListener,
			rejectedListener,
			settledListener,
			resultedListener,
			failedListener,
		} = setup();

		const payload = 1;
		const result = 2;

		handler.mockResolvedValue(result);

		const promise = effect(payload);

		expect(effect.inFlight.read()).toBe(1);

		await expect(promise).resolves.toBe(result);

		expect(effect.inFlight.read()).toBe(0);

		expect(fulfilledListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: EffectStatus.Fulfilled,
				payload,
				result,
			}),
		);

		expect(settledListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: EffectStatus.Fulfilled,
				payload,
				result,
			}),
		);

		expect(resultedListener).toHaveBeenCalledWith(result);

		expect(rejectedListener).not.toHaveBeenCalled();
		expect(failedListener).not.toHaveBeenCalled();
	});

	it("rejects", async () => {
		expect.hasAssertions();

		const {
			effect,
			handler,
			fulfilledListener,
			rejectedListener,
			settledListener,
			resultedListener,
			failedListener,
		} = setup();

		const payload = 1;
		const error = new Error();

		handler.mockRejectedValue(error);

		const promise = effect(payload);

		expect(effect.inFlight.read()).toBe(1);

		await expect(promise).rejects.toBe(error);

		expect(effect.inFlight.read()).toBe(0);

		expect(rejectedListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: EffectStatus.Rejected,
				payload,
				error,
			}),
		);

		expect(settledListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: EffectStatus.Rejected,
				payload,
				error,
			}),
		);

		expect(failedListener).toHaveBeenCalledWith(error);

		expect(fulfilledListener).not.toHaveBeenCalled();
		expect(resultedListener).not.toHaveBeenCalled();
	});

	it("keeps context", async () => {
		expect.assertions(4);

		const current: Context = {
			inFlight: 0,
			error: jest.fn,
		};

		const handler = jest.fn<Promise<number>, []>();
		const effect = createEffect(handler);

		effect.fulfilled.listen(() => {
			expect(context.current).toBe(current);
		});

		effect.rejected.listen(() => {
			expect(context.current).toBe(current);
		});

		effect.settled.listen(() => {
			expect(context.current).toBe(current);
		});

		context.current = current;
		handler.mockResolvedValue(0);
		let promise = effect();
		context.current = RuntimeContext;

		await promise;

		context.current = current;
		handler.mockRejectedValue(new Error());
		promise = effect();
		context.current = RuntimeContext;

		try {
			await promise;
		} catch {}

		context.current = RuntimeContext;
	});

	it("unbinds the listener", () => {
		const listener = jest.fn();

		const { effect } = setup();
		const unlisten = effect.listen(listener);
		unlisten();

		effect(1);

		expect(listener).not.toHaveBeenCalled();
	});

	it("notifies lifecycle", () => {
		const subject = jest.spyOn(lifecycle.current, "subject");
		const effect = createEffect(() => {});

		expect(subject).toHaveBeenCalledWith(effect);
	});
});
