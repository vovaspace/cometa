import { FunctionComponent, ReactNode } from "react";

import { AbstractFactory } from "@cometa/core";

import { Resource } from "./resource";
import { Token, Tokenized, TokenKey } from "./token";

export declare enum BindingScope {
	Resolution = 0,
	Singleton = 1,
}

type SingletonBinding<Instance> = {
	scope: BindingScope.Singleton;
	instance: Instance;
};

type ResolutionBinding<Instance, Dependencies extends {}> = {
	scope: BindingScope.Resolution;
	cleanup: (instance: Instance) => void;
	pure: boolean;
} & ({} extends Dependencies
	? {
			factory: AbstractFactory<Instance | Promise<Instance>>;
	  }
	: {
			factory: AbstractFactory<Instance | Promise<Instance>, Dependencies>;
			dependencies: () => Tokenized<Dependencies>;
	  });

type Binding<Instance, Dependencies extends {}> =
	| SingletonBinding<Instance>
	| ResolutionBinding<Instance, Dependencies>;

export interface Resolution<T> {
	resource: Resource<T>;
	take: () => () => void;
}

export interface Container {
	bind: <Instance, Dependencies extends {}>(
		key: TokenKey,
		binding: Binding<Instance, Dependencies>,
	) => Resolution<Instance>;
	unbind: (key: TokenKey) => void;
	resolve: <T>(key: TokenKey) => Resolution<T>;
}

export declare function createContainer(): Container;

export declare const ContainerProvider: FunctionComponent<{
	children?: ReactNode;
}>;

export declare function useContainer(): Container;

export declare function useResolution<T>(resolution: Resolution<T>): T;

export declare function useToken<T>(token: Token<T>): T;
