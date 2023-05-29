import { useState } from "react";

const setup = () => ({ initial: true });

export function useInsertion(callback: () => void) {
	const cycle = useState(setup)[0];

	if (cycle.initial) {
		cycle.initial = false;
		callback();
	}
}
