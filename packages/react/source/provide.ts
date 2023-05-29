import { BindingScope, type Resolution, useContainer } from "./container";
import { useHydration } from "./hydration";
import { ResourceStatus } from "./resource";
import { useScope } from "./scope";
import {
	createToken,
	type Token,
	type Tokenized,
	type TokenKey,
} from "./token";
import { isInstance, uncouple } from "@cometa/core/internal";
import {
	type ComponentType,
	createContext,
	createElement,
	type FC,
	type FunctionComponent,
	type ReactNode,
} from "react";

type ProvideHOC<ProviderProps extends {}> = <ComponentProps extends {}>(
	Component: ComponentType<ComponentProps>,
) => FunctionComponent<ComponentProps & ProviderProps>;

type ProvideConfiguration<Input extends {}, ProviderProps extends {}> = {
	key: TokenKey;
	effecting?: boolean;
} & ({} extends Input
	? {
			input?: null;
	  }
	: {
			input: (props: ProviderProps) => Tokenized<Input>;
	  });

export function provide<Result, Input extends {}, ProviderProps extends {}>(
	creator: (
		...parameters: {} extends Input ? [] : [input: Input]
	) => Result | Promise<Result>,
	configuration: ProvideConfiguration<Input, ProviderProps>,
): [Token: Token<Result>, HOC: ProvideHOC<ProviderProps>] {
	const key = configuration.key;

	const Token = createToken<Result>(key);
	const Context = createContext<Resolution<Result> | null>(null);

	const Provider: FC<{ children?: ReactNode } & ProviderProps> = (props) => {
		const input = configuration.input;

		const scope = useScope();
		const container = useContainer();

		const resolution = container.bind<Result, Input>(key, {
			creator,
			input: input ? () => input(props) : null,
			cleanup: (instance) => isInstance(instance) && uncouple(instance),
			scope: BindingScope.Resolution,
			pure: !configuration.effecting,
		});

		if (scope) {
			useHydration(() => {
				const resolved = resolution.resource.resolve();
				if (
					resolved.status === ResourceStatus.Resolved &&
					isInstance(resolved.result)
				)
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
	};

	const HOC: ProvideHOC<ProviderProps> = (Component) => (props) =>
		createElement(Provider, props, createElement(Component, props));

	return [Token, HOC];
}
