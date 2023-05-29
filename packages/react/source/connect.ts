import {
	BindingScope,
	Resolution,
	useContainer,
	useResolution,
} from "./container";
import { useHydration } from "./hydration";
import { ResourceStatus } from "./resource";
import { useScope } from "./scope";
import { type Tokenized, type TokenKey } from "./token";
import { type AsyncFactory, type Factory } from "@cometa/core";
import { type Instance, uncouple } from "@cometa/core/internal";
import {
	type ComponentType,
	createContext,
	createElement,
	type FC,
	type FunctionComponent,
	type ReactNode,
	useContext,
	useEffect,
} from "react";

type ConnectHOC<ProviderProps extends {}> = <ComponentProps extends {}>(
	Component: ComponentType<ComponentProps>,
) => FunctionComponent<ComponentProps & ProviderProps>;

type ConnectConfiguration<Input extends {}, ProviderProps extends {}> = {
	key: (props: ProviderProps) => TokenKey;
	effecting?: boolean;
} & ({} extends Input
	? {
			input?: null;
	  }
	: {
			input: (props: ProviderProps) => Tokenized<Input>;
	  });

export function connect<
	Shape extends {},
	Input extends {},
	ProviderProps extends {},
>(
	factory: Factory<Shape, Input> | AsyncFactory<Shape, Input>,
	configuration: ConnectConfiguration<Input, ProviderProps>,
): [hook: () => Instance<Shape>, HOC: ConnectHOC<ProviderProps>] {
	const Context = createContext<Resolution<Instance<Shape>> | null>(null);

	const Provider: FC<{ children?: ReactNode } & ProviderProps> = (props) => {
		const key = configuration.key(props);
		const input = configuration.input;

		const scope = useScope();
		const container = useContainer();

		const resolution = container.bind<Instance<Shape>, Input>(key, {
			creator: factory,
			input: input ? () => input(props) : null,
			cleanup: uncouple,
			scope: BindingScope.Transient,
			pure: !configuration.effecting,
		});

		useEffect(resolution.take, [resolution]);

		if (scope) {
			useHydration(() => {
				const resolved = resolution.resource.resolve();
				if (resolved.status === ResourceStatus.Resolved)
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

	function hook(): Instance<Shape> {
		const context = useContext(Context);

		if (context === null) throw new Error("TODO: connect hook");

		return useResolution(context);
	}

	const HOC: ConnectHOC<ProviderProps> = (Component) => (props) =>
		createElement(Provider, props, createElement(Component, props));

	return [hook, HOC];
}
