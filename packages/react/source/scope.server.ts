import { read } from "./read";
import { type Scope } from "./scope";
import { type TokenKey } from "./token";
import { type Serialized, type Store } from "@cometa/core";
import {
	CouplingRegistry,
	type Instance,
	isStore,
	StoreConfigurationsRegistry,
} from "@cometa/core/internal";

function flatten(
	key: TokenKey,
	instance: Instance<{}>,
	serializable: Map<TokenKey, Store<any>[]>,
	serveronly: Map<TokenKey, Store<any>>,
	acc: Store<any>[] = [],
	iteration = 0,
	root = true,
) {
	const coupling = CouplingRegistry.get(instance);
	if (coupling) {
		const subjects = coupling.subjects;
		const sl = subjects.length;
		if (sl > 0)
			for (let i = 0; i < sl; i++) {
				const subject = subjects[i]!;
				if (isStore(subject)) {
					const configuration = StoreConfigurationsRegistry.get(subject);
					if (configuration?.serialization !== false) {
						if (configuration?.serveronly)
							serveronly.set(`${key}.${iteration}`, subject);
						else acc.push(subject);
						iteration++;
					}
				}
			}

		const instances = coupling.instances;
		const il = subjects.length;

		if (il > 0)
			for (let i = 0; i < il; i++)
				flatten(
					key,
					instances[i]!,
					serializable,
					serveronly,
					acc,
					iteration,
					false,
				);
	}

	if (root) serializable.set(key, acc);
}

function serialize(store: Store<any>, state: unknown) {
	const serialization = StoreConfigurationsRegistry.get(store)!.serialization;
	return serialization ? serialization.serialize(state) : state;
}

export const createScope = (): Scope => {
	const serializable = new Map<TokenKey, Store<any>[]>();
	const serveronly = new Map<TokenKey, Store<any>>();
	const sent = new Map<Store<any>, any>();

	const scope: Scope = {
		bind(key, instance) {
			if (!serializable.has(key)) flatten(key, instance, serializable, serveronly);
			return instance;
		},
		read,
		hydrate: () => scope,
		dehydrate() {
			const current: Record<TokenKey, Serialized[]> = {};
			const server: Record<TokenKey, Serialized> = {};

			if (serializable.size > 0) {
				serializable.forEach((stores, key) => {
					const states: Serialized[] = [];

					for (let i = 0, length = stores.length; i < length; i++) {
						const store = stores[i]!;
						states.push(serialize(store, store.read()));
					}

					serializable.delete(key);
					current[key] = states;
				});
			}

			if (serveronly.size > 0) {
				serveronly.forEach((store, key) => {
					const state = store.read();
					if (!sent.has(store) || sent.get(store) !== state) {
						sent.set(store, state);
						server[key] = serialize(store, state);
					}
				});
			}

			return [current, server];
		},
	};

	return scope;
};
