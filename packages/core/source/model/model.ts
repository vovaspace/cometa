import { type Channel } from "../channel";
import { type Lifecycle, lifecycle } from "../lifecycle";
import { registry } from "../registry";
import { type Link } from "../scheduler";

export type ModelInstance = object;

export interface ModelFactory<Model extends ModelInstance, Dependencies> {
	(dependencies: Dependencies): Model;
}

export interface ModelAsynchronousFactory<
	Model extends ModelInstance,
	Dependencies,
> {
	(dependencies: Dependencies): Promise<Model>;
}

const push =
	<T>(list: T[]) =>
	<I extends T>(item: I): I => (list.push(item), item);

function resolve<Model extends ModelInstance>(
	model: Model,
	subjects: Channel<unknown>[],
	links: Link<any, any, any>[],
	models: ModelInstance[],
	current: Lifecycle,
) {
	registry.set(model, { subjects, links, models });
	lifecycle.current = current;
	return current.model(model);
}

export function defineModel<Model extends ModelInstance, Dependencies = void>(
	setup: (dependencies: Dependencies) => Promise<Model>,
): ModelAsynchronousFactory<Model, Dependencies>;

export function defineModel<Model extends ModelInstance, Dependencies = void>(
	setup: (dependencies: Dependencies) => Model,
): ModelFactory<Model, Dependencies>;

export function defineModel<Model extends ModelInstance, Dependencies = void>(
	setup: (dependencies: Dependencies) => Promise<Model> | Model,
):
	| ModelAsynchronousFactory<Model, Dependencies>
	| ModelFactory<Model, Dependencies> {
	// @ts-expect-error: Type 'Model' is not assignable to type 'Promise<Model>'.
	return function factory(dependencies) {
		const current = lifecycle.current;

		const subjects: Channel<unknown>[] = [];
		const links: Link<any, any, any>[] = [];
		const models: ModelInstance[] = [];

		lifecycle.current = {
			subject: push(subjects),
			link: push(links),
			model: push(models),
		};

		const instance = setup(dependencies);

		return instance instanceof Promise
			? instance.then((model) => resolve(model, subjects, links, models, current))
			: resolve(instance, subjects, links, models, current);
	};
}

export const model = defineModel;
