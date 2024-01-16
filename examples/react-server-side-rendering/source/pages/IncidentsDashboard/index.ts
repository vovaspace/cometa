import { IncidentsDashboardComponent } from "./IncidentsDashboard.component";
import { withIncidentsDashboardPage } from "./IncidentsDashboard.provider";

export const IncidentsDashboard = withIncidentsDashboardPage(
	IncidentsDashboardComponent,
);
