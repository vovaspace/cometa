import { connect } from "@cometa/react";

import { IncidentsModuleToken } from "../../modules/Incidents";
import {
	createIncidentsDashboardPage,
	IncidentsDashboardPage,
	IncidentsDashboardPageDependencies,
} from "./IncidentsDashboard.model";

export const [useIncidentsDashboardPage, withIncidentsDashboardPage] = connect<
	IncidentsDashboardPage,
	{},
	IncidentsDashboardPageDependencies
>(createIncidentsDashboardPage, {
	key: () => "pages/IncidentsDashboard",
	dependencies: () => ({ incidents: IncidentsModuleToken }),
});
