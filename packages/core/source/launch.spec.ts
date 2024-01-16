import { channel } from "./channel";
import { context, RuntimeContext } from "./context";
import { launch } from "./launch";
import { link } from "./link";
import { routine } from "./routine";

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

	const r = routine(() => promise);

	return {
		r,
		resolve,
		reject,
	};
};

describe("launch", () => {
	it("safely invokes a routine", async () => {
		expect.hasAssertions();

		const handler = jest.fn();
		const r = routine(handler);
		const error = new Error();
		handler.mockRejectedValue(error);

		await expect(launch(r)).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [error],
		});
	});

	it("waits for all routines are settled", async () => {
		expect.hasAssertions();

		const { r: first, resolve: resolveFirst } = setup();

		const firstInvokeListener = jest.fn();
		first.listen(firstInvokeListener);

		const firstSettledListener = jest.fn();
		first.settled.listen(firstSettledListener);

		const { r: second, resolve: resolveSecond } = setup();

		const secondInvokeListener = jest.fn();
		second.listen(secondInvokeListener);

		const secondSettledListener = jest.fn();
		second.settled.listen(secondSettledListener);

		const payload = 0;
		const tirgger = channel<number>();

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

	it("continues running even if a routine is rejected", async () => {
		expect.hasAssertions();

		const { r: rejecting, reject } = setup();

		const rejectingSettledListener = jest.fn();
		rejecting.settled.listen(rejectingSettledListener);

		const { r: resolving, resolve } = setup();

		const resolvingSettledListener = jest.fn();
		resolving.settled.listen(resolvingSettledListener);

		const tirgger = channel();

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
		const first = routine(() => Promise.resolve());
		const second = routine(() => Promise.resolve());

		await Promise.all([launch(first), launch(second)]);

		expect(context.current).toBe(RuntimeContext);
	});

	it("launches multiple contexts in parallel", async () => {
		/**
		 * Resolution sequence:
		 *
		 *           CTX-2 — R-1 — RES
		 *                           ↓
		 * CTX-1 — R-1 — REJ        ↓
		 *  ↓                        ↓
		 * CTX-1 — R-2 — RES        ↓
		 *  ↓                        ↓
		 *  ↓        CTX-2 — R-2 — RES
		 *  ↓                        ↓
		 * CTX-1 — R-3 — REJ        ↓
		 *                           ↓
		 *           CTX-2 — R-3 — REJ
		 */

		const firstContextFirstRoutineError = new Error();
		const {
			r: firstContextFirstRoutine,
			reject: rejectFirstContextFirstRoutine,
		} = setup();

		const {
			r: firstContextSecondRoutine,
			resolve: resolveFirstContextSecondRoutine,
		} = setup();

		const firstContextThirdRoutineError = new Error();
		const {
			r: firstContextThirdRoutine,
			reject: rejectFirstContextThirdRoutine,
		} = setup();

		const {
			r: secondContextFirstRoutine,
			resolve: resolveSecondContextFirstRoutine,
		} = setup();

		const {
			r: secondContextSecondRoutine,
			resolve: resolveSecondContextSecondRoutine,
		} = setup();

		const secondContextThirdRoutineError = new Error();
		const {
			r: secondContextThirdRoutine,
			reject: rejectSecondContextThirdRoutine,
		} = setup();

		link({
			clock: { subject: firstContextFirstRoutine.settled },
			target: firstContextSecondRoutine,
		});
		link({
			clock: { subject: firstContextSecondRoutine.settled },
			target: firstContextThirdRoutine,
		});

		link({
			clock: { subject: secondContextFirstRoutine.settled },
			target: secondContextSecondRoutine,
		});
		link({
			clock: { subject: secondContextSecondRoutine.settled },
			target: secondContextThirdRoutine,
		});

		const firstLaunching = launch(firstContextFirstRoutine);
		const secondLaunching = launch(secondContextFirstRoutine);

		resolveSecondContextFirstRoutine();
		rejectFirstContextFirstRoutine(firstContextFirstRoutineError);
		resolveFirstContextSecondRoutine();
		resolveSecondContextSecondRoutine();
		rejectFirstContextThirdRoutine(firstContextThirdRoutineError);
		rejectSecondContextThirdRoutine(secondContextThirdRoutineError);

		await expect(firstLaunching).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [firstContextFirstRoutineError, firstContextThirdRoutineError],
		});

		await expect(secondLaunching).resolves.toStrictEqual({
			inFlight: 0,
			error: expect.any(Function),
			errors: [secondContextThirdRoutineError],
		});
	});
});
