import { isModel, uncouple } from "@cometa/core/internal";

export const cleanup = (instance: unknown) =>
	isModel(instance) && uncouple(instance);
