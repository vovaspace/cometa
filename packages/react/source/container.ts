import {
	createResource,
	type Resource,
	ResourceStatus,
	useResource,
} from "./resource";
import { isToken, type Token, type Tokenized, type TokenKey } from "./token";
import {
	createContext,
	createElement,
	type FC,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

export const enum BindingScope {
	Singleton,
	Transient,
	Resolution,
}

interface Binding<Result, Input extends {}> {
	creator: (
		...parameters: {} extends Input ? [] : [input: Input]
	) => Result | Promise<Result>;
	input: (() => Tokenized<Input>) | null;
	cleanup: (result: Result) => void;
	scope: BindingScope;
	pure: boolean;
}

export interface Resolution<T> {
	resource: Resource<T>;
	taken: number;
	take: () => () => void;
}

export interface Container {
	bind: <Result, Input extends {}>(
		key: TokenKey,
		binding: Binding<Result, Input>,
	) => Resolution<Result>;
	unbind: (key: TokenKey) => void;
	resolve: <T>(token: Token<T>) => Resolution<T>;
}

type Dependencies = (() => void)[];

interface Context {
	dependencies: Dependencies;
}

function detokenize(
	context: Context,
	container: Container,
	input: {},
): Promise<void>[] {
	const dependencies = context.dependencies;
	const promises: Promise<void>[] = [];

	const entries = Object.entries(input);
	for (let i = 0, length = entries.length; i < length; i++) {
		const entry = entries[i]!;
		const value = entry[1];

		if (isToken(value)) {
			const resolution = container.resolve(value);

			dependencies.push(resolution.take());

			const resolved = resolution.resource.resolve();

			if (resolved.status === ResourceStatus.Rejected) throw resolved.error;

			if (resolved.status === ResourceStatus.Resolved)
				// @ts-expect-error: type 'string' can't be used to index type 'Tokenized<I>'.
				input[entry[0]] = resolved.result;

			if (resolved.status === ResourceStatus.Pending)
				promises.push(
					resolved.promise.then((r) => {
						if (r.status === ResourceStatus.Rejected) throw r.error;
						if (r.status === ResourceStatus.Resolved)
							// @ts-expect-error: type 'string' can't be used to index type 'Tokenized<I>'.
							input[entry[0]] = resolved.result;
					}),
				);
		}
	}

	return promises;
}

function createResolution<Result, Input extends {}>(
	context: Context,
	container: Container,
	key: TokenKey,
	binding: Binding<Result, Input>,
): Resolution<Result> {
	const dependencies: Dependencies = [];

	const creator = binding.creator;
	const input = binding.input;
	const scope = binding.scope;
	const pure = binding.pure;

	const resource = createResource(() => {
		const current = context.dependencies;
		context.dependencies = dependencies;

		let result: Result | Promise<Result>;

		if (input) {
			const i = input();
			const promises = detokenize(context, container, i);

			const create = () => (creator as (input: Input) => Result)(i as Input);

			result = promises.length
				? Promise.all(promises).then(create)
				: pure
				? create()
				: Promise.resolve().then(create);

			if (
				typeof window !== "undefined" &&
				scope !== BindingScope.Singleton &&
				result instanceof Promise
			)
				result.then(purge);
		} else {
			result = pure
				? (creator as () => Result)()
				: Promise.resolve().then(creator as () => Result);
		}

		context.dependencies = current;
		return result;
	});

	let taken = 0;

	const cleanup = binding.cleanup;
	function reset() {
		const current = resource.current;

		if (taken === 0 && current.status !== ResourceStatus.Initial) {
			if (current.status === ResourceStatus.Resolved) cleanup(current.result);

			resource.reset();

			if (scope === BindingScope.Transient) container.unbind(key);

			if (dependencies.length) {
				let current: (() => void) | undefined;
				while ((current = dependencies.shift())) current();
			}
		}
	}

	function purge() {
		setTimeout(reset, 1_000);
	}

	const resolution: Resolution<Result> = {
		resource,
		taken,
		take() {
			taken++;
			return () => (taken--, scope !== BindingScope.Singleton && purge());
		},
	};

	return resolution;
}

function createContainer(): Container {
	const resolutions = new Map<TokenKey, Resolution<unknown>>();

	const context: Context = {
		dependencies: [],
	};

	const container: Container = {
		bind<Result, Input extends {}>(
			key: TokenKey,
			binding: Binding<Result, Input>,
		): Resolution<Result> {
			const current = resolutions.get(key) as Resolution<Result> | undefined;
			if (current) return current;

			const resolution = createResolution(context, container, key, binding);
			resolutions.set(key, resolution);
			return resolution;
		},
		unbind(key) {
			resolutions.delete(key);
		},
		resolve<T>(token: Token<T>): Resolution<T> {
			const current = resolutions.get(token.key);
			if (current) return current as Resolution<T>;

			throw new Error("TODO: resolve error");
		},
	};

	return container;
}

const ContainerContext = createContext<Container | null>(null);

export const ContainerProvider: FC<{ children?: ReactNode }> = (props) =>
	createElement(
		ContainerContext.Provider,
		{ value: useState<Container>(createContainer)[0] },
		props.children,
	);

export function useContainer(): Container {
	const context = useContext(ContainerContext);

	if (context === null) throw new Error("TODO: useContainer");

	return context;
}

export function useResolution<T>(resolution: Resolution<T>): T {
	useEffect(resolution.take, [resolution]);
	return useResource(resolution.resource);
}

export function useToken<T>(token: Token<T>): T {
	return useResolution(useContainer().resolve(token));
}
