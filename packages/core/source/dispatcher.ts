import { type Channel } from "./channel";
import { type Link, link, unlink } from "./link";
import { type Protocol, type WithProtocol } from "./protocol";
import { type Stream } from "./stream";

export interface DispatcherProtocol extends Protocol {
	dispatcher: true;
}

export interface Dispatcher<Result> extends WithProtocol {
	(): void;
	protocol: DispatcherProtocol;
	order: number;
	active: boolean;
	dequeued: boolean;
	hot: DispatcherController;
	cold: DispatcherController;
	dry: () => Result;
	stop: () => void;
}

export interface DispatcherController {
	spy: <T>(source: Stream<T>) => T;
	cleanup: (callback: () => void) => void;
}

export const DispatchersRegistry = new WeakMap<
	Channel<unknown>,
	Dispatcher<unknown>
>();

const protocol = {
	cometa: true,
	dispatcher: true,
} as const;

let order = 0;

export function createDispatcher<
	Controller extends DispatcherController,
	Result,
>(
	patch: (controller: DispatcherController) => asserts controller is Controller,
	setup: (controller: Controller) => Result,
	callback: (result: Result) => void,
): Dispatcher<Result> {
	const cleanups: (() => void)[] = [];
	function purge(): void {
		if (cleanups.length > 0) {
			let cleanup: (() => void) | undefined;
			while ((cleanup = cleanups.shift())) cleanup();
		}
	}

	let links = new Map<Channel<any>, Link<any, any, any>>();
	let sources = new Set<Channel<any>>();

	const hot: DispatcherController = {
		spy(source) {
			if (!links.has(source))
				links.set(
					source,
					link({
						clock: { subject: source },
						target: dispatcher,
					}),
				);

			sources.add(source);
			return source.read();
		},
		cleanup(callback) {
			cleanups.push(callback);
		},
	};

	const cold: DispatcherController = {
		spy: (source) => source.read(),
		cleanup(callback) {
			callback();
		},
	};

	patch(hot);
	patch(cold);

	const dispatcher: Dispatcher<Result> = () => {
		purge();

		callback(setup(hot));

		if (links.size > 0) {
			links.forEach((link, source) => {
				if (!sources.has(source)) {
					links.delete(source);
					unlink(link);
				}
			});

			sources = new Set();
		}

		dispatcher.active = true;
	};

	dispatcher.dry = () => setup(cold);

	dispatcher.stop = () => {
		purge();

		if (links.size > 0) {
			links.forEach(unlink);
			links = new Map();
		}

		dispatcher.active = false;
	};

	dispatcher.protocol = protocol;
	dispatcher.order = order++;
	dispatcher.active = false;
	dispatcher.dequeued = true;

	dispatcher.hot = hot;
	dispatcher.cold = cold;

	return dispatcher;
}
