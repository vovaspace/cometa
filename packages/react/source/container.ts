import {
	createContext,
	createElement,
	type FunctionComponent,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";

import { type AbstractFactory } from "@cometa/core/internal";

import {
	createResource,
	Resource,
	ResourceStatus,
	useResource,
} from "./resource";
import { isToken, type Token, type Tokenized, type TokenKey } from "./token";

export enum BindingScope {
	Resolution,
	Singleton,
}

type SingletonBinding<Instance> = {
	scope: BindingScope.Singleton;
	instance: Instance;
};

type ResolutionBinding<Instance, Dependencies extends {}> = {
	scope: BindingScope.Resolution;
	factory: AbstractFactory<Instance | Promise<Instance>, Dependencies>;
	dependencies: (() => Tokenized<Dependencies>) | null;
	cleanup: (instance: Instance) => void;
	pure: boolean;
};

type Binding<Instance, Dependencies extends {}> =
	| SingletonBinding<Instance>
	| ResolutionBinding<Instance, Dependencies>;

export interface Resolution<T> {
	resource: Resource<T>;
	take: () => () => void;
	taken: number;
}

export interface Container {
	bind: <Instance, Dependencies extends {}>(
		key: TokenKey,
		binding: Binding<Instance, Dependencies>,
	) => Resolution<Instance>;
	unbind: (key: TokenKey) => void;
	resolve: <T>(key: TokenKey) => Resolution<T>;
}

function detokenize<Dependencies extends {}>(
	cleanups: (() => void)[],
	container: Container,
	dependencies: Tokenized<Dependencies>,
): Dependencies | Promise<Dependencies> {
	const promises = [];
	const output: Record<string, unknown> = {};

	const entries = Object.entries(dependencies);
	for (let i = 0, length = entries.length; i < length; i++) {
		const entry = entries[i]!;
		const value = entry[1];

		if (isToken(value)) {
			const resolution = container.resolve(value.key);

			cleanups.push(resolution.take());
			const resolved = resolution.resource.resolve();

			if (resolved.status === ResourceStatus.Rejected) throw resolved.error;

			if (resolved.status === ResourceStatus.Resolved)
				output[entry[0]] = resolved.instance;

			if (resolved.status === ResourceStatus.Pending)
				promises.push(
					resolved.promise.then((r) => {
						if (r.status === ResourceStatus.Rejected) throw r.error;
						if (r.status === ResourceStatus.Resolved) output[entry[0]] = r.instance;
					}),
				);
		}
	}

	return promises.length === 0
		? Promise.all(promises).then(() => output as Dependencies)
		: (output as Dependencies);
}

const noop = () => () => {};

function createResolution<Instance, Dependencies extends {}>(
	container: Container,
	binding: Binding<Instance, Dependencies>,
): Resolution<Instance> {
	const scope = binding.scope;

	if (scope === BindingScope.Singleton) {
		const instance = binding.instance;
		return {
			resource: createResource(() => instance, noop),
			take: noop,
			taken: Infinity,
		};
	}

	const dependencies = binding.dependencies;
	const factory = binding.factory;
	const pure = binding.pure;

	const cleanups: (() => void)[] = [];

	const resource = createResource(
		() => {
			if (dependencies) {
				const d = detokenize(cleanups, container, dependencies());
				return d instanceof Promise
					? d.then(factory)
					: pure
					? factory(d)
					: Promise.resolve().then(() => factory(d));
			}

			return pure
				? (factory as () => Instance)()
				: Promise.resolve().then(factory as () => Instance);
		},
		(instance) => {
			binding.cleanup(instance);

			let current;
			while ((current = cleanups.shift())) current();
		},
	);

	function cleanup() {
		if (resolution.taken === 0) resource.cleanup();
	}

	let timeout: NodeJS.Timeout;
	function purge() {
		resolution.taken--;
		clearTimeout(timeout);
		timeout = setTimeout(cleanup, 1_000);
	}

	const resolution: Resolution<Instance> = {
		resource,
		take: () => (resolution.taken++, purge),
		taken: 0,
	};

	return resolution;
}

export function createContainer(): Container {
	const resolutions: Record<TokenKey, Resolution<unknown> | null> = {};

	const container: Container = {
		bind<Instance, Dependencies extends {}>(
			key: TokenKey,
			binding: Binding<Instance, Dependencies>,
		): Resolution<Instance> {
			const current = resolutions[key];
			if (current) return current as Resolution<Instance>;

			const resolution = createResolution(container, binding);
			resolutions[key] = resolution;
			return resolution;
		},
		unbind(key) {
			const current = resolutions[key];
			if (current && current.taken === 0) resolutions[key] = null;
		},
		resolve<T>(key: TokenKey): Resolution<T> {
			const current = resolutions[key];
			if (current) return current as Resolution<T>;

			throw new Error("TODO: resolve error");
		},
	};

	return container;
}

const ContainerContext = createContext<Container | null>(null);

export const ContainerProvider: FunctionComponent<{ children?: ReactNode }> = (
	props,
) =>
	createElement(
		ContainerContext.Provider,
		{ value: useState(createContainer)[0] },
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
	return useResolution(useContainer().resolve(token.key));
}
