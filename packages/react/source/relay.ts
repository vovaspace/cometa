import { FunctionComponent, PropsWithChildren } from "react";

import { isModel } from "@cometa/core/internal";

import { BindingScope, useContainer } from "./container";
import { useHydration } from "./hydration";
import { useScope } from "./scope";
import { createToken, Token, TokenKey } from "./token";

type RelayProvider<T> = FunctionComponent<PropsWithChildren<{ value: T }>>;

interface RelayConfiguration {
	key: TokenKey;
}

export function relay<T>(
	configuration: RelayConfiguration,
): [Token: Token<T>, Provider: RelayProvider<T>] {
	const key = configuration.key;
	const Token = createToken<T>(key);

	const RelayerProvider: RelayProvider<T> = (props) => {
		const value = props.value;

		const container = useContainer();
		container.bind(key, {
			instance: value,
			scope: BindingScope.Singleton,
		});

		const scope = useScope();
		if (scope) useHydration(() => isModel(value) && scope.bind(key, value));

		return props.children as JSX.Element;
	};

	return [Token, RelayerProvider];
}
