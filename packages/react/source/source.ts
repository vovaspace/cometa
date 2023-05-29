import { useScope } from "./scope";
import { type Stream } from "@cometa/core";
import { useCallback } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

export function useSource<T>(source: Stream<T>): T {
	const scope = useScope();

	const getServerSnapshot = useCallback(() => {
		if (scope === null) throw new Error("TODO");
		return scope.read(source);
	}, []);

	return useSyncExternalStore(source.subscribe, source.read, getServerSnapshot);
}
