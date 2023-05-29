import { uncouple } from "./coupling";
import { event } from "./event";
import { factory } from "./factory";
import { link } from "./link";

describe("coupling", () => {
	describe("uncoupling", () => {
		it("unlinks all instance links", () => {
			const externalEvent = event();
			const listener = jest.fn();
			externalEvent.listen(listener);

			const create = factory(() => {
				const internalEvent = event();

				link({
					clock: { subject: internalEvent },
					target: externalEvent,
				});

				return { internalEvent };
			});

			const instance = create();

			instance.internalEvent();

			expect(listener).toHaveBeenCalledTimes(1);

			uncouple(instance);
			instance.internalEvent();

			expect(listener).toHaveBeenCalledTimes(1);
		});
	});
});
