import { lifecycle } from "./lifecycle";
import { store } from "./store";
import { stream } from "./stream";
import { thread, ThreadController } from "./thread";

describe("thread", () => {
	jest.useFakeTimers();

	describe("setting up", () => {
		it("sets up on the first link creation", () => {
			const setup = jest.fn(() => {});

			const th = thread<number>(setup);

			th.listen(() => {});
			th.listen(() => {});

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up when all links are unlinked", () => {
			const cleanup = jest.fn();
			const th = thread<number>((ctrl) => {
				ctrl.cleanup(cleanup);
			});

			const unlistens = [th.listen(() => {}), th.listen(() => {})] as const;

			expect(cleanup).not.toHaveBeenCalled();
			unlistens[0]();

			unlistens[1]();
			expect(cleanup).toHaveBeenCalledTimes(1);
		});
	});

	describe("emitting", () => {
		it("emits asynchronously", () => {
			const th = thread<number>((ctrl) => {
				const timer = setInterval(() => {
					ctrl.emit(1);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});
			});

			const listener = jest.fn();
			const unlisten = th.listen(listener);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(1);

			unlisten();
		});
	});

	describe("dependencies", () => {
		it("spies on dependencies", () => {
			const number = store(1);
			const th = thread<number>((ctrl) => {
				const value = ctrl.spy(number);

				const timer = setInterval(() => {
					ctrl.emit(value * 10);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});
			});

			const listener = jest.fn();
			th.listen(listener);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(10);

			number.set(2);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(20);
		});

		it("spies on dependencies dynamically", () => {
			const active = store(true);

			const first = store(1);
			const second = store(10);

			const setup = jest.fn((ctrl: ThreadController<number>) => {
				const value = ctrl.spy(active) ? ctrl.spy(first) : ctrl.spy(second);

				const timer = setInterval(() => {
					ctrl.emit(value);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});
			});

			const th = thread<number>(setup);

			const listener = jest.fn();
			th.listen(listener);

			active.set(false);

			expect(setup).toHaveBeenCalledTimes(2);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(10);

			first.set(2);

			expect(setup).toHaveBeenCalledTimes(2);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(10);

			second.set(20);

			expect(setup).toHaveBeenCalledTimes(3);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(20);
		});

		it("keeps subscriptions when resetting up", () => {
			const number = store(1);

			const setup = jest.fn(() => 10);
			const multiplier = stream(setup);

			const th = thread<number>((ctrl) => {
				ctrl.spy(number) * ctrl.spy(multiplier);
			});

			th.listen(() => {});

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up on a dependency change", () => {
			const number = store(1);

			const cleanup = jest.fn();
			const th = thread<number>((ctrl) => {
				ctrl.spy(number);
				ctrl.cleanup(cleanup);
			});

			th.listen(() => {});
			number.set(2);

			expect(cleanup).toHaveBeenCalledTimes(1);
		});

		it("unlinks subscriptions on cleanup", () => {
			const number = store(1);

			const setup = jest.fn((ctrl: ThreadController<number>) => {
				ctrl.spy(number);
			});
			const th = thread<number>(setup);

			const unlisten = th.listen(() => {});
			unlisten();

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const subject = jest.spyOn(lifecycle.current, "subject");
			const th = thread(() => {});

			expect(subject).toHaveBeenCalledWith(th);
		});
	});
});
