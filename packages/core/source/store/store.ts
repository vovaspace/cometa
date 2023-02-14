import { type Event, type EventProtocol } from "../event";
import { lifecycle } from "../lifecycle";
import { link, notify, unlink } from "../scheduler";
import { type Stream, type StreamProtocol } from "../stream";
import { createSubscriber } from "../subscriber";

export interface StoreProtocol extends EventProtocol, StreamProtocol {
	store: true;
}

export interface Store<State> extends Event<State>, Stream<State> {
	protocol: StoreProtocol;
	set: (next: State) => void;
}

export type StoreState<S> = S extends Store<infer T> ? T : never;

const protocol: StoreProtocol = {
	cometa: true,
	channel: true,
	event: true,
	stream: true,
	store: true,
} as const;

export function createStore<State>(initial: State): Store<State> {
	let state = initial;

	const read = () => state;

	const set = (next: State) =>
		Object.is(state, next) || notify(store, (state = next));

	const store: Store<State> = (next) => set(next);

	store.read = read;
	store.set = set;

	store.listen = (listener) => {
		const l = link({
			clock: {
				subject: store,
			},
			target: listener,
		});

		return () => unlink(l);
	};

	store.subscribe = (subscriber) => (
		subscriber(read()), store.listen(createSubscriber(subscriber))
	);

	store.protocol = protocol;

	return lifecycle.current.subject(store);
}

export const store = createStore;
