import { Event, event, factory, store, Store } from "@cometa/core";
import { link } from "@cometa/core/link";

export interface CoreModel {
	counter: Store<number>;
	sault: Store<string>;
	increased: Event<void>;
}

export const createCoreModel = factory<CoreModel>(() => {
	const counter = store(0);
	const sault = store("");

	const increased = event();

	link({
		clock: { subject: increased },
		source: { subject: counter },
		map: (_, source) => source + 1,
		target: counter,
	});

	return {
		counter,
		sault,
		increased,
	};
});
