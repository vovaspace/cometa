import { type Channel, type ChannelProtocol } from "../channel";
import { lifecycle } from "../lifecycle";
import { link, notify, unlink } from "../scheduler";

export interface EventProtocol extends ChannelProtocol {
	event: true;
}

export interface Event<Payload> extends Channel<Payload> {
	(payload: Payload): void;
	protocol: EventProtocol;
}

export type EventPayload<E> = E extends Event<infer T> ? T : never;

const protocol: EventProtocol = {
	cometa: true,
	channel: true,
	event: true,
} as const;

export function createEvent<Payload = void>(): Event<Payload> {
	const event: Event<Payload> = (payload) => notify(event, payload);

	event.listen = (listener) => {
		const l = link({
			clock: { subject: event },
			target: listener,
		});

		return () => unlink(l);
	};

	event.protocol = protocol;

	return lifecycle.current.subject(event);
}

export const event = createEvent;
