import { isModel } from "@cometa/core/internal";

import { BindingScope, useContainer } from "./container";
import { useHydration } from "./hydration";
import { useScope } from "./scope";
import { createToken } from "./token";

export function relay(configuration) {
	const key = configuration.key;
	const Token = createToken(key);

	const RelayerProvider = (props) => {
		const value = props.value;

		const container = useContainer();
		container.bind(key, {
			instance: value,
			scope: BindingScope.Singleton,
		});

		const scope = useScope();
		if (scope) useHydration(() => isModel(value) && scope.bind(key, value));

		return props.children;
	};

	return [Token, RelayerProvider];
}
