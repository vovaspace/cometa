import { ComponentType, FunctionComponent } from "react";

import { AbstractFactory } from "@cometa/core";

import { Token, Tokenized, TokenKey } from "./token";

export type ProviderHOC<ProviderProps extends {}> = <ComponentProps extends {}>(
	Component: ComponentType<ComponentProps>,
) => FunctionComponent<ComponentProps & ProviderProps>;

type ProviderConfiguration<Dependencies extends {}, Props extends {}> = {
	key: TokenKey;
	pure?: boolean;
} & ({} extends Dependencies
	? {}
	: {
			dependencies: (props: Props) => Tokenized<Dependencies>;
	  });

export declare function provide<Instance, Props extends {}>(
	factory: AbstractFactory<Instance | Promise<Instance>>,
	configuration: ProviderConfiguration<{}, Props>,
): [Token: Token<Instance>, HOC: ProviderHOC<Props>];

export declare function provide<
	Instance,
	Props extends {},
	Dependencies extends {},
>(
	factory: AbstractFactory<Instance | Promise<Instance>, Dependencies>,
	configuration: ProviderConfiguration<Dependencies, Props>,
): [Token: Token<Instance>, HOC: ProviderHOC<Props>];
