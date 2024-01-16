import {
	createDispatcher,
	type DispatcherController,
	DispatchersRegistry,
} from "./dispatcher";
import { lifecycle } from "./lifecycle";
import { link, unlink } from "./link";
import { type Protocol, type WithProtocol } from "./protocol";
import { notify } from "./scheduler";

export interface ThreadProtocol extends Protocol {
	thread: true;
}

export interface Thread<Payload> extends WithProtocol {
	protocol: ThreadProtocol;
	listen: (listener: (payload: Payload) => void) => () => void;
}

export type ThreadPayload<C> = C extends Thread<infer T> ? T : never;

export interface ThreadController<Payload> extends DispatcherController {
	emit: (payload: Payload) => void;
}

const protocol: ThreadProtocol = {
	cometa: true,
	thread: true,
} as const;

const noop = (): void => {};

function createThread<Payload = void>(
	setup: (controller: ThreadController<Payload>) => void,
): Thread<Payload> {
	const thread: Thread<Payload> = {
		protocol,
		listen(listener) {
			const l = link({
				clock: { subject: thread },
				target: listener,
			});

			return () => unlink(l);
		},
	};

	const dispatcher = createDispatcher<ThreadController<Payload>, void>(
		(controller) =>
			((controller as ThreadController<Payload>).emit = (payload: Payload) =>
				notify(thread, payload)),
		setup,
		noop,
	);

	DispatchersRegistry.set(thread, dispatcher);

	return lifecycle.current.subject(thread);
}

export const thread = createThread;
