import { lifecycle } from "./lifecycle";
import { store } from "./store";
import { stream, StreamController } from "./stream";

describe("stream", () => {
	jest.useFakeTimers();

	describe("cold", () => {
		it("sets up on cold reading", () => {
			let state = 0;
			const setup = jest.fn(() => state++);

			const subject = stream<number>(setup);

			expect(setup).not.toHaveBeenCalled();

			expect(subject.read()).toBe(0);
			expect(subject.read()).toBe(1);

			expect(setup).toHaveBeenCalledTimes(2);
		});

		it("cleans up immediately after cold reading", () => {
			const cleanup = jest.fn();

			const subject = stream<number>((ctrl) => {
				ctrl.cleanup(cleanup);
				return 0;
			});

			subject.read();

			expect(cleanup).toHaveBeenCalledTimes(1);
		});
	});

	describe("hot", () => {
		it("sets up on the first link creation", () => {
			const setup = jest.fn(() => 0);

			const subject = stream<number>(setup);

			subject.listen(() => {});
			subject.listen(() => {});

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("doesn't setup on reading when hot", () => {
			const setup = jest.fn(() => 0);

			const subject = stream<number>(setup);

			subject.listen(() => {});

			subject.read();

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up when all links are unlinked", () => {
			const cleanup = jest.fn();
			const subject = stream<number>((ctrl) => {
				ctrl.cleanup(cleanup);
				return 0;
			});

			const unlistens = [
				subject.listen(() => {}),
				subject.listen(() => {}),
			] as const;

			expect(cleanup).not.toHaveBeenCalled();
			unlistens[0]();

			unlistens[1]();
			expect(cleanup).toHaveBeenCalledTimes(1);
		});
	});

	describe("asynchrony", () => {
		it("sets a state asynchronously", () => {
			let state = 0;

			const subject = stream<number>((ctrl) => {
				const timer = setInterval(() => {
					ctrl.set(state++);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});

				return state++;
			});

			const listener = jest.fn();
			const unlisten = subject.listen(listener);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(1);

			unlisten();
		});
	});

	describe("listening", () => {
		it("doesn't invoke listener on initial state setting", () => {
			const subject = stream<number>(() => 1);

			const listener = jest.fn();
			const unlisten = subject.listen(listener);
			unlisten();

			subject.listen(listener);

			expect(listener).not.toHaveBeenCalled();
		});

		it("invokes subscriber on initial state setting", () => {
			const state = 1;
			const subject = stream<number>(() => state);

			const subscriber = jest.fn();
			subject.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledWith(state);
		});

		it("invokes a new subscriber immediately when hot", () => {
			const state = 1;
			const subject = stream<number>(() => state);

			const subscriber = jest.fn();
			subject.listen(() => {});
			subject.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledWith(state);
		});
	});

	describe("same state", () => {
		it("skips updates when the same state is set", () => {
			const subject = stream<number>((ctrl) => {
				const timer = setInterval(() => {
					ctrl.set(1);
				}, 100);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});

				return 1;
			});

			const listener = jest.fn();
			const unlisten = subject.listen(listener);

			jest.runOnlyPendingTimers();

			expect(listener).not.toHaveBeenCalled();

			unlisten();
		});
	});

	describe("dependencies", () => {
		it("spies on dependencies", () => {
			const number = store(1);
			const subject = stream<number>((ctrl) => {
				const value = ctrl.spy(number);
				return value * 10;
			});

			const subscriber = jest.fn();
			subject.subscribe(subscriber);

			expect(subscriber).toHaveBeenLastCalledWith(10);

			number.set(2);

			expect(subscriber).toHaveBeenLastCalledWith(20);
		});

		it("spies on dependencies dynamically", () => {
			const active = store(true);

			const first = store(1);
			const second = store(10);

			const setup = jest.fn((ctrl: StreamController<number>) => {
				if (ctrl.spy(active)) {
					return ctrl.spy(first);
				}
				return ctrl.spy(second);
			});

			const subject = stream<number>(setup);

			const listener = jest.fn();
			subject.listen(listener);

			active.set(false);

			expect(setup).toHaveBeenCalledTimes(2);
			expect(listener).toHaveBeenLastCalledWith(10);

			first.set(2);

			expect(setup).toHaveBeenCalledTimes(2);
			expect(listener).toHaveBeenLastCalledWith(10);

			second.set(20);

			expect(setup).toHaveBeenCalledTimes(3);
			expect(listener).toHaveBeenLastCalledWith(20);
		});

		it("keeps subscriptions when resetting up", () => {
			const number = store(1);

			const setup = jest.fn(() => 10);
			const multiplier = stream(setup);

			const subject = stream<number>(
				(ctrl) => ctrl.spy(number) * ctrl.spy(multiplier),
			);

			subject.listen(() => {});

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up on a dependency change", () => {
			const number = store(1);

			const cleanup = jest.fn();
			const subject = stream<number>((ctrl) => {
				const value = ctrl.spy(number);
				ctrl.cleanup(cleanup);
				return value * 10;
			});

			subject.listen(() => {});
			number.set(2);

			expect(cleanup).toHaveBeenCalledTimes(1);
		});

		it("unlinks subscriptions on cleanup", () => {
			const number = store(1);

			const setup = jest.fn(
				(ctrl: StreamController<number>) => ctrl.spy(number) * 10,
			);
			const subject = stream<number>(setup);

			const unlisten = subject.listen(() => {});
			unlisten();

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("avoids glitches", () => {
			const root = store(1);

			const increased = stream<number>((ctrl) => ctrl.spy(root) + 1);

			const setup = jest.fn(
				(ctrl: StreamController<boolean>) => ctrl.spy(root) < ctrl.spy(increased),
			);

			const comparison = stream<boolean>(setup);

			const subscriber = jest.fn();
			comparison.subscribe(subscriber);

			expect(setup).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenLastCalledWith(true);

			root.set(2);

			expect(setup).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenLastCalledWith(true);
		});

		it("solves the diamond problem", () => {
			const root = store("Daniel Craig");

			const first = stream<string>((ctrl) => ctrl.spy(root).split(" ")[0] ?? "");

			const second = stream<string>((ctrl) => ctrl.spy(root).split(" ")[1] ?? "");

			const setup = jest.fn(
				(ctrl: StreamController<string>) =>
					`${ctrl.spy(first)} ${ctrl.spy(second)}`,
			);

			const derived = stream<string>(setup);

			const subscriber = jest.fn();
			derived.subscribe(subscriber);

			expect(setup).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenCalledTimes(1);
			expect(subscriber).toHaveBeenLastCalledWith(root.read());

			root.set("Pierce Brosnan");

			expect(setup).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenLastCalledWith(root.read());
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const hook = jest.spyOn(lifecycle.current, "subject");
			const subject = stream(() => 0);

			expect(hook).toHaveBeenCalledWith(subject);
		});
	});
});
