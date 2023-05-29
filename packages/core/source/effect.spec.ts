import { Context, context, RuntimeContext } from "./context";
import { effect, EffectStatus } from "./effect";
import { lifecycle } from "./lifecycle";

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

	const fx = effect<number, number>(handler);

	fx.listen(emitedListener);

	fx.launched.listen(launchedListener);
	fx.fulfilled.listen(fulfilledListener);
	fx.rejected.listen(rejectedListener);
	fx.settled.listen(settledListener);

	fx.payloaded.listen(payloadedListener);
	fx.resulted.listen(resultedListener);
	fx.failed.listen(failedListener);

	return {
		fx,
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

		const { fx, handler, emitedListener, launchedListener, payloadedListener } =
			setup();

		const payload = 1;

		handler.mockResolvedValue(0);

		fx.listen(() => {
			expect(handler).not.toHaveBeenCalled();
		});

		fx.launched.listen(() => {
			expect(handler).toHaveBeenCalled();
		});

		fx.payloaded.listen(() => {
			expect(handler).toHaveBeenCalled();
		});

		fx(payload);

		expect(emitedListener).toHaveBeenCalledWith(payload);
		expect(launchedListener).toHaveBeenCalledWith(
			expect.objectContaining({ payload }),
		);
		expect(payloadedListener).toHaveBeenCalledWith(payload);
	});

	it("resolves", async () => {
		expect.hasAssertions();

		const {
			fx,
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

		const promise = fx(payload);

		expect(fx.inFlight.read()).toBe(1);

		await expect(promise).resolves.toBe(result);

		expect(fx.inFlight.read()).toBe(0);

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
			fx,
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

		const promise = fx(payload);

		expect(fx.inFlight.read()).toBe(1);

		await expect(promise).rejects.toBe(error);

		expect(fx.inFlight.read()).toBe(0);

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
		const fx = effect(handler);

		fx.fulfilled.listen(() => {
			expect(context.current).toBe(current);
		});

		fx.rejected.listen(() => {
			expect(context.current).toBe(current);
		});

		fx.settled.listen(() => {
			expect(context.current).toBe(current);
		});

		context.current = current;
		handler.mockResolvedValue(0);
		let promise = fx();
		context.current = RuntimeContext;

		await promise;

		context.current = current;
		handler.mockRejectedValue(new Error());
		promise = fx();
		context.current = RuntimeContext;

		try {
			await promise;
		} catch {}

		context.current = RuntimeContext;
	});

	it("unbinds the listener", () => {
		const listener = jest.fn();

		const { fx } = setup();
		const unlisten = fx.listen(listener);
		unlisten();

		fx(1);

		expect(listener).not.toHaveBeenCalled();
	});

	it("notifies lifecycle", () => {
		const subject = jest.spyOn(lifecycle.current, "subject");
		const fx = effect(() => {});

		expect(subject).toHaveBeenCalledWith(fx);
	});
});
