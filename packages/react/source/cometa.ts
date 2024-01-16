import { createElement, type FunctionComponent, type ReactNode } from "react";

import { ContainerProvider } from "./container";
import { type Scope, ScopeProvider } from "./scope";

export const CometaProvider: FunctionComponent<{
	children?: ReactNode;
	scope?: Scope;
}> = (props) => {
	return createElement(
		ScopeProvider,
		{ value: props.scope || null },
		createElement(ContainerProvider, null, props.children),
	);
};
