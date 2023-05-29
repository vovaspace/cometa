import {
	createDispatcher,
	type DispatcherController,
	DispatchersRegistry,
} from "./dispatcher";
import { lifecycle } from "./lifecycle";
import { link, unlink } from "./link";
import { type Protocol, type WithProtocol } from "./protocol";
import { notify } from "./scheduler";

export interface ChannelProtocol extends Protocol {
	channel: true;
}

export interface Channel<Payload> extends WithProtocol {
	protocol: ChannelProtocol;
	listen: (listener: (payload: Payload) => void) => () => void;
}

export type ChannelPayload<C> = C extends Channel<infer T> ? T : never;

export interface ChannelController<Payload> extends DispatcherController {
	emit: (payload: Payload) => void;
}

const protocol: ChannelProtocol = {
	cometa: true,
	channel: true,
} as const;

const noop = (): void => {};

function createChannel<Payload = void>(
	setup: (controller: ChannelController<Payload>) => void,
): Channel<Payload> {
	const channel: Channel<Payload> = {
		protocol,
		listen(listener) {
			const l = link({
				clock: { subject: channel },
				target: listener,
			});

			return () => unlink(l);
		},
	};

	const dispatcher = createDispatcher<ChannelController<Payload>, void>(
		(controller) =>
			((controller as ChannelController<Payload>).emit = (payload: Payload) =>
				notify(channel, payload)),
		setup,
		noop,
	);

	DispatchersRegistry.set(channel, dispatcher);

	return lifecycle.current.subject(channel);
}

export const channel = createChannel;
