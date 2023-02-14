import { type Channel } from "../channel";
import { type Protocol, type WithProtocol } from "../protocol";
import { type Link, link, unlink } from "../scheduler";
import { type Stream } from "../stream";

export interface DispatcherProtocol extends Protocol {
	dispatcher: true;
}

export interface Dispatcher extends WithProtocol {
	(): void;
	protocol: DispatcherProtocol;
	order: number;
	active: boolean;
	dequeued: boolean;
	stop: () => void;
}

export interface DispatcherController {
	read: <T>(source: Stream<T>) => T;
	cleanup: (callback: () => void) => void;
}

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
): Dispatcher {
	let links = new Map<Channel<any>, Link<any, any, any>>();
	let sources = new Set<Channel<any>>();

	let cleanup: (() => void) | null;

	const controller: DispatcherController = {
		read(source) {
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
			cleanup = callback;
		},
	};

	patch(controller);

	function purge(): void {
		if (cleanup) {
			cleanup();
			cleanup = null;
		}
	}

	function stop(): void {
		purge();

		if (links.size > 0) {
			links.forEach(unlink);
			links = new Map();
		}

		dispatcher.active = false;
	}

	const dispatcher: Dispatcher = () => {
		purge();

		callback(setup(controller));

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

	dispatcher.protocol = protocol;
	dispatcher.order = order++;
	dispatcher.active = false;
	dispatcher.dequeued = true;
	dispatcher.stop = stop;

	return dispatcher;
}
