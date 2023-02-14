import { createEvent } from "../event";
import { lifecycle } from "../lifecycle";
import { link } from "../scheduler";
import { createStore } from "./store";

describe("store", () => {
	let state = 0;
	const store = createStore(state);

	describe("state", () => {
		it("keeps a state", () => {
			expect(store.read()).toBe(state);
		});

		it("sets a next state", () => {
			store(++state);
			expect(store.read()).toBe(state);

			store.set(++state);
			expect(store.read()).toBe(state);
		});
	});

	describe("listening", () => {
		it("invokes a listener on update", () => {
			const listener = jest.fn();

			store.listen(listener);

			store.set(++state);

			expect(listener).toHaveBeenCalledWith(state);
		});

		it("unbinds the listener", () => {
			const listener = jest.fn();

			const unlisten = store.listen(listener);
			unlisten();

			store.set(++state);

			expect(listener).not.toHaveBeenCalled();
		});

		it("invokes a new subscriber immediately", () => {
			const subscriber = jest.fn();

			store.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledWith(store.read());
		});

		it("invokes a subscriber on update", () => {
			const subscriber = jest.fn();

			store.subscribe(subscriber);

			store.set(++state);

			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenLastCalledWith(state);
		});

		it("invokes a subscriber only once on batched update", () => {
			const subscriber = jest.fn();

			store.subscribe(subscriber);

			const update = createEvent();
			const first = createEvent();
			const second = createEvent();

			link({
				clock: { subject: update },
				target: first,
			});
			link({
				clock: { subject: update },
				target: second,
			});

			link({
				clock: { subject: first },
				map: () => ++state,
				target: store,
			});
			link({
				clock: { subject: second },
				map: () => ++state,
				target: store,
			});

			update();

			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenLastCalledWith(state);
		});

		it("unbinds the subscriber", () => {
			const subscriber = jest.fn();

			const unsubscribe = store.subscribe(subscriber);
			unsubscribe();

			store.set(++state);

			expect(subscriber).toHaveBeenCalledTimes(1);
		});
	});

	describe("same state", () => {
		it("skips update when the same state is set", () => {
			const listener = jest.fn();

			store.listen(listener);

			store.set(state);
			store.set(state);

			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const subject = jest.spyOn(lifecycle.current, "subject");
			const store = createStore(0);

			expect(subject).toHaveBeenCalledWith(store);
		});
	});
});
