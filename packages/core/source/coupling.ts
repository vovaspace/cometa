import { type Link, unlink } from "./link";
import { type Model } from "./model";
import { type Thread } from "./thread";

export interface Coupling {
	subjects: Thread<unknown>[];
	links: Link<any, any, any>[];
	models: Model<{}>[];
}

export const CouplingRegistry: WeakMap<Model<{}>, Coupling> = new WeakMap();

export function uncouple(model: Model<{}>): void {
	const coupling = CouplingRegistry.get(model);

	if (coupling) {
		coupling.links.forEach(unlink);
		CouplingRegistry.delete(model);
	}
}
