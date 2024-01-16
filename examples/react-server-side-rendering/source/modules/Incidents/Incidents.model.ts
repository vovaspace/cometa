import { effect, Effect, model } from "@cometa/core";

import { Incident } from "./entities";
import { incidents } from "./Incidents.stub";

export interface IncidentsModule {
	listIncidentsFx: Effect<void, Incident[]>;
}

export const createIncidentsModule = model<IncidentsModule>(() => {
	const listIncidentsFx = effect<void, Incident[]>(
		() =>
			new Promise<Incident[]>((resolve) => {
				console.log("requested");
				setTimeout(() => {
					resolve(incidents);
				}, 2000);
			}),
	);

	console.log("`Incidents` module created.");

	return {
		listIncidentsFx,
	};
});
