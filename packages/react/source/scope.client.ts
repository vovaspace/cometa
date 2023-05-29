import { read } from "./read";
import { type DehydratedScope, type Scope } from "./scope";
import { type TokenKey } from "./token";
import { type Serialized, Store } from "@cometa/core";
import {
	CouplingRegistry,
	hydration,
	type Instance,
	isStore,
	StoreConfigurationsRegistry,
} from "@cometa/core/internal";

export const createScope = (): Scope => {
	let state: DehydratedScope = [{}, {}];

	const serveronly = new Map<TokenKey, Store<any>>();

	function hydrate(
		key: TokenKey,
		instance: Instance<{}>,
		serialized: Serialized[],
		iteration = 0,
	) {
		const server = state[1];
		const coupling = CouplingRegistry.get(instance);
		if (coupling) {
			const subjects = coupling.subjects;
			const sl = subjects.length;
			if (sl > 0)
				for (let i = 0; i < sl; i++) {
					const subject = subjects[i]!;
					if (isStore(subject)) {
						const configuration = StoreConfigurationsRegistry.get(subject)!;
						const serialization = configuration.serialization;
						if (serialization !== false) {
							let state: any;
							if (configuration.serveronly) {
								serveronly.set(`${key}.${iteration}`, subject);
								state = server[key]!;
								delete server[key];
							} else state = serialized[iteration]!;
							iteration++;
							subject(serialization ? serialization.deserialize(state) : state);
						}
					}
				}

			const instances = coupling.instances;
			const il = instances.length;
			if (il > 0)
				for (let i = 0; i < il; i++)
					hydrate(key, instances[i]!, serialized, iteration);
		}
	}

	const scope: Scope = {
		bind(key, instance) {
			const current = state[0][key];
			if (current) {
				hydration.hydrating = true;
				hydrate(key, instance, current);
				delete state[0][key];
				hydration.hydrating = false;
			}

			return instance;
		},
		read,
		hydrate(dehydrated) {
			state = dehydrated;

			const server = dehydrated[1];
			if (server) {
				const entries = Object.entries(server);
				if (entries.length > 0) {
					hydration.hydrating = true;
					for (let i = 0, length = entries.length; i < length; i++) {
						const entry = entries[i]!;
						const key = entry[0];
						if (serveronly.has(key)) {
							serveronly.get(key)!(entry[1]);
							delete server[key];
						}
					}
					hydration.hydrating = false;
				}
			}

			return scope;
		},
		dehydrate: () => [{}, {}],
	};

	return scope;
};
