import { channel } from "./channel";
import { createDispatcher, DispatchersRegistry } from "./dispatcher";
import { link, unlink } from "./link";

describe("link", () => {
	it("runs the dispatcher when the subject receives the first link", () => {
		const setup = jest.fn();
		const dispatcher = createDispatcher(
			() => {},
			setup,
			() => {},
		);
		const subject = channel();

		DispatchersRegistry.set(subject, dispatcher);

		expect(setup).not.toHaveBeenCalled();

		link({
			clock: {
				subject,
			},
			target: () => {},
		});

		expect(setup).toHaveBeenCalledTimes(1);

		link({
			clock: {
				subject,
			},
			target: () => {},
		});

		expect(setup).toHaveBeenCalledTimes(1);
	});

	it("stops the dispatcher when all links are unlinked from the subject ", () => {
		const cleanup = jest.fn();
		const dispatcher = createDispatcher(
			() => {},
			(ctrl) => {
				ctrl.cleanup(cleanup);
			},
			() => {},
		);
		const subject = channel();

		DispatchersRegistry.set(subject, dispatcher);

		const links = [
			link({
				clock: {
					subject,
				},
				target: () => {},
			}),

			link({
				clock: {
					subject,
				},
				target: () => {},
			}),

			link({
				clock: {
					subject,
				},
				target: () => {},
			}),
		] as const;

		unlink(links[0]);
		expect(cleanup).not.toHaveBeenCalled();

		unlink(links[2]);
		expect(cleanup).not.toHaveBeenCalled();

		unlink(links[1]);
		expect(cleanup).toHaveBeenCalledTimes(1);
	});
});
