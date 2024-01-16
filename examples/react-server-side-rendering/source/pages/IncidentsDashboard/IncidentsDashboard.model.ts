import { effect, model, store, Stream } from "@cometa/core";
import { link } from "@cometa/core/link";

import { Incident, IncidentsModule } from "../../modules/Incidents";

export interface IncidentsDashboardPage {
	list: Stream<Incident[]>;
}

export interface IncidentsDashboardPageDependencies {
	incidents: IncidentsModule;
}

export const createIncidentsDashboardPage = model<
	IncidentsDashboardPage,
	IncidentsDashboardPageDependencies
>(async ({ incidents }) => {
	const list = store<Incident[]>([]);

	const listIncidentsFx = effect<void, Incident[]>(incidents.listIncidentsFx);

	link({
		clock: { subject: listIncidentsFx.resulted },
		target: list,
	});

	console.log("before");
	await listIncidentsFx();
	console.log("after");

	return {
		list,
	};
});
