import { type Protocol, type WithProtocol } from "./protocol";

export interface SubscriberProtocol extends Protocol {
	subscriber: true;
}

export interface Subscriber<Payload> extends WithProtocol {
	(payload: Payload): void;
	protocol: SubscriberProtocol;
}

const protocol = {
	cometa: true,
	subscriber: true,
} as const;

export function createSubscriber<Payload>(
	callback: (payload: Payload) => void,
): Subscriber<Payload> {
	const subscriber: Subscriber<Payload> = (payload) => callback(payload);
	subscriber.protocol = protocol;
	return subscriber;
}
