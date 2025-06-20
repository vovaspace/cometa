import {
	ComponentType,
	createContext,
	createElement,
	FunctionComponent,
	PropsWithChildren,
} from "react";

import { AbstractFactory, isModel } from "@cometa/core/internal";

import { cleanup } from "./cleanup";
import { BindingScope, Resolution, useContainer } from "./container";
import { useHydration } from "./hydration";
import { ResourceStatus } from "./resource";
import { useScope } from "./scope";
import { createToken, Tokenized, TokenKey } from "./token";

export type ProviderHOC<ProviderProps extends {}> = <ComponentProps extends {}>(
	Component: ComponentType<ComponentProps>,
) => FunctionComponent<ComponentProps & ProviderProps>;

type ProviderConfiguration<Dependencies extends {}, Props extends {}> = {
	key: TokenKey;
	pure?: boolean;
} & ({} extends Dependencies
	? {
			dependencies?: never;
	  }
	: {
			dependencies: (props: Props) => Tokenized<Dependencies>;
	  });

export function provide<Instance, Props extends {}, Dependencies extends {}>(
	factory: AbstractFactory<Instance | Promise<Instance>, Dependencies>,
	configuration: ProviderConfiguration<Dependencies, Props>,
) {
	const key = configuration.key;

	const Token = createToken(key);
	const Context = createContext<Resolution<Instance> | null>(null);

	function Provider(props: PropsWithChildren<Props>) {
		const dependencies = configuration.dependencies;

		const scope = useScope();
		const container = useContainer();

		const resolution = container.bind(key, {
			factory,
			dependencies: dependencies ? () => dependencies(props) : null,
			cleanup,
			scope: BindingScope.Resolution,
			pure: configuration.pure !== false,
		});

		if (scope) {
			useHydration(() => {
				const resolved = resolution.resource.resolve();
				if (
					resolved.status === ResourceStatus.Resolved &&
					isModel(resolved.instance)
				)
					scope.bind(key, resolved.instance);
			});
		}

		return createElement(
			Context.Provider,
			{
				value: resolution,
			},
			props.children,
		);
	}

	const HOC: ProviderHOC<Props> = (Component) => (props) =>
		createElement(Provider, props, createElement(Component, props));

	return [Token, HOC];
}
