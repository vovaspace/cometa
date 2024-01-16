import { useCallback } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { Stream } from "@cometa/core";

import { useScope } from "./scope";

const empty: never[] = [];

export function useSource<T>(source: Stream<T>): T {
	const scope = useScope();

	const getServerSnapshot = useCallback(() => {
		if (scope === null) throw new Error("TODO");
		return scope.read(source);
	}, empty);

	return useSyncExternalStore(source.subscribe, source.read, getServerSnapshot);
}
