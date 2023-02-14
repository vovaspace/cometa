import { lifecycle } from "../lifecycle";
import { createEvent } from "./event";

describe("event", () => {
	const event = createEvent<number>();

	describe("listening", () => {
		it("invokes a listener on emit", () => {
			const listener = jest.fn();

			event.listen(listener);

			event(0);

			expect(listener).toHaveBeenCalledWith(0);
		});

		it("unbinds the listener", () => {
			const listener = jest.fn();

			const unlisten = event.listen(listener);
			unlisten();

			event(1);

			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const subject = jest.spyOn(lifecycle.current, "subject");
			const event = createEvent();

			expect(subject).toHaveBeenCalledWith(event);
		});
	});
});
