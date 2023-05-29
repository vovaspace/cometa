import { type Channel, type ChannelProtocol } from "./channel";
import {
	createDispatcher,
	type DispatcherController,
	DispatchersRegistry,
} from "./dispatcher";
import { lifecycle } from "./lifecycle";
import { link, unlink } from "./link";
import { notify } from "./scheduler";
import { createSubscriber } from "./subscriber";

export interface StreamProtocol extends ChannelProtocol {
	stream: true;
}

export interface Stream<State> extends Channel<State> {
	protocol: StreamProtocol;
	read: () => State;
	subscribe: (subscriber: (state: State) => void) => () => void;
}

export type StreamState<S> = S extends Stream<infer T> ? T : never;

export interface StreamController<State> extends DispatcherController {
	set: (next: State) => void;
}

const protocol: StreamProtocol = {
	cometa: true,
	channel: true,
	stream: true,
} as const;

function createStream<State>(
	setup: (controller: StreamController<State>) => State,
): Stream<State> {
	let state: State;

	const set = (next: State) =>
		Object.is(state, next) ||
		((state = next), dispatcher.active && notify(stream, state));

	const dispatcher = createDispatcher<StreamController<State>, State>(
		(controller) => ((controller as StreamController<State>).set = set),
		setup,
		set,
	);

	const read = () => (dispatcher.active ? state : dispatcher.dry());

	const stream: Stream<State> = {
		protocol,
		read,
		listen(listener) {
			const l = link({
				clock: { subject: stream },
				target: listener,
			});

			return () => unlink(l);
		},
		subscribe(subscriber) {
			const unsubscribe = stream.listen(createSubscriber(subscriber));
			subscriber(read());
			return unsubscribe;
		},
	};

	DispatchersRegistry.set(stream, dispatcher);

	return lifecycle.current.subject(stream);
}

export const stream = createStream;
