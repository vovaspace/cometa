import { createEvent } from "../event";
import { defineModel } from "../model";
import { link } from "../scheduler";
import { purge } from "./registry";

describe("registry", () => {
	describe("purging", () => {
		it("unlinks all model instance's links", () => {
			const externalEvent = createEvent();
			const listener = jest.fn();
			externalEvent.listen(listener);

			const factory = defineModel(() => {
				const event = createEvent();

				link({
					clock: { subject: event },
					target: externalEvent,
				});

				return { event };
			});

			const model = factory();

			model.event();

			expect(listener).toHaveBeenCalledTimes(1);

			purge(model);
			model.event();

			expect(listener).toHaveBeenCalledTimes(1);
		});
	});
});
