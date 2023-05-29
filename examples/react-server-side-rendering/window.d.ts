import { DehydratedScope, Scope } from "@cometa/react/scope";

declare global {
	interface Window {
		scope: Scope;
		state: DehydratedScope;
	}
}
