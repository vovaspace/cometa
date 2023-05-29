import { ContainerProvider } from "./container";
import { ScopeProvider } from "./scope";
import { type Scope } from "./scope";
import { createElement, type FC, type ReactNode } from "react";

export const CometaProvider: FC<{ children: ReactNode; scope?: Scope }> = (
	props,
) =>
	createElement(
		ScopeProvider,
		{ value: props.scope || null },
		createElement(ContainerProvider, null, props.children),
	);
