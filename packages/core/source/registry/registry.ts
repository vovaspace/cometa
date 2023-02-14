import { type Channel } from "../channel";
import { type ModelInstance } from "../model";
import { type Link, unlink } from "../scheduler";

export interface RegistryRecord {
	subjects: Channel<unknown>[];
	links: Link<any, any, any>[];
	models: ModelInstance[];
}

export const registry = new WeakMap<ModelInstance, RegistryRecord>();

export function purge(instance: ModelInstance): void {
	const record = registry.get(instance);

	if (record) {
		record.links.forEach(unlink);
		registry.delete(record);
	}
}
