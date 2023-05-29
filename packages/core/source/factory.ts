import { type Channel } from "./channel";
import { CouplingRegistry } from "./coupling";
import { type Lifecycle, lifecycle } from "./lifecycle";
import { type Link } from "./link";

export const InstanceSymbol = Symbol("cometa/instance");
export type Instance<T extends {}> = T & { [InstanceSymbol]: true };

export interface Factory<Shape extends {}, Input extends {} = {}> {
	(...parameters: {} extends Input ? [] : [input: Input]): Instance<Shape>;
}

export interface AsyncFactory<Shape extends {}, Input extends {} = {}> {
	(...parameters: {} extends Input ? [] : [input: Input]): Promise<
		Instance<Shape>
	>;
}

export type FactoryShape<F> = F extends AsyncFactory<infer T, any>
	? T
	: F extends Factory<infer T, any>
	? T
	: never;

export type FactoryInput<F> = F extends AsyncFactory<any, infer T>
	? T
	: F extends Factory<any, infer T>
	? T
 	: never;

const push =
	<T>(list: T[]) =>
	<I extends T>(item: I): I => (list.push(item), item);

function resolve<Shape extends {}>(
	shape: Shape,
	subjects: Channel<unknown>[],
	links: Link<any, any, any>[],
	instances: Instance<{}>[],
	current: Lifecycle,
): Instance<Shape> {
	(shape as Instance<Shape>)[InstanceSymbol] = true;
	CouplingRegistry.set(shape as Instance<Shape>, { subjects, links, instances });
	lifecycle.current = current;
	return current.instance(shape as Instance<Shape>);
}
function defineFactory<Shape extends {}, Input extends {} = {}>(
	setup: (
		...parameters: {} extends Input ? [] : [input: Input]
	) => Promise<Shape>,
): AsyncFactory<Shape, Input>;

function defineFactory<Shape extends {}, Input extends {} = {}>(
	setup: (...parameters: {} extends Input ? [] : [input: Input]) => Shape,
): Factory<Shape, Input>;

function defineFactory<Shape extends {}, Input extends {} = {}>(
	setup: (
		...parameters: {} extends Input ? [] : [input: Input]
	) => Promise<Shape> | Shape,
): AsyncFactory<Shape, Input> | Factory<Shape, Input> {
	// @ts-expect-error: Type 'Instance<Shape> | Promise<Instance<Shape>>' is not assignable to type 'Promise<Instance<Shape>>'.
	return function factory(input) {
		const current = lifecycle.current;

		const subjects: Channel<unknown>[] = [];
		const links: Link<any, any, any>[] = [];
		const instances: Instance<{}>[] = [];

		lifecycle.current = {
			subject: push(subjects),
			link: push(links),
			instance: push(instances),
		};

		const instance = input
			? // @ts-expect-error: Argument of type '[NonNullable<({} extends Input ? [] : [input: Input])[0]>]' is not assignable to parameter of type '{} extends Input ? [] : [input: Input]'.
			  setup(input)
			: // @ts-expect-error: Argument of type '[]' is not assignable to parameter of type '{} extends Input ? [] : [input: Input]'.
			  setup();

		return instance instanceof Promise
			? instance.then((result) =>
					resolve(result, subjects, links, instances, current),
			  )
			: resolve(instance, subjects, links, instances, current);
	};
}

export const factory = defineFactory;
