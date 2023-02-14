import { createDispatcher, type DispatcherController } from "../dispatcher";
import { lifecycle } from "../lifecycle";
import { type Protocol } from "../protocol";
import { bind, link, notify, unlink } from "../scheduler";
import { noop } from "../stub";

export interface ChannelProtocol extends Protocol {
	channel: true;
}

export interface Channel<Payload> {
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

export function createChannel<Payload = void>(
	setup: (controller: ChannelController<Payload>) => (() => void) | void,
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

	bind(channel, dispatcher);

	return lifecycle.current.subject(channel);
}

export const channel = createChannel;
