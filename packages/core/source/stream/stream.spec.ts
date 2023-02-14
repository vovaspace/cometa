import { lifecycle } from "../lifecycle";
import { createStore } from "../store";
import { createStream, StreamController } from "./stream";

describe("stream", () => {
	jest.useFakeTimers();

	describe("cold", () => {
		it("sets up on cold reading", () => {
			let state = 0;
			const setup = jest.fn(() => state++);

			const stream = createStream<number>(setup);

			expect(setup).not.toHaveBeenCalled();

			expect(stream.read()).toBe(0);
			expect(stream.read()).toBe(1);

			expect(setup).toHaveBeenCalledTimes(2);
		});

		it("cleans up immediately after cold reading", () => {
			const cleanup = jest.fn();

			const stream = createStream<number>((ctrl) => {
				ctrl.cleanup(cleanup);
				return 0;
			});

			stream.read();

			expect(cleanup).toHaveBeenCalledTimes(1);
		});
	});

	describe("hot", () => {
		it("sets up on the first link creation", () => {
			const setup = jest.fn(() => 0);

			const stream = createStream<number>(setup);

			stream.listen(() => {});
			stream.listen(() => {});

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("doesn't setup on reading when hot", () => {
			const setup = jest.fn(() => 0);

			const stream = createStream<number>(setup);

			stream.listen(() => {});

			stream.read();

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up when all links are unlinked", () => {
			const cleanup = jest.fn();
			const stream = createStream<number>((ctrl) => {
				ctrl.cleanup(cleanup);
				return 0;
			});

			const unlistens = [
				stream.listen(() => {}),
				stream.listen(() => {}),
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

			const stream = createStream<number>((ctrl) => {
				const timer = setInterval(() => {
					ctrl.set(state++);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});

				return state++;
			});

			const listener = jest.fn();
			const unlisten = stream.listen(listener);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(1);

			unlisten();
		});
	});

	describe("listening", () => {
		it("doesn't invoke listener on initial state setting", () => {
			const stream = createStream<number>(() => 1);

			const listener = jest.fn();
			const unlisten = stream.listen(listener);
			unlisten();

			stream.listen(listener);

			expect(listener).not.toHaveBeenCalled();
		});

		it("invokes subscriber on initial state setting", () => {
			const state = 1;
			const stream = createStream<number>(() => state);

			const subscriber = jest.fn();
			stream.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledWith(state);
		});

		it("invokes a new subscriber immediately when hot", () => {
			const state = 1;
			const stream = createStream<number>(() => state);

			const subscriber = jest.fn();
			stream.listen(() => {});
			stream.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledWith(state);
		});
	});

	describe("same state", () => {
		it("skips updates when the same state is set", () => {
			const stream = createStream<number>((ctrl) => {
				const timer = setInterval(() => {
					ctrl.set(1);
				}, 100);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});

				return 1;
			});

			const listener = jest.fn();
			const unlisten = stream.listen(listener);

			jest.runOnlyPendingTimers();

			expect(listener).not.toHaveBeenCalled();

			unlisten();
		});
	});

	describe("dependencies", () => {
		it("spies on dependencies", () => {
			const number = createStore(1);
			const stream = createStream<number>((ctrl) => {
				const value = ctrl.read(number);
				return value * 10;
			});

			const subscriber = jest.fn();
			stream.subscribe(subscriber);

			expect(subscriber).toHaveBeenLastCalledWith(10);

			number.set(2);

			expect(subscriber).toHaveBeenLastCalledWith(20);
		});

		it("spies on dependencies dynamically", () => {
			const active = createStore(true);

			const first = createStore(1);
			const second = createStore(10);

			const setup = jest.fn((ctrl: StreamController<number>) => {
				if (ctrl.read(active)) {
					return ctrl.read(first);
				}
				return ctrl.read(second);
			});

			const stream = createStream<number>(setup);

			const listener = jest.fn();
			stream.listen(listener);

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
			const number = createStore(1);

			const setup = jest.fn(() => 10);
			const multiplier = createStream(setup);

			const stream = createStream<number>(
				(ctrl) => ctrl.read(number) * ctrl.read(multiplier),
			);

			stream.listen(() => {});

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up on a dependency change", () => {
			const number = createStore(1);

			const cleanup = jest.fn();
			const stream = createStream<number>((ctrl) => {
				const value = ctrl.read(number);
				ctrl.cleanup(cleanup);
				return value * 10;
			});

			stream.listen(() => {});
			number.set(2);

			expect(cleanup).toHaveBeenCalledTimes(1);
		});

		it("unlinks subscriptions on cleanup", () => {
			const number = createStore(1);

			const setup = jest.fn(
				(ctrl: StreamController<number>) => ctrl.read(number) * 10,
			);
			const stream = createStream<number>(setup);

			const unlisten = stream.listen(() => {});
			unlisten();

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("avoids glitches", () => {
			const root = createStore(1);

			const increased = createStream<number>((ctrl) => ctrl.read(root) + 1);

			const setup = jest.fn(
				(ctrl: StreamController<boolean>) => ctrl.read(root) < ctrl.read(increased),
			);

			const comparison = createStream<boolean>(setup);

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
			const root = createStore("Daniel Craig");

			const first = createStream<string>(
				(ctrl) => ctrl.read(root).split(" ")[0] ?? "",
			);

			const second = createStream<string>(
				(ctrl) => ctrl.read(root).split(" ")[1] ?? "",
			);

			const setup = jest.fn(
				(ctrl: StreamController<string>) =>
					`${ctrl.read(first)} ${ctrl.read(second)}`,
			);

			const derived = createStream<string>(setup);

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
			const subject = jest.spyOn(lifecycle.current, "subject");
			const stream = createStream(() => 0);

			expect(subject).toHaveBeenCalledWith(stream);
		});
	});
});
