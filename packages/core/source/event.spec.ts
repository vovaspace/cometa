import { event } from "./event";
import { lifecycle } from "./lifecycle";

describe("event", () => {
	const subject = event<number>();

	describe("listening", () => {
		it("invokes a listener on emit", () => {
			const listener = jest.fn();

			subject.listen(listener);

			subject(0);

			expect(listener).toHaveBeenCalledWith(0);
		});

		it("unbinds the listener", () => {
			const listener = jest.fn();

			const unlisten = subject.listen(listener);
			unlisten();

			subject(1);

			expect(listener).not.toHaveBeenCalled();
		});
	});

	describe("lifecycle", () => {
		it("notifies lifecycle", () => {
			const hook = jest.spyOn(lifecycle.current, "subject");
			const subject = event();

			expect(hook).toHaveBeenCalledWith(subject);
		});
	});
});
