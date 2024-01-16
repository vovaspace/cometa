import { createContext, createElement } from "react";

import { isModel } from "@cometa/core/internal";

import { BindingScope, useContainer } from "./container";
import { useHydration } from "./hydration";
import { ResourceStatus } from "./resource";
import { useScope } from "./scope";
import { createToken } from "./token";

export function provide(factory, configuration) {
	const key = configuration.key;

	const Token = createToken(key);
	const Context = createContext(null);

	function Provider(props) {
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
				if (resolved.status === ResourceStatus.Resolved && isModel(resolved.result))
					scope.bind(key, resolved.result);
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

	const HOC = (Component) => (props) =>
		createElement(Provider, props, createElement(Component, props));

	return [Token, HOC];
}
