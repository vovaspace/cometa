import { createScope as createClientScope } from "./scope.client";
import { createScope as createServerScope } from "./scope.server";
import { type TokenKey } from "./token";
import { type Serialized, type Stream } from "@cometa/core";
import { type Instance } from "@cometa/core/internal";
import {
	createContext,
	createElement,
	type FC,
	type ReactNode,
	useContext,
} from "react";

export type DehydratedScope = [
	current: Record<TokenKey, Serialized[]>,
	server: Record<TokenKey, Serialized>,
];

export interface Scope {
	bind: <I extends Instance<{}>>(key: TokenKey, instance: I) => I;
	read: <T>(source: Stream<T>) => T;
	hydrate: (dehydrated: DehydratedScope) => Scope;
	dehydrate: () => DehydratedScope;
}

export const createScope =
	typeof window === "undefined" ? createServerScope : createClientScope;

const ScopeContext = createContext<Scope | null>(null);

export const ScopeProvider: FC<{
	children?: ReactNode;
	value: Scope | null;
}> = (props) => createElement(ScopeContext.Provider, props);

export const useScope = (): Scope | null => useContext(ScopeContext);
