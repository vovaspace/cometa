import { type Stream } from "@cometa/core";
import {
	type Dispatcher,
	DispatchersRegistry,
	isStore,
	StoreConfigurationsRegistry,
} from "@cometa/core/internal";

export function read<T>(source: Stream<T>): T {
	if (isStore(source))
		return StoreConfigurationsRegistry.get(source)!.serialization === false
			? (source.initial as T)
			: source.read();

	const dispatcher = DispatchersRegistry.get(source) as Dispatcher<T>;

	const cold = dispatcher.cold;
	const original = cold.spy;
	cold.spy = read;

	const state = dispatcher.dry();

	cold.spy = original;
	return state;
}
