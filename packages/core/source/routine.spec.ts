import { Context, context, RuntimeContext } from "./context";
import { lifecycle } from "./lifecycle";
import { routine, RoutineStatus } from "./routine";

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

	const r = routine<number, number>(handler);

	r.listen(emitedListener);

	r.launched.listen(launchedListener);
	r.fulfilled.listen(fulfilledListener);
	r.rejected.listen(rejectedListener);
	r.settled.listen(settledListener);

	r.payloaded.listen(payloadedListener);
	r.resulted.listen(resultedListener);
	r.failed.listen(failedListener);

	return {
		r,
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

describe("routine", () => {
	it("invokes", () => {
		expect.assertions(6);

		const { r, handler, emitedListener, launchedListener, payloadedListener } =
			setup();

		const payload = 1;

		handler.mockResolvedValue(0);

		r.listen(() => {
			expect(handler).not.toHaveBeenCalled();
		});

		r.launched.listen(() => {
			expect(handler).toHaveBeenCalled();
		});

		r.payloaded.listen(() => {
			expect(handler).toHaveBeenCalled();
		});

		r(payload);

		expect(emitedListener).toHaveBeenCalledWith(payload);
		expect(launchedListener).toHaveBeenCalledWith(
			expect.objectContaining({ payload }),
		);
		expect(payloadedListener).toHaveBeenCalledWith(payload);
	});

	it("resolves", async () => {
		expect.hasAssertions();

		const {
			r,
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

		const promise = r(payload);

		expect(r.inFlight.read()).toBe(1);

		await expect(promise).resolves.toBe(result);

		expect(r.inFlight.read()).toBe(0);

		expect(fulfilledListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: RoutineStatus.Fulfilled,
				payload,
				result,
			}),
		);

		expect(settledListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: RoutineStatus.Fulfilled,
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
			r,
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

		const promise = r(payload);

		expect(r.inFlight.read()).toBe(1);

		await expect(promise).rejects.toBe(error);

		expect(r.inFlight.read()).toBe(0);

		expect(rejectedListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: RoutineStatus.Rejected,
				payload,
				error,
			}),
		);

		expect(settledListener).toHaveBeenCalledWith(
			expect.objectContaining({
				status: RoutineStatus.Rejected,
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
		const r = routine(handler);

		r.fulfilled.listen(() => {
			expect(context.current).toBe(current);
		});

		r.rejected.listen(() => {
			expect(context.current).toBe(current);
		});

		r.settled.listen(() => {
			expect(context.current).toBe(current);
		});

		context.current = current;
		handler.mockResolvedValue(0);
		let promise = r();
		context.current = RuntimeContext;

		await promise;

		context.current = current;
		handler.mockRejectedValue(new Error());
		promise = r();
		context.current = RuntimeContext;

		try {
			await promise;
		} catch {}

		context.current = RuntimeContext;
	});

	it("unbinds the listener", () => {
		const listener = jest.fn();

		const { r } = setup();
		const unlisten = r.listen(listener);
		unlisten();

		r(1);

		expect(listener).not.toHaveBeenCalled();
	});

	it("notifies lifecycle", () => {
		const subject = jest.spyOn(lifecycle.current, "subject");
		const r = routine(() => {});

		expect(subject).toHaveBeenCalledWith(r);
	});
});
