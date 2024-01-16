import { connect } from "@cometa/react";
import { IncidentsModuleToken } from "../../modules/Incidents";
import { createIncidentsDashboardPage, } from "./IncidentsDashboard.model";
export const [useIncidentsDashboardPage, withIncidentsDashboardPage] = connect(createIncidentsDashboardPage, {
    key: () => "pages/IncidentsDashboard",
    dependencies: () => ({ incidents: IncidentsModuleToken }),
});
