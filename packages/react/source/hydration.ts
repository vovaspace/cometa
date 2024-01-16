import { useState } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { context } from "@cometa/core/internal";

const subscribe = () => () => {};
const snapshot = () => null;

export function useHydration(callback: () => void): void {
	const effect = useState(() => {
		let initial = true;

		return () => {
			if (initial) {
				initial = false;
				context.current;
				callback();
			}

			return null;
		};
	})[0];

	useSyncExternalStore(subscribe, snapshot, effect);
}
