import { BindingScope, useContainer } from "./container";
import { useHydration } from "./hydration";
import { useInsertion } from "./insertion";
import { useScope } from "./scope";
import { createToken, type Token, type TokenKey } from "./token";
import { isInstance } from "@cometa/core/internal";
import {
	type ComponentType,
	createElement,
	type FC,
	type FunctionComponent,
	type ReactElement,
	type ReactNode,
} from "react";

type RelayHOC<T> = (
	value: T,
) => <ComponentProps extends {}>(
	Component: ComponentType<ComponentProps>,
) => FunctionComponent<ComponentProps>;

interface RelayConfiguration {
	key: TokenKey;
}

const noop = () => {};

export function relay<T>(
	configuration: RelayConfiguration,
): [Token: Token<T>, HOC: RelayHOC<T>] {
	const key = configuration.key;
	const Token = createToken<T>(key);

	const RelayProvider: FC<{ children?: ReactNode; value: T }> = (props) => {
		const value = props.value;

		const container = useContainer();

		useInsertion(() =>
			container.bind(key, {
				creator: () => value,
				cleanup: noop,
				input: null,
				scope: BindingScope.Singleton,
				pure: true,
			}),
		);

		const scope = useScope();
		if (scope) useHydration(() => isInstance(value) && scope.bind(key, value));

		return props.children as ReactElement;
	};

	const RelayHOC: RelayHOC<T> = (instance) => (Component) => (props) =>
		createElement(
			RelayProvider,
			{ value: instance },
			createElement(Component, props),
		);

	return [Token, RelayHOC];
}
