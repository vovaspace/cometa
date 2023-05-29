import { useCallback, useState } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

const setup = () => ({ initial: true });
const subscribe = () => () => {};
const snapshot = () => null;
const empty: [] = [];

export function useHydration(callback: () => void): void {
	const cycle = useState(setup)[0];

	const effect = useCallback(() => {
		if (cycle.initial) {
			cycle.initial = false;
			callback();
		}

		return null;
	}, empty);

	useSyncExternalStore(subscribe, snapshot, effect);
}
