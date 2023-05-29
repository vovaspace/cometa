import { event } from "./event";
import { lifecycle } from "./lifecycle";
import { link } from "./link";
import { store, StoreConfigurationsRegistry } from "./store";

describe("store", () => {
	const initial = 0;
	let state = initial;
	const subject = store(state);

	describe("state", () => {
		it("keeps a state", () => {
			expect(subject.read()).toBe(state);
		});

		it("sets a next state", () => {
			subject(++state);
			expect(subject.read()).toBe(state);

			subject.set(++state);
			expect(subject.read()).toBe(state);
		});

		it("keeps the initial state", () => {
			expect(subject.initial).toBe(initial);
		});
	});

	describe("listening", () => {
		it("invokes a listener on update", () => {
			const listener = jest.fn();

			subject.listen(listener);

			subject.set(++state);

			expect(listener).toHaveBeenCalledWith(state);
		});

		it("unbinds the listener", () => {
			const listener = jest.fn();

			const unlisten = subject.listen(listener);
			unlisten();

			subject.set(++state);

			expect(listener).not.toHaveBeenCalled();
		});

		it("invokes a new subscriber immediately", () => {
			const subscriber = jest.fn();

			subject.subscribe(subscriber);

			expect(subscriber).toHaveBeenCalledWith(subject.read());
		});

		it("invokes a subscriber on update", () => {
			const subscriber = jest.fn();

			subject.subscribe(subscriber);

			subject.set(++state);

			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenLastCalledWith(state);
		});

		it("invokes a subscriber only once on batched update", () => {
			const subscriber = jest.fn();

			subject.subscribe(subscriber);

			const update = event();
			const first = event();
			const second = event();

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
				target: subject,
			});
			link({
				clock: { subject: second },
				map: () => ++state,
				target: subject,
			});

			update();

			expect(subscriber).toHaveBeenCalledTimes(2);
			expect(subscriber).toHaveBeenLastCalledWith(state);
		});

		it("unbinds the subscriber", () => {
			const subscriber = jest.fn();

			const unsubscribe = subject.subscribe(subscriber);
			unsubscribe();

			subject.set(++state);

			expect(subscriber).toHaveBeenCalledTimes(1);
		});
	});

	describe("same state", () => {
		it("skips update when the same state is set", () => {
			const listener = jest.fn();

			subject.listen(listener);

			subject.set(state);
			subject.set(state);

			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const hook = jest.spyOn(lifecycle.current, "subject");
			const subject = store(0);

			expect(hook).toHaveBeenCalledWith(subject);
		});
	});

	describe("configuration", () => {
		it("keeps configuration", () => {
			const configuration = {};
			const subject = store(0, configuration);

			expect(StoreConfigurationsRegistry.get(subject)).toBe(configuration);
		});
	});
});
