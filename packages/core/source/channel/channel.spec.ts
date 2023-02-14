import { lifecycle } from "../lifecycle";
import { createStore } from "../store";
import { createStream } from "../stream";
import { ChannelController, createChannel } from "./channel";

describe("channel", () => {
	jest.useFakeTimers();

	describe("setting up", () => {
		it("sets up on the first link creation", () => {
			const setup = jest.fn(() => {});

			const channel = createChannel<number>(setup);

			channel.listen(() => {});
			channel.listen(() => {});

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up when all links are unlinked", () => {
			const cleanup = jest.fn();
			const channel = createChannel<number>((ctrl) => {
				ctrl.cleanup(cleanup);
			});

			const unlistens = [
				channel.listen(() => {}),
				channel.listen(() => {}),
			] as const;

			expect(cleanup).not.toHaveBeenCalled();
			unlistens[0]();

			unlistens[1]();
			expect(cleanup).toHaveBeenCalledTimes(1);
		});
	});

	describe("emitting", () => {
		it("emits asynchronously", () => {
			const channel = createChannel<number>((ctrl) => {
				const timer = setInterval(() => {
					ctrl.emit(1);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});
			});

			const listener = jest.fn();
			const unlisten = channel.listen(listener);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(1);

			unlisten();
		});
	});

	describe("dependencies", () => {
		it("spies on dependencies", () => {
			const number = createStore(1);
			const channel = createChannel<number>((ctrl) => {
				const value = ctrl.read(number);

				const timer = setInterval(() => {
					ctrl.emit(value * 10);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});
			});

			const listener = jest.fn();
			channel.listen(listener);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(10);

			number.set(2);

			jest.runOnlyPendingTimers();
			expect(listener).toHaveBeenLastCalledWith(20);
		});

		it("spies on dependencies dynamically", () => {
			const active = createStore(true);

			const first = createStore(1);
			const second = createStore(10);

			const setup = jest.fn((ctrl: ChannelController<number>) => {
				const value = ctrl.read(active) ? ctrl.read(first) : ctrl.read(second);

				const timer = setInterval(() => {
					ctrl.emit(value);
				}, 1000);

				ctrl.cleanup(() => {
					clearInterval(timer);
				});
			});

			const channel = createChannel<number>(setup);

			const listener = jest.fn();
			channel.listen(listener);

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
			const number = createStore(1);

			const setup = jest.fn(() => 10);
			const multiplier = createStream(setup);

			const channel = createChannel<number>((ctrl) => {
				ctrl.read(number) * ctrl.read(multiplier);
			});

			channel.listen(() => {});

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});

		it("cleans up on a dependency change", () => {
			const number = createStore(1);

			const cleanup = jest.fn();
			const channel = createChannel<number>((ctrl) => {
				ctrl.read(number);
				ctrl.cleanup(cleanup);
			});

			channel.listen(() => {});
			number.set(2);

			expect(cleanup).toHaveBeenCalledTimes(1);
		});

		it("unlinks subscriptions on cleanup", () => {
			const number = createStore(1);

			const setup = jest.fn((ctrl: ChannelController<number>) => {
				ctrl.read(number);
			});
			const channel = createChannel<number>(setup);

			const unlisten = channel.listen(() => {});
			unlisten();

			number.set(2);

			expect(setup).toHaveBeenCalledTimes(1);
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const subject = jest.spyOn(lifecycle.current, "subject");
			const channel = createChannel(() => {});

			expect(subject).toHaveBeenCalledWith(channel);
		});
	});
});
