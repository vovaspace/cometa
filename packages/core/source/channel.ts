import { lifecycle } from "./lifecycle";
import { link, unlink } from "./link";
import { notify } from "./scheduler";
import { type Thread, type ThreadProtocol } from "./thread";

export interface ChannelProtocol extends ThreadProtocol {
	channel: true;
}

export interface Channel<Payload> extends Thread<Payload> {
	(payload: Payload): void;
	protocol: ChannelProtocol;
}

export type ChannelPayload<E> = E extends Channel<infer T> ? T : never;

const protocol: ChannelProtocol = {
	cometa: true,
	thread: true,
	channel: true,
} as const;

function createChannel<Payload = void>(): Channel<Payload> {
	const channel: Channel<Payload> = (payload) => notify(channel, payload);

	channel.listen = (listener) => {
		const l = link({
			clock: { subject: channel },
			target: listener,
		});

		return () => unlink(l);
	};

	channel.protocol = protocol;

	return lifecycle.current.subject(channel);
}

export const channel = createChannel;
