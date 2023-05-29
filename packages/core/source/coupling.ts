import { type Channel } from "./channel";
import { type Instance } from "./factory";
import { type Link, unlink } from "./link";

export interface Coupling {
	subjects: Channel<unknown>[];
	links: Link<any, any, any>[];
	instances: Instance<{}>[];
}

export const CouplingRegistry: WeakMap<Instance<{}>, Coupling> = new WeakMap();

export function uncouple(instance: Instance<{}>): void {
	const coupling = CouplingRegistry.get(instance);

	if (coupling) {
		coupling.links.forEach(unlink);
		CouplingRegistry.delete(instance);
	}
}
