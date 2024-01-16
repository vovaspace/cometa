import {
	type ComponentType,
	createContext,
	createElement,
	type FunctionComponent,
	type ReactNode,
	useContext,
	useEffect,
} from "react";

import {
	AbstractFactory,
	AbstractFactoryDependencies,
	AbstractFactoryInstance,
} from "@cometa/core/internal";

import { cleanup } from "./cleanup";
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

type ConnectorConfiguration<
	Factory extends AbstractFactory<any, any>,
	Props extends {},
> = {
	key: (props: Props) => TokenKey;
	pure?: boolean;
} & ({} extends AbstractFactoryDependencies<Factory>
	? {
			dependencies?: (
				props: Props,
			) => Tokenized<AbstractFactoryDependencies<Factory>>;
	  }
	: {
			dependencies: (
				props: Props,
			) => Tokenized<AbstractFactoryDependencies<Factory>>;
	  });

type ConnectorHook<Instance> = () => Instance;

type ConnectorHOC<ProviderProps extends {}> = <ComponentProps extends {}>(
	Component: ComponentType<ComponentProps>,
) => FunctionComponent<ComponentProps & ProviderProps>;

type Connector<Factory extends AbstractFactory<any, any>> = <Props extends {}>(
	configuration: ConnectorConfiguration<Factory, Props>,
) => [
	hook: ConnectorHook<AbstractFactoryInstance<Factory>>,
	HOC: ConnectorHOC<Props>,
];

export const connect =
	<Factory extends AbstractFactory<any, any>>(
		factory: Factory,
	): Connector<Factory> =>
	<Props extends {}>(configuration: ConnectorConfiguration<Factory, Props>) => {
		const Context = createContext<Resolution<
			AbstractFactoryInstance<Factory>
		> | null>(null);

		const Provider: FunctionComponent<{ children?: ReactNode } & Props> = (
			props,
		) => {
			const key = configuration.key(props);
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

			useEffect(() => {
				const untake = resolution.take();
				return () => {
					untake();
					container.unbind(key);
				};
			}, [resolution]);

			if (scope) {
				useHydration(() => {
					const resolved = resolution.resource.resolve();
					if (resolved.status === ResourceStatus.Resolved)
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
		};

		const hook: ConnectorHook<AbstractFactoryInstance<Factory>> = () => {
			const context = useContext(Context);

			if (context === null) throw new Error("TODO: connect hook");

			return useResolution(context);
		};

		const HOC: ConnectorHOC<Props> = (Component) => (props) =>
			createElement(Provider, props, createElement(Component, props));

		return [hook, HOC];
	};
