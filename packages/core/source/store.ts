import { type Event, type EventProtocol } from "./event";
import { lifecycle } from "./lifecycle";
import { link, unlink } from "./link";
import { notify } from "./scheduler";
import { type Serialization, type Serialized } from "./serialization";
import { type Stream, type StreamProtocol } from "./stream";
import { createSubscriber } from "./subscriber";

export interface StoreProtocol extends EventProtocol, StreamProtocol {
	store: true;
}

export interface Store<State> extends Event<State>, Stream<State> {
	protocol: StoreProtocol;
	initial: State;
	set: (next: State) => void;
}

export type StoreState<S> = S extends Store<infer T> ? T : never;

export interface StoreConfiguration<State, SerializedState extends Serialized> {
	serialization?: Serialization<State, SerializedState>;
	serveronly?: boolean;
}

export const StoreConfigurationsRegistry = new WeakMap<
	Store<any>,
	StoreConfiguration<any, any>
>();

const protocol: StoreProtocol = {
	cometa: true,
	channel: true,
	event: true,
	stream: true,
	store: true,
} as const;

function createStore<State, SerializedState extends Serialized = never>(
	initial: State,
	configuration: StoreConfiguration<State, SerializedState> = {},
): Store<State> {
	let state = initial;

	const read = () => state;

	const set = (next: State) =>
		Object.is(state, next) || notify(store, (state = next));

	const store: Store<State> = (next) => set(next);

	store.initial = initial;

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

	StoreConfigurationsRegistry.set(store, configuration);

	return lifecycle.current.subject(store);
}

export const store = createStore;
