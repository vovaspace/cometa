import { channel } from "./channel";
import { uncouple } from "./coupling";
import { link } from "./link";
import { model } from "./model";

describe("coupling", () => {
	describe("uncoupling", () => {
		it("unlinks all instance links", () => {
			const externalChannel = channel();
			const listener = jest.fn();
			externalChannel.listen(listener);

			const create = model(() => {
				const internalChannel = channel();

				link({
					clock: { subject: internalChannel },
					target: externalChannel,
				});

				return { internalChannel };
			});

			const instance = create();

			instance.internalChannel();

			expect(listener).toHaveBeenCalledTimes(1);

			uncouple(instance);
			instance.internalChannel();

			expect(listener).toHaveBeenCalledTimes(1);
		});
	});
});
