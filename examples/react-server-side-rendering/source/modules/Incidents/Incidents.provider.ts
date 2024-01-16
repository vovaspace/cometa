import { provide } from "@cometa/react";

import { createIncidentsModule } from "./Incidents.model";

export const [IncidentsModuleToken, withIncidentsModule] = provide(
	createIncidentsModule,
	{
		key: "modules/Incidents",
	},
);
