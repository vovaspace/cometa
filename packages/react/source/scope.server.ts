import { type Model, type Serialized, type Store } from "@cometa/core";
import {
	CouplingRegistry,
	isStore,
	StoreConfigurationsRegistry,
} from "@cometa/core/internal";

import { read } from "./read";
import { type Scope } from "./scope";
import { type TokenKey } from "./token";

function flatten(
	key: TokenKey,
	model: Model<{}>,
	serializable: Map<TokenKey, Store<any>[]>,
	serveronly: Map<TokenKey, Store<any>>,
	acc: Store<any>[] = [],
	iteration = 0,
	root = true,
) {
	const coupling = CouplingRegistry.get(model);
	if (coupling) {
		const subjects = coupling.subjects;
		const sl = subjects.length;
		if (sl > 0)
			for (let i = 0; i < sl; i++) {
				const subject = subjects[i]!;
				if (isStore(subject)) {
					const configuration = StoreConfigurationsRegistry.get(subject)!;
					if (configuration.serialization !== false) {
						if (configuration.serveronly)
							serveronly.set(`${key}.${iteration}`, subject);
						else acc.push(subject);
						iteration++;
					}
				}
			}

		const models = coupling.models;
		const ml = models.length;

		if (ml > 0)
			for (let i = 0; i < ml; i++)
				flatten(key, models[i]!, serializable, serveronly, acc, iteration, false);
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
					const states = [];

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
