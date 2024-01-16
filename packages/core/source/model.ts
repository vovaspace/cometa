import { CouplingRegistry } from "./coupling";
import { lifecycle } from "./lifecycle";

export const ModelSymbol = Symbol("cometa/model");

export type Model<Shape extends {}> = Shape & { [ModelSymbol]: true };

export type AbstractFactory<
	Instance,
	Dependencies extends {} = {},
> = {} extends Dependencies
	? (dependencies?: Dependencies) => Instance
	: (dependencies: Dependencies) => Instance;

export type AbstractFactoryInstance<F> = F extends AbstractFactory<infer I, any>
	? I
	: never;

export type AbstractFactoryDependencies<F> = F extends AbstractFactory<
	any,
	infer D
>
	? D
	: never;

export type ModelFactory<
	Shape extends {},
	Dependencies extends {} = {},
> = AbstractFactory<Model<Shape>, Dependencies>;

export type ModelFutureFactory<
	Shape extends {},
	Dependencies extends {} = {},
> = AbstractFactory<Promise<Model<Shape>>, Dependencies>;

export type ModelFactoryShape<F> = F extends ModelFutureFactory<infer S, any>
	? S
	: F extends ModelFactory<infer S, any>
	? S
	: never;

export type ModelFactoryDependencies<F> = F extends ModelFutureFactory<
	any,
	infer D
>
	? D
	: F extends ModelFactory<any, infer D>
	? D
	: never;

// @ts-expect-error
const push = (list) => (item) => (list.push(item), item);

// @ts-expect-error
function resolve(shape, subjects, links, models, current) {
	shape[ModelSymbol] = true;
	CouplingRegistry.set(shape, { subjects, links, models });
	lifecycle.current = current;
	return current.model(shape);
}

function defineModel<Shape extends {}, Dependencies extends {} = {}>(
	setup: AbstractFactory<Promise<Shape>, Dependencies>,
): ModelFutureFactory<Shape, Dependencies>;

function defineModel<Shape extends {}, Dependencies extends {} = {}>(
	setup: AbstractFactory<Shape, Dependencies>,
): ModelFactory<Shape, Dependencies>;

function defineModel<Shape extends {}, Dependencies extends {} = {}>(
	setup:
		| AbstractFactory<Promise<Shape>, Dependencies>
		| AbstractFactory<Shape, Dependencies>,
): ModelFutureFactory<Shape, Dependencies> | ModelFactory<Shape, Dependencies> {
	// @ts-expect-error
	return function factory(dependencies) {
		const current = lifecycle.current;

		// @ts-expect-error
		const subjects = [];
		// @ts-expect-error
		const links = [];
		// @ts-expect-error
		const models = [];

		lifecycle.current = {
			// @ts-expect-error
			subject: push(subjects),
			// @ts-expect-error
			link: push(links),
			// @ts-expect-error
			model: push(models),
		};

		// @ts-expect-error
		const instance = dependencies ? setup(dependencies) : setup();

		return instance instanceof Promise
			? instance.then((result) =>
					// @ts-expect-error
					resolve(result, subjects, links, models, current),
			  )
			: // @ts-expect-error
			  resolve(instance, subjects, links, models, current);
	};
}

export const model = defineModel;
