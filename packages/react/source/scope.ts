import {
	createContext,
	type FunctionComponent,
	type ReactNode,
	useContext,
} from "react";

import { type Model, type Serialized, type Stream } from "@cometa/core";

import { createScope as createClientScope } from "./scope.client";
import { createScope as createServerScope } from "./scope.server";
import { type TokenKey } from "./token";

export type DehydratedScope = [
	current: Record<TokenKey, Serialized[]>,
	server: Record<TokenKey, Serialized>,
];

export interface Scope {
	bind: <M extends Model<{}>>(key: TokenKey, model: M) => M;
	read: <T>(source: Stream<T>) => T;
	hydrate: (dehydrated: DehydratedScope) => Scope;
	dehydrate: () => DehydratedScope;
}

export const createScope =
	typeof window === "undefined" ? createServerScope : createClientScope;

const ScopeContext = createContext<Scope | null>(null);

export const ScopeProvider: FunctionComponent<{
	children?: ReactNode;
	value: Scope | null;
}> = ScopeContext.Provider;

export const useScope = (): Scope | null => useContext(ScopeContext);
